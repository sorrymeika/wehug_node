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
            'tap .js_bind:not(.disabled)': function () {

            }
        },

        swipeRightBackAction: '/',

        onCreate: function () {
            var self = this;

            var $main = this.$('.main');

            Scroll.bind($main);

            var user = util.store('user');

            this.model = new model.ViewModel(this.$el, {
                back: '/',
                title: '设置',
                user: user,
                logout: function () {
                    if (localStorage.getItem('user')) {
                        util.store('user', null);
                        self.back('/');
                    } else {
                        self.forward('/login');
                    }
                }
            });
        },

        onShow: function () {
            var self = this;
        },

        onDestory: function () {
        }
    });
});
