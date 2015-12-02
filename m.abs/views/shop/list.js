define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('widget/loading');
    var model = require('core/model2');
    var Scroll = require('widget/scroll');
    var animation = require('animation');
    var api = require('models/base');

    return Activity.extend({
        events: {
            'tap .js_bind:not(.disabled)': function () {
            }
        },

        onCreate: function () {
            var self = this;
            var $main = self.$('.main');

            self.swipeRightBackAction = self.route.query.from || '/';

            Scroll.bind($main);

            self.model = new model.ViewModel(this.$el, {
                back: self.swipeRightBackAction,
                title: '床品'
            });

            var list = new api.ProductSearchAPI({
                $el: self.$el,
                check: false,
                success: function (res) {
                    self.model.set({
                        data: res.data
                    });
                },
                append: function (res) {
                    self.model.get('data').append(res.data);
                }
            });
            list.load();
        },

        onShow: function () {
            var self = this;
        },

        onDestory: function () {
        }
    });
});