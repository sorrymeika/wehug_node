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
        events: {
            'tap .js_comment': function () {
                this.forward('/destcomment/' + this.route.data.id);
            }
        },

        onCreate: function () {
            var self = this;

            this.promise = new Promise();
            this.$main = this.$('.main');

            Scroll.bind(this.$main);

            model.Filter.precent = function (score) {
                return parseFloat(score) + '%'
            }

            this.model = new model.ViewModel(this.$el, {
                title: '目的地详情',
                back: this.route.query.from || '/'
            });

            this.loading = new Loading({
                url: '/api/destination/get',
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

            this.comments = new Loading({
                url: '/api/destination/comment_list',
                $el: self.$('.quan_list'),
                success: function (res) {
                    self.model.set("comments", res.data);
                },
                append: function (res) {
                    self.model.get('comments').append(res.data);
                }
            });

            this.comments.load();

            self.onResult('destcomment_success', function () {
                self.comments.reload();
            });
        },

        onLoad: function () {
            this.promise.resolve();
        },

        onDestory: function () {
        }
    });
});
