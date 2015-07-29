define(function (require, exports, module) {

    var $ = require('$');
    var bridge = require('bridge');
    var util = require('util');

    module.exports = function (shareData) {
        seajs.use('http://res.wx.qq.com/open/js/jweixin-1.0.0.js', function (wx) {
            $.post(bridge.url('/user/share_weixin'), {
                url: location.href.replace(/#.+/, '')

            }, function (res) {

                wx.config({
                    debug: true,
                    appId: res.appId,
                    timestamp: res.tm,
                    nonceStr: res.nonceStr,
                    signature: res.sign,
                    jsApiList: [
                      'onMenuShareAppMessage'
                    ]
                });

                wx.ready(function () {
                    wx.onMenuShareAppMessage({
                        title: shareData.shareTitle,
                        desc: shareData.shareContent,
                        shareUrl: location.href,
                        imgUrl: 'http://m.linshi.biz/upload/share.png',
                        trigger: function (res) {
                        },
                        success: function (res) {
                        },
                        cancel: function (res) {
                        },
                        fail: function (res) {
                        }
                    });
                });

            }, 'json');
        });
    };
});
