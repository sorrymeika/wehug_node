define(['$','util','../core/base'],function(require) {
    var $=require('$');
    var util=require('util');
    var sl=require('../core/base');
    var slice=Array.prototype.slice;

    var Tip=function(text) {
        this._tip=$('<div class="tip" style="display:none">'+(text||'')+'</div>').appendTo(document.body);
    };

    Tip.prototype={
        _hideTimer: null,
        _clearHideTimer: function() {
            var me=this;
            if(me._hideTimer) {
                clearTimeout(me._hideTimer);
                me._hideTimer=null;
            }
        },
        _visible: false,
        show: function(msec) {

            var me=this,
                tip=me._tip;

            me._clearHideTimer();

            if(msec)
                me._hideTimer=setTimeout(function() {
                    me._hideTimer=null;
                    me.hide();
                },msec);

            if(me._visible) {
                return;
            }
            me._visible=true;

            tip.css({
                '-webkit-transform': 'scale(0.2,0.2)',
                display: 'block',
                visibility: 'visible',
                opacity: 0
            }).animate({
                scale: "1,1",
                opacity: 0.9
            },200,'ease-out');

            return me;
        },
        hide: function() {
            var me=this,
                tip=me._tip;

            if(!me._visible) {
                return;
            }
            me._visible=false;

            tip.animate({
                scale: ".2,.2",
                opacity: 0
            },200,'ease-in',function() {
                tip.hide().css({
                    '-webkit-transform': 'scale(1,1)'
                })
            });

            me._clearHideTimer();
            return me;
        },
        msg: function(msg) {
            var me=this,
                tip=me._tip;

            tip.html(msg).css({
                '-webkit-transform': 'scale(1,1)',
                '-webkit-transition': ''
            });

            if(tip.css('display')=='none') {
                tip.css({
                    visibility: 'hidden',
                    display: 'block',
                    marginLeft: -1000
                });
            }

            tip.css({
                marginTop: -1*tip.height()/2,
                marginLeft: -1*tip.width()/2
            });
            return me;
        }
    };

    var t=new Tip();
    var tip=function(msg) {
        if(msg==='this')
            return t;
        else if($.inArray(['msg','show','hide'],msg)>=0) {
            var args=slice.apply(arguments);

            t[args.shift()].apply(t,args);
        } else
            t.msg(msg).show(2000);
    }

    sl.Tip=Tip;
    sl.tip=tip;

    return tip;
});