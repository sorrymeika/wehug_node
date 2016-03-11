var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model2');
var Scroll = require('widget/scroll');
var animation = require('animation');
var api = require("models/base");

module.exports = Activity.extend({
    events: {
        'tap .js_bind:not(.disabled)': function () {
        }
    },

    onCreate: function () {
        var self = this;

        Scroll.bind(self.$('.main'));

        self.swipeRightBackAction = self.route.query.from || self.route.referrer || '/';

        self.model = new model.ViewModel(this.$el, {
            back: self.swipeRightBackAction,
            title: self.route.query.name||'态度'
        });

        self.discoverListAPI = new api.DiscoverListAPI({
            $el: self.$el,

            success: function (res) {
                console.log(res);

                self.model.set({
                    data: res.data
                });
            },

            error: function () {
            }
        });
    },

    onUpdate: function () {
        var self = this;

        self.discoverListAPI.setParam({
            dctid: this.route.data.id || 0,
            wd: this.route.query.s || '',
            orderby: 'asc',
            order: 'VIEW'

        }).load();
    },

    onDestory: function () {
    }
});
