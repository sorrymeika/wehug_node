define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/extend/loading');
    var model = require('../core/model');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');


    return Activity.extend({
        events: {
            'tap .js_bind:not(.disabled)': function () {
                var userName = this.model.get('userName');
                var password = this.model.get('password');

                if (!userName || !util.validateMobile(userName)) {
                    sl.tip('请输入正确的手机');
                    return;
                }
                if (!password) {
                    sl.tip('请输入验证码');
                    return;
                }

                this.loading.setParam({
                    user_name: userName,
                    password: password
                }).load();
            },
            'tap .js_valid:not(.disabled)': function (e) {
                this.$valid.addClass('disabled');

                this.valid.load();
            }
        },

        toggleAnim: 'dialog',
        className: 'login_view',

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
                        self.model.set('valid', sec + '秒后获取');
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
                url: '/user/login',
                params: {
                    longitude: 0,
                    latitudes: 0
                },
                method: 'POST',
                check: false,
                checkData: false,
                $el: this.$el,
                success: function (res) {
                    if (res.error_msg)
                        sl.tip(res.error_msg);
                    else {
                        localStorage.setItem('member', JSON.stringify({
                            mobile: self.model.data.userName,
                            member_id: res.data.member_id,
                            user_name: res.data.huanxin_user
                        }));
                        self.back(self.route.queries.success || '/');
                    }
                },
                error: function (res) {
                    sl.tip(res.msg);
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
