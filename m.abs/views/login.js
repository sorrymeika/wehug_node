define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/loading');
    var model = require('../core/model');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');
    var md5 = require('util/md5');

    return Activity.extend({
        events: {
            'tap .js_login:not(.disabled)': function () {
                var mobile = this.model.get('mobile');
                var password = this.model.get('password');

                if (!mobile || !util.validateMobile(mobile)) {
                    sl.tip('请输入正确的手机');
                    return;
                }
                if (!password) {
                    sl.tip('请输入密码');
                    return;
                }

                this.loading.setParam({
                    mobile: mobile,
                    password: md5.md5(password)
                }).load();
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
                        self.model.set('valid', sec + '秒');
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
                back: this.route.queries.from || '/'
            });

            this.loading = new Loading({
                url: '/api/user/login',
                method: 'POST',
                check: false,
                checkData: false,
                $el: this.$el,
                xhrFields: {
                    withCredentials: true
                },
                success: function (res) {
                    if (res.error_msg)
                        sl.tip(res.error_msg);
                    else {
                        util.store('user', res.data);
                        self.back(self.route.queries.success || '/');
                    }
                },
                error: function (res) {
                    sl.tip(res.msg);
                }
            });
        },

        onShow: function () {
            var that = this;
        },

        onDestory: function () {
        }
    });
});
