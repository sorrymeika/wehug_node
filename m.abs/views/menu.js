define(function (require, exports, module) {

    var $ = require('$'),
        util = require('util'),
        Activity = require('activity'),
        bridge = require('bridge'),
        model = require('core/model'),
        Scroll = require('../widget/scroll');
    var Loading = require('../widget/loading');

    return Activity.extend({
        toggleAnim: 'menu',
        className: 'menu',
        events: {
            'tap': function (e) {
            },
            'tap [data-logout]': function (e) {
            }
        },

        swipeLeftBackAction: '/',

        onCreate: function () {
            var self = this;

            if (bridge.hasStatusBar) {
                this.$el.find('.fix_statusbar').addClass("fix_statusbar");
            }

            this.model = new model.ViewModel(this.$el, {
                memberUrl: '/member'
            });

            var user = localStorage.getItem('user');
            if (user) {
                this.user = user = JSON.parse(user);
                this.model.set({
                    logoutOrLogin: '退出',
                    user: user
                });

            } else {
                this.model.set({
                    logoutOrLogin: '登录',
                    user: {
                        NickName: '未登录'
                    }
                });
            }
        },

        onShow: function () {
            var self = this;
            if (self.user)
                self.user.Avatars && self.model.set('user.Avatars', self.user.Avatars + '?v=' + localStorage.getItem('avatars_ver'));
        },

        onDestory: function () {
        }
    });
});
