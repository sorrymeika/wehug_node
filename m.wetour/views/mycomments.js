define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/loading');
    var model = require('../core/model');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');


    return Activity.extend({
        events: {
            'tap .quanli_reply': function (e) {
                var $target = $(e.currentTarget);
                var $el = $target.closest('[data-id]');
                var id = $el.data('id');
                var type = $el.data('type');
                var at = $el.data('at');

                util.store('replyAt', at ? '@' + at : null);

                this.forward('/reply/' + id + "?type=" + type + "&from=" + this.route.url);
            },
            'tap .quanli_del': function (e) {
                var self = this;
                var $target = $(e.currentTarget);
                var $el = $target.closest('[data-id]');
                var id = $el.data('id');
                var type = $el.data('type');

                this.confirm('确认删除？', function () {

                    self.delLoading.setParam({
                        id: id,
                        type: type,
                        UserID: self.user.ID,
                        Auth: self.user.Auth
                    }).load();
                })
            }
        },
        swipeRightBackAction: '/',

        onCreate: function () {
            var self = this;

            var $main = this.$('.main');

            Scroll.bind($main);

            this.model = new model.ViewModel(this.$el, {
                back: '/',
                title: '我的评论'
            });

            var loading = new Loading({
                url: "/api/user/comment_list",
                $el: this.$el,
                checkData: false,
                success: function (res) {
                    self.model.set("comments", res.data);
                    if (!res.data) {
                        this.dataNotFound();
                    }
                },
                append: function (res) {
                    self.model.get('comments').append(res.data);
                }
            });
            self.user = util.store('user');
            if (self.user) {
                loading.setParam({
                    UserID: self.user.ID,
                    Auth: self.user.Auth

                }).load();
            }


            this.delLoading = new Loading({
                url: "/api/user/delete_comment",
                $el: this.$el,
                checkData: false,
                success: function (res) {
                    sl.tip('删除成功！');
                    loading.reload();
                }
            });

            self.onResult('comment_success', function () {
                loading.reload();
            });
        },

        onShow: function () {
            var self = this;

            self.user = util.store('user');

            if (!self.user) {
                self.forward('/login?success=' + this.route.url + "&from=" + this.route.url);
            }
        },

        onDestory: function () {
        }
    });
});
