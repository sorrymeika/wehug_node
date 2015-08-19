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
            'tap': function (e) {
                if (e.target == this.el) {
                    this.back(this.route.queries.from || '/');
                }
            },
            'tap .js_reply:not(.disabled)': function () {
                var self = this;

                if (!self.model.data.content) {
                    sl.tip('请填写评论');

                } else {
                    self.loading.setParam({
                        ID: this.route.data.id,
                        UserID: self.user.ID,
                        Auth: self.user.Auth,
                        Content: self.model.data.content
                    })
                    .load();
                }
            }
        },
        swipeRightBackAction: '/',

        toggleAnim: 'fade',

        className: 'transparent',

        onCreate: function () {
            var self = this;

            this.swipeRightBackAction = self.route.queries.from || '/';

            this.model = new model.ViewModel(this.$el, {
                content: util.store('replyAt') ? util.store('replyAt') + ' ' : ''
            });

            this.loading = new Loading({
                url: '/api/' + (self.route.query.type == 0 ? 'quan' : self.route.query.type == 1 ? 'recommend' : self.route.query.type == 2 ? 'destination' : 'activity') + '/reply_comment',
                $el: this.$el,
                checkData: false,
                success: function (res) {
                    if (res.success) {
                        sl.tip('评论成功');

                        self.setResult('comment_success');
                        self.back(self.route.queries.from || '/');
                    }
                }
            });
        },

        onShow: function () {
            var self = this;

            self.user = util.store('user');

            if (!self.user) {
                self.forward('/login?success=' + this.route.url + "&from=" + this.route.url);
            }

            self.$el.find('input').focus();
        },

        onDestory: function () {
        }
    });
});
