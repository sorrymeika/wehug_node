define(['$','util','./../tween','./scrollview'],function(require,exports,module) {
    var $=require('$'),
        util=require('util'),
        tween=require('./../tween'),
        ScrollView=require('./scrollview');

    function _start(e) {
        var point=e.touches[0],
            matrix=$(this).matrix();

        this._sy=point.pageY;
        this._st=this.parentNode.scrollTop-matrix.ty;
    }

    function _move(e) {
        var point=e.touches[0],
            deltaY=point.pageY-this._sy,
            $this=$(this),
            matrix=$this.matrix(),
            scrollTop=this.parentNode.scrollTop-matrix.ty;

        if(scrollTop<=0&&deltaY>0) {
            this._isRefreshStart=true;
            this._rY=(this._st-deltaY)* -.5;
            $this.css({ '-webkit-transform': 'translate(0px,'+this._rY+'px) translateZ(0)' });
            return false;

        } else {
            this._rY= -(this._st-deltaY);
            $this.css({ '-webkit-transform': 'translate(0px,'+this._rY+'px) translateZ(0)' });
            this._isRefreshStart=false;
        }
    }

    function _end(e) {
        if(this._isRefreshStart) {
            var point=e.changedTouches[0],
                $this=$(this),
                from=this._rY,
                end=from>40?40:0,
                y;

            this._isRefreshStart=false;

            tween.animate(function(d) {
                y=from+(end-from)*d;

                $this.css({ '-webkit-transform': 'translate(0px,'+y+'px) translateZ(0)' });
            },200);

            return false;
        }
    }

    var iosStart=function(e) {
        if(this._scrollTop!==this.scrollTop) {
            this._scrollTop=this.scrollTop;
            this._isTouchStop=true;
        }
    };

    var iosEnd=function(e) {
        if(this._isTouchStop) {
            this._isTouchStop=false;
            return false;
        }
    };

    var scrollStop=function() {
        var that=this;
        if(that._stm) clearTimeout(that._stm);
        that._stm=setTimeout(function() {
            //for ios
            that._scrollTop=that.scrollTop;

            $(that).trigger('scrollStop');
        },80);
    };

    exports.bind=function(selector,options) {
        //<--debug
        options={
            useScroll: true,
            refresh: false
        }
        //debug-->

        var $el=typeof selector==='string'?$(selector):selector;
        var result=[];

        $el.on('scroll',scrollStop);

        if(options&&options.useScroll||util.android&&parseFloat(util.osVersion<=2.3)) {
            $el.each(function() {
                result.push(new ScrollView(this,options));
            });
        }

        else if(util.ios) {
            $el.css({
                '-webkit-overflow-scrolling': 'touch',
                height: '100%',
                overflowY: 'scroll'
            })
            .on('touchstart',iosStart)
            .on('touchend',iosEnd).each(function() {
                this._scrollTop=0;
            }),
            result.push({
                destory: function() {
                    $el.off('touchstart',iosStart).off('touchend',iosEnd).off('scroll',scrollStop);
                }
            });
        }

        else if(util.android) {
            $el.css({ overflowY: 'scroll' });
        }

        if(options&&options.refresh) {

            var $scroller=$el.children('.sl_scroller');
            if(!$scroller.length) $scroller=ScrollView.addScroller($el);

            $scroller.css({ marginTop: -40 })
                .prepend('<div style="height:40px;background:#ddd;text-align:center;line-height:40px;">下拉刷新</div>')
                .on('touchstart',_start)
                .on('touchmove',_move)
                .on('touchend',_end);
        }

        return result;
    };

});
