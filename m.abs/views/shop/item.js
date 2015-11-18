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
                this.forward('/cart?from=' + this.route.url);
            }
        },

        className: 'pd_item_bg',

        onCreate: function () {
            var self = this;
            var $main = self.$('.main');

            self.swipeRightBackAction = self.route.query.from || '/';

            Scroll.bind($main);

            self.model = new model.ViewModel(self.$el, {
                back: self.swipeRightBackAction,
                title: '床品'
            });
        },

        onShow: function () {
            var self = this;
        },

        onDestory: function () {
        }
    });
});
