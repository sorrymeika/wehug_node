define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/loading');
    var model = require('../core/model');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');

    return Activity.extend({
        events: {
            'tap .js_login:not(.disabled)': function () {
                var mobile = this.model.get('mobile');
                var smsCode = this.model.get('smsCode');

                if (!mobile || !util.validateMobile(mobile)) {
                    sl.tip('请输入正确的手机');
                    return;
                }
                if (!smsCode) {
                    sl.tip('请输入密码');
                    return;
                }

                this.loading.setParam({
                    mobile: mobile,
                    smsCode: smsCode
                }).load();
            },
            'tap .js_valid:not(.disabled)': function (e) {
                var mobile = this.model.get('mobile');
                if (!mobile || !util.validateMobile(mobile)) {
                    sl.tip('请输入正确的手机');
                    return;
                }

                this.$valid.addClass('disabled');
                this.valid.setParam({
                    mobile: this.model.data.mobile
                });
                this.valid.load();
            }
        },

        swipeRightBackAction: '/',

        validTimeout: function () {
            var self = this;
            var sec = localStorage.getItem('valid_time');

            if (sec && parseInt(sec) > 60) {
                sec = Math.round((new Date(parseInt(sec)).getTime() - Date.now()) / 1000);

                if (sec <= 0) return;

                self.$valid.addClass('disabled');

                setTimeout(function () {
                    if (sec <= 0) {
                        self.$valid.removeClass('disabled');
                        self.model.set('valid', '获取验证码');
                        localStorage.removeItem('valid_time');

                    } else {
                        self.model.set('valid', sec + '秒后再次获取');
                        sec--;
                        setTimeout(arguments.callee, 1000);
                    }
                }, 1000);
            }
        },

        onCreate: function () {
            var self = this;

            var $main = this.$('.main');

            Scroll.bind($main);

            this.model = new model.ViewModel(this.$el, {
                title: '快速登录 / 注册',
                valid: '获取验证码',
                back: this.route.query.from || '/'
            });

            this.getUser = new Loading({
                url: '/api/user/get',
                check: false,
                checkData: false,
                $el: this.$el,
                success: function () {
                }
            });

            this.loading = new Loading({
                url: '/api/user/login',
                method: 'POST',
                check: false,
                checkData: false,
                $el: this.$el,
                success: function (res) {
                    if (!res.success)
                        sl.tip(res.msg);
                    else {
                        util.store('user', res.data);

                        self.getUser.setParam({
                            UserID: res.data.UserID,
                            Auth: res.data.Auth

                        }).load(function (err, user) {
                            if (user) {
                                util.store('user', $.extend(res.data, user.data));
                            }
                            self.back(self.route.query.success || '/');
                        });

                    }
                },
                error: function (res) {
                    sl.tip(res.msg);
                }
            });

            this.valid = new Loading({
                url: '/api/user/send_sms',
                method: 'POST',
                params: {
                    mobile: self.model.data.mobile
                },
                check: false,
                checkData: false,
                $el: this.$el,
                success: function (res) {
                    if (!res.success) {
                        sl.tip(res.msg)
                    } else {
                        localStorage.setItem('valid_time', Date.now() + 60000);

                        self.validTimeout();
                    }
                },
                error: function (res) {
                    sl.tip(res.msg);
                    self.$valid.removeClass('disabled');
                    this.hideLoading();
                }
            });

            self.$valid = this.$('.js_valid');
            self.validTimeout();
        },

        onShow: function () {
            var that = this;
        },

        onDestory: function () {
        }
    });
});
