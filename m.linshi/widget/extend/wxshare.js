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
                    debug: false,
                    appId: res.appId,
                    timestamp: res.tm,
                    nonceStr: res.nonceStr + "",
                    signature: res.sign,
                    jsApiList: [
                      'onMenuShareAppMessage',
                      'onMenuShareTimeline',
                      'onMenuShareQQ',
                      'onMenuShareWeibo',
                      'onMenuShareQZone'
                    ]
                });

                wx.ready(function () {
                    var shareOptions = {
                        title: shareData.shareTitle,
                        desc: shareData.shareContent,
                        link: location.href,
                        imgUrl: 'http://m.linshi.biz/upload/share.png',
                        trigger: function (res) {
                        },
                        success: function (res) {
                        },
                        cancel: function (res) {
                        },
                        fail: function (res) {
                        }
                    }

                    wx.onMenuShareTimeline(shareOptions);
                    wx.onMenuShareAppMessage(shareOptions);
                    wx.onMenuShareQQ(shareOptions);
                    wx.onMenuShareWeibo(shareOptions);
                    wx.onMenuShareQZone(shareOptions);

                    alert(1);
                });

            }, 'json');
        });
    };
});
