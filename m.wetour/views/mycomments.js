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

                util.store('replyAt', '@' + $el.data('at'));

                this.forward('/reply/' + id + "?from=" + this.route.url);
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
                success: function (res) {

                    self.model.set("comments", res.data);
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
