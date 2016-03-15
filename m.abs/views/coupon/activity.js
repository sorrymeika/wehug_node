var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model2');
var Scroll = require('widget/scroll');
var api = require('models/base');
var Share = require('components/share');
var userModel = require('models/user');

module.exports = Activity.extend({
    events: {
        'tap .js_share_activity': function() {
            this.share.show();
        }
    },

    defBackUrl: '/',

    onCreate: function() {
        var self = this;

        self.swipeRightBackAction = self.route.query.from || self.route.referrer || self.defBackUrl;

        self.model = new model.ViewModel(this.$el, {
            back: self.swipeRightBackAction,
            title: 'ABS家居'
        });

        Scroll.bind(self.model.refs.main);

        self.user = userModel.get();

        self.share = new Share({
            head: '分享'
        });
        self.share.clickToShare = function(type) {
            self.addActivityCouponAPI.setParam({
                pspcode: self.user.PSP_CODE,
                vca_id: self.model.data.data.SCA_VCA_ID
            }).load();
        }
        self.share.$el.appendTo(self.$el);

        var appShareActivityAPI = new api.AppShareActivityAPI({
            $el: self.$el,
            params: {
                id: self.route.data.id
            },
            success: function(res) {
                console.log(res);

                self.model.set({
                    data: res.data
                });
            }
        });

        appShareActivityAPI.load();

        self.addActivityCouponAPI = new api.AddActivityCouponAPI({
            $el: self.$el,
            params: {
                id: 20
            },
            success: function(res) {
                if (res.success) {
                    sl.tip('恭喜您获得了一张抵用券');
                }
            },
            error: function() {
            }
        });
    },

    onShow: function() {
        var self = this;
    },

    onDestory: function() {
    }
});
