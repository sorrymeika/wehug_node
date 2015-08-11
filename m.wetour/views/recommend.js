define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/loading');
    var model = require('../core/model');
    var Promise = require('../core/promise');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');
    var common = require('common');

    return Activity.extend({
        events: {
            'tap .js_comment': function () {
                this.forward('/reccomment/' + this.route.data.id);
            },
            'tap .destfav': function () {
                if (util.store('user')) {
                    this.model.set('isFavorite', !this.model.data.isFavorite);
                    this.model.set('data.Favorite', (this.model.data.data.Favorite || 0) + (!this.model.data.isFavorite ? -1 : 1));
                    common.favorite('recommend', this.route.data.id, this.model.data.isFavorite);

                } else {
                    sl.tip('请先登录');
                }
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
                title: '推荐详情',
                back: this.route.queries.from || '/',
                isFavorite: common.isFavorite('recommend', this.route.data.id)
            });
            var user = util.store('user');

            this.loading = new Loading({
                url: '/api/recommend/get',
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
                    localStorage.setItem('recommend', JSON.stringify(res.data));
                }
            });

            this.loading.load();

            this.comments = new Loading({
                url: '/api/recommend/comment_list',
                params: {
                    id: this.route.data.id
                },
                $el: self.$('.quan_list'),
                success: function (res) {
                    self.model.set("comments", res.data);
                },
                append: function (res) {
                    self.model.get('comments').append(res.data);
                }
            });

            this.comments.load();

            self.onResult('recommend_success', function () {
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
