define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/extend/loading');
    var model = require('../core/model');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');
    var wxshare = require('../widget/extend/wxshare');

    return Activity.extend({
        events: {},
        swipeRightBackAction: '/',

        onCreate: function () {
            var self = this;

            var $main = this.$('.main');

            Scroll.bind($main);

            this.model = new model.ViewModel(this.$el, {
                back: '/',
                title: '分享邻师APP',
                download: util.android ? "http://api.linshi.biz/download/linshi.apk" : "https://itunes.apple.com/us/app/lin-shi/id1001036632?l=zh&ls=1&mt=8",
                wechatDownload: function () {
                    if (util.isInWechat) {
                        sl.tip('若微信内无法打开下载链接，请点击右上角并选择“' + (util.ios ? '在Safari中打开' : '在浏览器中打开') + '”');
                    }
                }
            });
            if (util.isInWechat) {
                wxshare($.extend(wxshare.getShareData('download'), {
                    shareUrl: location.href
                }));
            }
        },

        onShow: function () {
            var self = this;
        },

        onDestory: function () {
        }
    });
});
