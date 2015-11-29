var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model2');
var Scroll = require('widget/scroll');
var animation = require('animation');
var api = require('models/base');

module.exports = Activity.extend({
    events: {
        'tap .js_bind:not(.disabled)': function () {
        },
        'tap .js_add_address': function () {
            this.forward('/addaddress?from=' + encodeURIComponent(this.route.url));
        }
    },

    onCreate: function () {
        var self = this;
        var $main = self.$('.main');

        self.swipeRightBackAction = self.route.query.from || '/';

        Scroll.bind($main);

        self.model = new model.ViewModel(this.$el, {
            back: self.swipeRightBackAction,
            title: '收获地址'
        });

       
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
    }
});
