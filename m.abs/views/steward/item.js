define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('widget/loading');
    var model = require('core/model2');
    var Scroll = require('widget/scroll');
    var animation = require('animation');


    return Activity.extend({
        events: {
            'tap .js_buy:not(.disabled)': function () {
                var self = this;

            }
        },
        swipeRightBackAction: '/steward',

        onCreate: function () {
            var self = this;

            var $main = this.$('.main');

            Scroll.bind($main);

            this.model = new model.ViewModel(this.$el, {
                back: '/steward',
                title: '爱管家'
            });
        },

        onShow: function () {
            var self = this;
        },

        onDestory: function () {
        }
    });
});
