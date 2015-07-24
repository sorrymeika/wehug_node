define(function (require, exports, module) {

    var $ = require('$'),
        util = require('util'),
        Activity = require('activity'),
        model = require('core/model'),
        Scroll = require('../widget/scroll');
    var Loading = require('../widget/loading');

    return Activity.extend({
        toggleAnim: 'menu',
        className: 'menu',
        events: {
            'tap': function (e) {
            }
        },

        swipeLeftBackAction: '/',

        onCreate: function () {
            var self = this;

            this.model = new model.ViewModel(this.$el, {
                memberUrl: '/member'
            });

            var user = localStorage.getItem('user');
            if (user) {
                this.user = user = JSON.parse(user);
                this.model.set('user', user);

            } else {
                this.model.set('user', {
                    NickName: '未登录'
                });
            }
        },

        onShow: function () {
            var self = this;
            if (self.user)
                self.model.set('user.Avatars', self.user.Avatars + '?v=' + localStorage.getItem('avatars_ver'));
        },

        onDestory: function () {
        }
    });
});
