define(function (require, exports, module) {


    var $ = require('$');
    var util = require('util'),
        Page = require('core/page'),
        model = require('core/model'),
        Form = require('components/form');

    return Page.extend({
        events: {},

        onCreate: function () {
            var self = this;

            self.$el.siblings().hide();

            this.model = new model.ViewModel(this.$el, {
                title: '登录',
                buttons: [{
                    value: '确认',
                    click: function () {
                        form.submit(function (res) {
                            if (res.success) {
                                sl.tip('登录成功');
                                self.back('/');

                            } else {
                                sl.tip(res.msg);
                                self.model.set({
                                    captcha: '/captcha/' + Date.now() + '.jpg'
                                });
                            }
                        });
                    }
                }]
            });

            var form = new Form({
                model: this.model,
                name: 'user',
                title: 'test',
                useIframe: true,
                url: '/api/manage/login',
                validator: 'userValid',
                enctype: '',
                fields: [{
                    label: '账号',
                    field: 'username',
                    emptyAble: false,
                    emptyText: '不可为空'
                }, {
                    label: '密码',
                    field: 'password',
                    type: 'password',
                    emptyAble: false,
                    emptyText: '不可为空'
                }, {
                    label: '验证码',
                    field: 'captcha',
                    type: 'captcha',
                    captcha: '/captcha/1.jpg',
                    emptyAble: false,
                    emptyText: '不可为空',
                    render: function () {
                    }
                }]
            });

            this.model.before('.action', form.$el);


            var a = {
                asdf: 1,
                asdf1: 1
            };
            var b = {
                asdf: 1,
                asdf1: 1
            };
            delete a.adsf;
            b.asdf = null;

            var c = function (callback) {
                if (callback) {
                }
            }

            var d = function () {
                if (arguments.length == 1) {
                    a = arguments[0]
                }
            }

            var e = [];
            for (var i = 0; i < 1000000; i++) {
                e[i] = 1;
            }

            console.log(Date.now());

            var now = Date.now();

            for (var i = 0; i < 1000000; i++) {
            }
            console.log(Date.now() - now);

            now = Date.now();
            for (var i = 0; i < 1000000; i++) {
            }
            console.log(Date.now() - now);
            console.log(e.length)
        },

        onShow: function () {
        },

        onDestory: function () {
        }
    });
});

