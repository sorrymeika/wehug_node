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
            'tap .js_bind:not(.disabled)': function () {
            },
            'tap .js_address': function () {
                this.forward('/address?from=' + this.route.path);
            }
        },

        onCreate: function () {
            var self = this;
            var $main = self.$('.main');

            self.swipeRightBackAction = self.route.query.from || '/';

            Scroll.bind($main);

            self.model = new model.ViewModel(this.$el, {
                back: self.swipeRightBackAction,
                title: '确认订单'
            });
            
            self.onResult('setDefaultAddress', function (e, address) {
                self.model.set({ address: address });
            });
        },

        onShow: function () {
            var self = this;
        },

        onDestory: function () {
        }
    });
});
