define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/loading');
    var model = require('../core/model');
    var Promise = require('../core/promise');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');


    return Activity.extend({
        events: {},

        onCreate: function () {
            var self = this;

            this.promise = new Promise();
            this.$main = this.$('.main');

            Scroll.bind(this.$main);

            model.Filter.precent = function (score) {
                return parseFloat(score) + '%'
            }

            this.model = new model.ViewModel(this.$el, {
                title: '活动详情',
                back: this.route.queries.from || '/'
            });

            this.loading = new Loading({
                url: '/api/activity/get',
                params: {
                    id: this.route.data.id
                },
                check: false,
                checkData: false,
                $el: this.$el,
                $content: this.$main.children(":first-child"),
                $scroll: this.$main,
                success: function (res) {

                    self.promise.then(function () {
                        self.model.set(res);
                    });
                    localStorage.setItem('destination', JSON.stringify(res.data));
                }
            });

            this.loading.load();
        },

        onLoad: function () {
            this.promise.resolve();
        },

        onDestory: function () {
        }
    });
});
