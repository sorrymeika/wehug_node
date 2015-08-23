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
                    var images = self.model.get('images').data;
                    self.loading.setParam({
                        UserID: self.user.ID,
                        Auth: self.user.Auth,
                        Content: self.model.data.content,
                        Pictures: images && JSON.stringify(images)
                    }).load();
                }
            },
            'change input[type="file"]': function (e) {
                var self = this;

                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext("2d");

                var fr = new FileReader();
                fr.onload = function (evt) {
                    var img = new Image();
                    img.onload = function () {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0, img.width, img.height);
                        var dataURL = canvas.toDataURL('image/jpeg');
                    }
                    //img.src = evt.target.result;

                    self.model.get('images').add({
                        Src: evt.target.result
                    })
                };
                fr.readAsDataURL(e.target.files[0]);
            }
        },
        swipeRightBackAction: '/',

        onCreate: function () {
            var self = this;

            var $main = this.$('.main');

            Scroll.bind($main);

            this.model = new model.ViewModel(this.$el, {
                back: '/',
                title: '评论',
                showPic: true,
                images: []
            });

            this.loading = new Loading({
                url: '/api/quan/add_comment?areaid=' + util.store('global_area'),
                $el: this.$el,
                checkData: false,
                success: function (res) {
                    if (res.success) {
                        sl.tip('评论成功');

                        self.setResult('comment_success');
                        self.back('/')
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
