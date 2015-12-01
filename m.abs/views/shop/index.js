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

            self.swipeRightBackAction = self.route.query.from || '/';

            var $main = this.$('.main');

            Scroll.bind($main);

            this.model = new model.ViewModel(this.$el, {
                back: self.swipeRightBackAction,
                title: '标题'
            });

            var cate = new api.CategoryAPI({
                success: function (res) {
                    console.log(res);

                    self.model.set({
                        id: res.data[0].PCG_ID,
                        categories: res.data
                    })
                },
                $el: self.$el
            });
            cate.load();
        },

        onShow: function () {
            var self = this;
        },

        onDestory: function () {
        }
    });
});
