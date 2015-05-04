define(['$','./../tween','./../touch','./../event'],function(require,exports,module) {
    var $=require('$'),
        event=require('./../event'),
        tween=require('./../tween'),
        Touch=require('./../touch');

    var addScroller=function($el) {
        return $('<div class="sl_scroller" style="width:100%;-webkit-transform: translate(0px,0px) translateZ(0);"></div>').append($el.children()).appendTo($el.html('').css({ overflow: 'hidden' }));
    };

    var ScrollView=function(el,options) {

        options=$.extend({
            ease: 'ease',
            hScroll: true,
            vScroll: true
        },options)

        var that=this;

        that.options=options;

        that.$el=$(el);
        that.el=that.$el[0];

        that.$scroller=addScroller(that.$el);
        that.scroller=that.$scroller[0];

        that.touch=new Touch(that.$el,options)
            .on('init',that.init,that)
            .on('start',that.start,that)
            .on('starttimereset',that.resetStartTime,that)
            .on('move',that.move,that)
            .on('beforemomentum',that.beforeMomentum,that)
            .on('momentum',that.momentum,that);
    }

    ScrollView.prototype={
        off: event.off,
        on: event.on,
        trigger: event.trigger,
        init: function() {
            var matrix=this.$scroller.matrix();

            this.x= -matrix.tx;
            this.minX=0;

            this.y= -matrix.ty;
            this.minY=0;
        },
        start: function() {
            var that=this,
                touch=that.touch;

            that.wrapperW=that.el.clientWidth;
            that.scrollW=that.scroller.offsetWidth;
            that.maxX=Math.max(that.scrollW-that.wrapperW,0);
            that._startLeft=that.startLeft=that.x

            that.wrapperH=that.el.clientHeight;
            that.scrollH=that.scroller.offsetHeight;
            that.maxY=Math.max(that.scrollH-that.wrapperH,0);
            that._startTop=that.startTop=that.y;

            if((!that.options.hScroll||that.wrapperW>=that.scrollW)&&touch.isDirectionX||(!that.options.vScroll||that.wrapperH>=that.scrollH)&&touch.isDirectionY) {
                touch.stop();
                return;
            }
        },
        resetStartTime: function() {
            if(this.options.hScroll) {
                this.startLeft=this.startLeft+this.touch.deltaX;
                this._startLeft=this.x;
            }

            if(this.options.vScroll) {
                this.startTop=this.startTop+this.touch.deltaY;
                this._startTop=this.y;
            }

        },
        move: function() {
            if(this.options.hScroll) {
                var newX=this.startLeft+this.touch.deltaX;
                if(newX<this.minX||newX>this.maxX) {
                    if(this.options.vScroll) newX=newX<this.minX?this.minX:this.maxX;
                    else newX=newX<this.minX?newX+(this.minX-newX)/2:(newX+(this.maxX-newX)/2);
                }
                this.x=newX;
            }

            if(this.options.vScroll) {
                var newY=this.startTop+this.touch.deltaY;
                if(newY<this.minY||newY>this.maxY) {
                    newY=newY<this.minY?newY+(this.minY-newY)/2:(newY+(this.maxY-newY)/2);
                }
                this.y=newY;
            }

            this.$scroller.css({ '-webkit-transform': 'translate('+(-this.x)+'px,'+(-this.y)+'px) translateZ(0)' });

        },
        beforeMomentum: function() {
            this.touch.addMomentumOptions(this._startLeft,this.x,this.minX,this.maxX,this.wrapperW,this.divisorX)
                .addMomentumOptions(this._startTop,this.y,this.minY,this.maxY,this.wrapperH);
        },
        momentum: function(e,a,b) {

            this.x=a.current;
            this.y=b.current;
            this.$scroller.css({ '-webkit-transform': 'translate('+(-this.x)+'px,'+(-this.y)+'px) translateZ(0)' });
        },
        destory: function() {
            this.touch.destory();
        }
    };

    ScrollView.addScroller=addScroller;

    module.exports=ScrollView;
});
