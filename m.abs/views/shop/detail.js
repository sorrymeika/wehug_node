var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model2');
var Scroll = require('widget/scroll');
var animation = require('animation');

module.exports = Activity.extend({
    events: {
        'tap .js_bind:not(.disabled)': function () {
        }
    },

    onCreate: function () {
        var self = this;
        self.swipeRightBackAction = self.route.query.from || ('/item/'+self.route.data.id);
        
        self.model = new model.ViewModel(this.$el, {
            back: self.swipeRightBackAction,
            title: '图文详情',
            id: self.route.data.id
        });

        Scroll.bind(self.$('.main'));
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
    }
});
