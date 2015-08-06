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
                memberUrl: '/member',
                logout: function () {
                    util.store('user', null);
                    self.back('/');
                }
            });
        },

        onShow: function () {
            var self = this;
            var user = util.store('user');
            if (!user) {
                this.model.set({
                    user: null
                });

            } else if (!self.isLoad) {
                self.isLoad = true;
                self.user = user;

                self.model.set({
                    user: user
                });
            }


        },

        onDestory: function () {
        }
    });
});
