define(function(require,exports,module) {
    var $=require('$'),
        util=require('util'),
        animation=require('animation'),
        ScrollView=require('./scrollview');

    var _start=function(e) {
        var self=this;

        if(!self.scrollView&&self.parentNode.scrollTop!=0) {
            self.isStop=true;
        } else {
            var point=e.touches[0],
                matrix=self.$.matrix();

            self.isStart=false;
            self.isStop=false;
            self.isMoved=false;
            self.sy=self.oy=self.pointY=point.pageY;
            self.sx=point.pageX;
            self.st=matrix.ty;
            self.isLoading=self.isDataLoading;
        }
    }

    var _move=function(e) {
        var self=this;

        if(self.isStop) return;

        var point=e.touches[0],
            deltaY=point.pageY-self.sy,
            deltaX=point.pageX-self.sx;

        self.oy=self.pointY;
        self.pointY=point.pageY;

        if(!self.isStart) {
            self.isStart=true;
            if(Math.abs(deltaX)>Math.abs(deltaY)) {
                self.isStop=true;
                return;
            }
        }

        var scrollView=self.scrollView;

        if((scrollView?scrollView.y<=0:self.parentNode.scrollTop==0)&&deltaY>0) {

            self.isMoved=true;
            self.refreshAgain=true;
            self.ty=self.st+deltaY*.5;

            self.$.css({ '-webkit-transform': 'translate(0px,'+self.ty+'px) translateZ(0)' });

            if(!this.isLoading) {
                self.$refresh.html(self.ty>70?'释放刷新':'下拉刷新');
            }
        } else {
            self.isStop=true;
        }
        return self.isStop;
    }

    var _end=function(e) {
        var self=this;

        if(self.isMoved) {
            var point=e.changedTouches[0],
                from=self.ty,
                end=from>70?50:0,
                ty,
                dy=self.oy-point.pageY,
                bounce=function() {

                    self.$.animate({
                        '-webkit-transform': 'translate(0px,'+end+'px) translateZ(0)'

                    },300+dy* -1,'cubic-bezier(.3,.78,.43,.95)',function() {
                        self.refreshAgain=false;
                        if(!self.isLoading&&end!=0) {
                            self.isLoading=self.isDataLoading=true;
                            self.$refresh.html('<div class="dataloading"></div>');
                            self.$.triggerHandler('refresh');
                        }
                    });
                };

            self.isMoved=false;

            if(self.isLoading&&!self.isDataLoading) {
                end=0;
            }

            if(dy< -5) {
                self.$.animate({
                    '-webkit-transform': 'translate(0px,'+(from-dy*1.5)+'px) translateZ(0)'

                },dy* -1.5,'cubic-bezier(.3,.78,.43,.95)',bounce);
            }
            else bounce();


            return false;
        }
    }

    var _refresh=function() {
        var self=this,
            complete=function() {
                self.$refresh.html('下拉刷新');
                self.isDataLoading=false;
                if(self.refreshAgain) return;

                var from=self.$.matrix().ty,
                    end=Math.max(from-50,0);

                self.$.animate({
                    '-webkit-transform': 'translate(0px,'+end+'px) translateZ(0)'
                },400,'cubic-bezier(.3,.78,.43,.95)');
            };

        self.options.refresh(complete,function(error) {
            sl.tip(error);
            complete();
        });
    };

    var touchStart=function(e) {
        var el=this,
            point=e.touches[0],
            now= +new Date;

        el.__sy=el.__pointY=el.__startY=point.pageY;
        el.__sx=point.pageX;
        el.__hasMomentum=false;
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
            if(!el.options.hScroll&&Math.abs(deltaX)>Math.abs(deltaY)) {
                return false;
            }
        }

        if(util.ios&&el.$refresh&&el.scrollTop<0) {
            el.isRefresh=el.scrollTop< -70;
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

        if(el.__hasMomentum||util.android) {
            scrollStop(el);
        }
    };

    var touchEnd=function(e) {
        var el=this,
            $el=$(el),
            pointY=e.changedTouches[0].pageY,
            dy=Math.abs(el.__oPointY-pointY);

        if(util.ios&&dy<5) {
            el._isStop=false;
            scrollStop(el);
            el.__hasMomentum=false;

        } else
            el.__hasMomentum=true;

        e.cancelTap=el.__isScroll;
        if(el.isRefresh) {
            el.isRefresh=false;
            el.$refresh.html('<div class="dataloading"></div>');
            el.$scroller.css({ '-webkit-transform': 'translate(0px,50px) translateZ(0)' }).triggerHandler('refresh');
        }
    };

    exports.bind=function(selector,options) {
        options={
            useScroll: false,
            refresh: function(resolve,reject) {
                setTimeout(function() {
                    reject('出错啦');
                },1000);
            }
        }
        //<--debug
        //options.refresh=false;
        //debug-->

        var result=[];

        (typeof selector==='string'?$(selector):selector).each(function() {
            var $el=$(this),
                scrollView;

            if(options&&options.useScroll||util.android&&parseFloat(util.osVersion<=2.3)) {
                scrollView=new ScrollView(this,options);
                result.push(scrollView);
            }

            else {
                this.__timestamp=0;

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
                scroller.$=$scroller;
                scroller.options=options;

                if(scrollView) scroller.scrollView=scrollView;

                $scroller.css({ marginTop: -50 })
                    .prepend($refresh)
                    .on('touchstart',_start)
                    .on('touchmove',_move)
                    .on('touchend',_end)
                    .on('refresh',_refresh);

                this.$refresh=$refresh;
                this.$scroller=$scroller;

            }

        });

        return result;
    };

});
