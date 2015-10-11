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
            'tap .js_bind:not(.disabled)': function () {
                var orig_password = this.model.data.orig_password;
                var password = this.model.data.password;
                var password1 = this.model.data.password1;

                if (!orig_password) {
                    sl.tip('请输入原始密码');
                    return;
                }
                if (password != password1) {
                    sl.tip('两次密码输入不一致');
                    return;
                }
                this.loading.setParam({
                    userid: this.user.ID,
                    auth: this.user.Auth,
                    oldPassword: md5.md5(orig_password),
                    password: md5.md5(password)
                }).load();
            }
        },

        onCreate: function () {
            var self = this;

            var $main = this.$('.main');

            Scroll.bind($main);

            this.model = new model.ViewModel(this.$el, {
                title: '修改密码',
                back: this.route.queries.from || '/'
            });

            this.loading = new Loading({
                url: '/api/user/update_pwd',
                method: 'POST',
                check: false,
                checkData: false,
                $el: this.$el,
                success: function (res) {
                    if (!res.success)
                        sl.tip(res.msg);
                    else {
                        sl.tip('修改成功！');
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

            var user = util.store('user');
            if (user) {
                this.user = user;

            } else {
                this.forward('/login');
            }
        },

        onDestory: function () {
        }
    });
});
