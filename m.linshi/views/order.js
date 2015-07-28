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

            },

            'tap .logout': function () {
                if (localStorage.getItem('member')) {
                    localStorage.removeItem('member')
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
                back: this.route.queries.from || '/',
                title: '订单支付'
            });

            var member = localStorage.getItem('member');
            if (member) {
                member = JSON.stringify(member);
                this.model.set('logout', '退出当前账号')
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
