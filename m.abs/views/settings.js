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

            },

            'tap .logout': function () {
                if (localStorage.getItem('user')) {
                    localStorage.removeItem('user');
                    this.back('/');
                } else {
                    this.forward('/login');
                }
            }
        },

        swipeRightBackAction: '/',

        onCreate: function () {
            var self = this;

            var $main = this.$('.main');

            Scroll.bind($main);

            this.model = new model.ViewModel(this.$el, {
                back: '/',
                title: '设置'
            });

            var user = util.store('user');
            if (user) {
                this.model.set('logout', '退出')
            } else {
                this.model.set('logout', '立即登录')
            }
        },

        onShow: function () {
            var self = this;
        },

        onDestory: function () {
        }
    });
});
