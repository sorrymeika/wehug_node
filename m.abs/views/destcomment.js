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
            'tap .js_submit:not(.disabled)': function () {
                var self = this;

                if (!self.model.data.content) {
                    sl.tip('请填写评论');

                } else {
                    self.loading.setParam({
                        DestID: self.route.data.id,
                        UserID: self.user.ID,
                        Auth: self.user.Auth,
                        Content: self.model.data.content
                    })
                    .load();
                }
            }
        },
        swipeRightBackAction: '/',

        onCreate: function () {
            var self = this;

            var $main = this.$('.main');

            Scroll.bind($main);

            this.model = new model.ViewModel(this.$el, {
                back: '/',
                title: '评论'
            });

            this.loading = new Loading({
                url: '/api/destination/add_comment',
                $el: this.$el,
                checkData: false,
                success: function (res) {
                    if (res.success) {
                        sl.tip('评论成功');

                        self.setResult('destcomment_success');
                        self.back('/destination/' + self.route.data.id);
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
        },

        onDestory: function () {
        }
    });
});
