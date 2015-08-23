define(function (require, exports, module) {

    var Page = require('./page'),
        util = require('util'),
        Scroll = require('widget/scroll'),
        Dialog = require('widget/dialog'),
        slice = Array.prototype.slice;

    var Activity = Page.extend({
        toggleAnim: 'def',

        onHtmlLoad: function () {
            var that = this;

            if (!that.swipeRightBackAction) {
                var $btnBack = that.$('header [data-back]');
                if ($btnBack.length) {
                    that.swipeRightBackAction = $btnBack.attr('data-back') || '/';
                }
            }
            that._scrolls = Scroll.bind(that.$('.scrollview'));
        },

        onLoad: util.noop,

        initialize: function () {
            this.on('Create', this.onHtmlLoad);
            this.one('Show', this.onLoad);
            this.on('Destroy', this._onDestroy);

            Page.prototype.initialize.apply(this, arguments);
        },
        _onDestroy: function () {
            if (this._scrolls) $.each(this._scrolls, function (i, scroll) {
                scroll.destory();
            });
            this.application.remove(this.url);
        },

        isExiting: false,
        startExit: function () {
            var that = this;
            if (that.isExiting) return;
            that.isExiting = true;
            var application = that.application;
            if (application.activeInput) {
                application.activeInput.blur();
                application.activeInput = null;
            }
            application.mask.show();
            that.$el.removeClass('active');
        },

        finishEnterAnimation: function () {
            var that = this;
            that.application.mask.hide();

            that.isExiting = false;
            that.then(function () {
                that.$el.addClass('active');
                that.trigger('Show');
            });
        },

        prompt: function (title, val, fn) {
            fn = typeof val === 'function' ? val : fn;
            val = typeof val === 'function' ? '' : val;
            var prompt = this._prompt;

            if (!prompt) {
                this._prompt = prompt = this.createDialog('prompt', {
                    top: '25%',
                    content: '<input type="text" class="prompt-text" />',
                    buttons: [{
                        text: '取消',
                        click: function () {
                            this.hide();
                        }
                    }, {
                        text: '确认',
                        click: function () {
                            this.hide();
                            this.ok && this.ok(this.$input.val());
                        }
                    }]
                });
                prompt.$input = prompt.$('.prompt-text');
            }

            prompt.title(title || '请输入').show();
            prompt.$input.val(val).focus();
            prompt.ok = $.proxy(fn, this);
        },

        confirm: function (title, content, fn) {
            if (typeof content === 'function') fn = content, content = title, title = '提示';
            var confirm = this._confirm;

            if (!confirm) {
                this._confirm = confirm = this.createDialog("confirm", {
                    buttons: [{
                        text: '取消',
                        click: function () {
                            this.hide();
                        }
                    }, {
                        text: '确认',
                        click: function () {
                            this.hide();
                            this.ok && this.ok();
                        }
                    }]
                });
            }

            confirm.title(title).show();
            confirm.content(content);
            confirm.ok = $.proxy(fn, this);
        },

        createDialog: function (name, options) {
            var that = this;
            var dialog = new Dialog(options);
            that.bindQueryAction(name, dialog, {
                show: 'show',
                "": 'hide'
            });
            return dialog;
        },

        forward: function (url, duration, toggleAnim) {
            this.application.forward(url, duration, toggleAnim);
        },

        back: function (url, duration, toggleAnim) {
            this.application.back(url, duration, toggleAnim);
        }
    });

    return Activity;
});
