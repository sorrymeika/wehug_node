define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util'),
        Page = require('core/page'),
        model = require('core/model'),
        API = require('models/api').API,
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

            var loginUrl = API.url('/api/manage/login');
            
            var form = new Form({
                model: this.model,
                name: 'user',
                title: 'test',
                useIframe: loginUrl.match(/http\:\/\/([^\/]+)/)[1] == location.host,
                url: loginUrl,
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
                        captcha: API.url('/captcha/1.jpg'),
                        emptyAble: false,
                        emptyText: '不可为空',
                        render: function () {
                        }
                    }]
            });

            this.model.before('.action', form.$el);

        },

        onShow: function () {
        },

        onDestory: function () {
        }
    });
});

