define(function (require,exports,module) {

    var Page=require('./page'),
        util=require('util'),
        Scroll=require('../widget/scroll'),
        slice=Array.prototype.slice;

    var Activity=Page.extend({
        toggleAnim: 'def',

        onHtmlLoad: function () {
            var that=this;

            if(!that.swipeRightBackAction) {
                var $btnBack=that.$('header [data-back]');
                if($btnBack.length) {
                    that.swipeRightBackAction=$btnBack.attr('data-back')||'/';
                }
            }
            that._scrolls=Scroll.bind(that.$('.scrollview'));
        },

        onLoad: util.noop,

        initialize: function () {
            this.on('Create',this.onHtmlLoad);
            this.one('Show',this.onLoad);
            this.on('Destroy',this._onDestroy);

            Page.prototype.initialize.apply(this,arguments);
        },
        _onDestroy: function () {
            if(this._scrolls) $.each(this._scrolls,function (i,scroll) {
                scroll.destory();
            });
            this.application.remove(this.url);
        },

        isExiting: false,
        startExit: function () {
            var that=this;
            if(that.isExiting) return;
            that.isExiting=true;
            var application=that.application;
            if(application.activeInput) {
                application.activeInput.blur();
                application.activeInput=null;
            }
            that.$el.removeClass('active');
            application.mask.show();
        },

        finishEnterAnimation: function () {
            var that=this;
            that.application.mask.hide();

            that.isExiting=false;
            that.then(function () {
                that.$el.addClass('active');
                that.trigger('Show');
            });
        },
        //onShow后才可调用
        redirect: function (url) {
            var that=this,
                application=that.application;

            application.get(url,function (activity,route) {
                activity.el.className=activity.className+' active';
                application.$el.append(activity.$el);
                application._currentActivity=activity;
                that.$el.remove();
                that.trigger('Pause');

                activity.then(function () {
                    activity.trigger('Resume');
                    activity.trigger('Show');
                });
            });
        },

        prompt: function (title,val,fn,target) {
            target=typeof fn!=='function'?fn:target;
            fn=typeof val==='function'?val:fn;
            val=typeof val==='function'?'':val;

            !this._prompt&&(this._prompt=this.createDialog({
                content: '<input type="text" class="prompt-text" />',
                buttons: [{
                    text: '取消',
                    click: function () {
                        this.hide();
                    }
                },{
                    text: '确认',
                    click: function () {
                        this.hide();
                        this.ok&&this.ok(this.$('.prompt-text').val());
                    }
                }]
            }));

            var prompt=this._prompt;

            prompt.title(title||'请输入').show(target);
            prompt.$('.prompt-text').val(val).focus();
            prompt.ok=$.proxy(fn,this);
        },

        createDialog: function (options) {
            var that=this;
            var dialog=new Dialog(options);

            that.bindQueryAction('dialog',dialog,{
                show: 'show',
                "": 'hide'
            });

            return dialog;
        },

        forward: function (url,duration,toggleAnim) {
            this.application.forward(url,duration,toggleAnim);
        },

        back: function (url,duration,toggleAnim) {
            this.application.back(url,duration,toggleAnim);
        }
    });

    return Activity;
});
