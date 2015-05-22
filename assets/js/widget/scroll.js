define(['$','util','animation','./scrollview'],function(require,exports,module) {
    var $=require('$'),
        util=require('util'),
        animation=require('animation'),
        ScrollView=require('./scrollview');

    var _start=function(e) {
        var point=e.touches[0],
            matrix=$(this).matrix();

        this._isStart=false;
        this._isStop=false;
        this._sy=point.pageY;
        this._sx=point.pageX;
        this._st=this.parentNode.scrollTop-matrix.ty;
    }

    var _move=function(e) {
        if(this._isStop) return;

        var point=e.touches[0],
            deltaY=point.pageY-this._sy,
            deltaX=point.pageX-this._sx;

        if(!this._isStart) {
            this._isStart=true;
            if(Math.abs(deltaX)>Math.abs(deltaY)) {
                this._isStop=true;
                return;
            }
        }

        var $this=$(this),
            matrix=$this.matrix(),
            scrollTop=this.parentNode.scrollTop-matrix.ty;

        if((this.parentNode.scrollTop==0)&&deltaY>0) {
            this._refreshAgain=true;
            this._isLoading=true;
            this._ty= -(this._st-deltaY*.5);
            $this.css({ '-webkit-transform': 'translate(0px,'+this._ty+'px) translateZ(0)' });

            if(this._ty>70) {
                this.$refresh.html('释放刷新');
            } else {
                this.$refresh.html('下拉刷新');
            }
            return false;
        }
    }

    var _end=function(e) {
        var self=this;

        if(this._isLoading) {
            var point=e.changedTouches[0],
                $this=$(this),
                from=this._ty,
                end=from>70?50:0,
                y;

            this._isLoading=false;

            animation.animate(function(d) {
                y=from+(end-from)*d;

                $this.css({
                    '-webkit-transform': 'translate(0px,'+y+'px) translateZ(0)'
                });
            },300,'ease',function() {
                self._refreshAgain=false;
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
        var el=this,
            point=e.touches[0],
            now= +new Date;

        el.__sy=el.__pointY=el.__startY=point.pageY;
        el.__sx=point.pageX;
        el._isMomentum=false;
        el.__isMoved=false;
        el.__isStart=false;
        el.__isScroll=now-el.__timestamp<=16;
    };

    var touchMove=function(e) {
        var el=this,
            point=e.touches[0],
            pointY=point.pageY,
            deltaY=point.pageY-el.__sy,
            deltaX=point.pageX-el.__sx;

        el.__oPointY=el.__pointY;
        el.__pointY=pointY;
        el.__isMoved=true;

        if(!el.__isStart) {
            el.__isStart=true;
            if(!el.options.hScroll&&util.android&&Math.abs(deltaX)>Math.abs(deltaY)) {
                return false;
            }
        }
    };

    var scrollStop=function(el) {
        if(el._stm) clearTimeout(el._stm);
        el._stm=setTimeout(function() {
            el._stm=null;
            $(el).trigger('scrollStop',[0,el.scrollTop]);
        },80);
    }

    var scroll=function() {
        var el=this;

        el.__isScroll=true;
        el.__timestamp= +new Date;

        if(el._isMomentum||util.android) {
            scrollStop(el);
        }
    };

    var touchEnd=function(e) {
        var el=this,
            $el=$(el),
            pointY=e.changedTouches[0].pageY;

        if(util.ios&&Math.abs(el.__oPointY-pointY)<5) {
            el._isStop=false;
            scrollStop(el);
            el._isMomentum=false;

        } else
            el._isMomentum=true;

        e.cancelTap=el.__isScroll;
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
            scroller.__timestamp=0;

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
                            if(self._refreshAgain) return;
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
