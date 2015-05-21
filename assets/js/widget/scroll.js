define(['$','util','animation','./scrollview'],function(require,exports,module) {
    var $=require('$'),
        util=require('util'),
        animation=require('animation'),
        ScrollView=require('./scrollview');

    function _start(e) {
        var point=e.touches[0],
            $this=$(this),
            matrix=$this.matrix();

        this._isTouchStart=false;
        this._isTouchStop=false;
        this._sy=point.pageY;
        this._sx=point.pageX;
        this._st=this.parentNode.scrollTop-matrix.ty;
    }

    function _move(e) {
        if(this._isTouchStop) return;

        var point=e.touches[0],
            deltaY=point.pageY-this._sy,
            deltaX=point.pageX-this._sx;

        if(!this._isTouchStart) {
            this._isTouchStart=true;
            if(Math.abs(deltaX)>Math.abs(deltaY)) {
                this._isTouchStop=true;
                return;
            }
        }

        var $this=$(this),
            matrix=$this.matrix(),
            scrollTop=this.parentNode.scrollTop-matrix.ty;

        if((this.parentNode.scrollTop==0)&&deltaY>0) {
            this.__refreshAgain=true;
            this._isRefreshStart=true;
            this._rY= -(this._st-deltaY*.5);
            $this.css({ '-webkit-transform': 'translate(0px,'+this._rY+'px) translateZ(0)' });

            if(this._rY>70) {
                this.$refresh.html('松手刷新');
            } else {
                this.$refresh.html('下拉刷新');
            }
            return false;
        }
    }

    function _end(e) {
        var self=this;

        if(this._isRefreshStart) {
            var point=e.changedTouches[0],
                $this=$(this),
                from=this._rY,
                end=from>70?50:0,
                y;

            this._isRefreshStart=false;

            animation.animate(function(d) {
                y=from+(end-from)*d;

                $this.css({
                    '-webkit-transform': 'translate(0px,'+y+'px) translateZ(0)'
                });
            },300,'ease',function() {
                self.__refreshAgain=false;
                if(!self.__refreshing) {
                    self.__refreshing=true;

                    self.$refresh.html('<div class="dataloading"></div>');

                    $this.triggerHandler('refresh');
                }
            });

            return false;
        }
    }

    var touchStart=function(e) {
        var that=this,
            point=e.touches[0];

        that.__sy=that.__pointY=that.__startY=point.pageY;
        that.__sx=point.pageX;
        that._isMomentum=false;
        that.__isMoved=false;
        that.__isStart=false;

        if(this._scrollTop!==this.scrollTop) {
            this._scrollTop=this.scrollTop;
            this._isTouchStop=true;

        } else {
            this._isTouchStop=false;
        }
    };

    var touchMove=function(e) {
        var that=this,
            point=e.touches[0],
            pointY=point.pageY,
            deltaY=point.pageY-that.__sy,
            deltaX=point.pageX-that.__sx;

        if(!that.__isStart) {
            that.__isStart=true;
            if(!that.options.hScroll&&Math.abs(deltaX)>Math.abs(deltaY)) {
                return false;
            }
        }

        that.__oPointY=that.__pointY;
        that.__pointY=pointY;
    };

    var touchEnd=function(e) {
        var that=this,
            $el=$(that),
            pointY=e.changedTouches[0].pageY;

        if(Math.abs(that.__oPointY-pointY)<5) {
            that._isTouchStop=false;
            scrollStop(that);
            that._isMomentum=false;

        } else
            that._isMomentum=true;

        if(this._isTouchStop) {
            this._isTouchStop=false;
            return false;
        }
    };

    var scrollStop=function(that) {
        if(that._stm) clearTimeout(that._stm);
        that._stm=setTimeout(function() {
            that._scrollTop=that.scrollTop;
            $(that).trigger('scrollStop',[0,that.scrollTop]);
        },100);
    }

    var scroll=function() {
        if(this._isMomentum||util.android) {
            scrollStop(this);
        }
    };

    exports.bind=function(selector,options) {
        //<--debug
        options={
            useScroll: false,
            refresh: function(resolve,reject) {
                setTimeout(function() {
                    reject('出错啦');
                },1000);
            }
        }
        //debug-->

        var $el=typeof selector==='string'?$(selector):selector;
        var result=[];

        if(options&&options.useScroll||util.android&&parseFloat(util.osVersion<=2.3)) {
            $el.each(function() {
                result.push(new ScrollView(this,options));
            });
        }

        else {
            if(util.ios) {
                $el.css({
                    '-webkit-overflow-scrolling': 'touch',
                    height: '100%',
                    overflowY: 'scroll'
                })
            }
            else if(util.android) {
                $el.css({ overflowY: 'scroll' });
            }
            $el.on('scroll',scroll)
                .on('touchstart',touchStart)
                .on('touchmove',touchMove)
                .on('touchend',touchEnd)
                .each(function() {
                    this._scrollTop=0;
                    this.options=$.extend({
                        hScroll: false
                    },options);
                }),
                result.push({
                    destory: function() {
                        $el.off('touchstart',touchStart)
                            .off('touchmove',touchMove)
                            .off('touchend',touchEnd)
                            .off('scroll',scroll);
                    }
                });
        }

        if(options&&options.refresh) {

            var $scroller=$el.children('.sl_scroller'),
                $refresh=$('<div class="refresh" style="height:50px;text-align:center;line-height:50px;">下拉刷新</div>');

            if(!$scroller.length) $scroller=ScrollView.addScroller($el);

            var scroller=$scroller[0];
            scroller.$refresh=$refresh;

            $scroller.css({ marginTop: -50 })
                .prepend($refresh)
                .on('touchstart',_start)
                .on('touchmove',_move)
                .on('touchend',_end)
                .on('refresh',function() {
                    var self=this,
                        $this=$(self),
                        complete=function() {
                            self.__refreshing=false;
                            if(self.__refreshAgain) return;
                            $this.animate({
                                '-webkit-transform': 'translate(0px,0px)'
                            },450,'cubic-bezier(.3,.78,.43,.95)');
                        };

                    options.refresh(complete,function(error) {
                        self.$refresh.html(error);

                        setTimeout(function() {
                            complete();
                        },1000);
                    });
                });
        }

        return result;
    };

});
