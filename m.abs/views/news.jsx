var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model2');
var Scroll = require('widget/scroll');
var animation = require('animation');
var ShareOrder = require('components/shareOrder');
var Month = require('components/month');
var Activ = require('components/activity');
var FastBuy = require('components/fastbuy');
var Package = require('components/package');
var Banner = require('components/banner');
var api = require("models/base");

module.exports = Activity.extend({
    events: {
        'tap .js_bind:not(.disabled)': function () {
        }
    },

    onCreate: function () {
        var self = this;

        self.swipeRightBackAction = self.route.query.from || '/';

        var id = self.route.data.id;
        var m = /(order|month|activity|package|fastbuy|banner|coupon)(\d*)/.exec(id);
        var type = m[1];
        id = m[2];

        self.model = new model.ViewModel(this.$el, {
            back: self.swipeRightBackAction
        });

        var title = '';
        var component;

        switch (type) {
            case 'order':
                title = "支付成功";
                component = new ShareOrder();
                component.$el.appendTo(self.$el);
                break;
            case 'month':
                title = "会员礼领取";
                component = new Month({
                    id: id
                });
                component.$el.appendTo(self.$el);
                break;
            case 'fastbuy':
                title = "周一闪购";
                component = new FastBuy();
                component.view = self;
                component.$el.appendTo(self.$el);
                break;
            case 'activity':
                title = id == 2 ? "最热商品" : "APP专享";
                component = new Activ({
                    id: id
                });
                component.view = self;
                component.$el.appendTo(self.$el);
                break;
            case 'package':
                title = "套餐";
                component = new Package({
                    id: id
                });
                component.view = self;
                component.$el.appendTo(self.$el);
                break;
            case 'banner':
                title = "纳米美容巾免费领";
                component = new Banner({
                    id: id
                });
                component.view = self;
                component.$el.appendTo(self.$el);
                break;
            case 'coupon':
                title = "优惠券规则";
                self.$el.append(<div class="main" style="padding:20px;background:#fff;">
                Q：如何使用优惠券？<br/>
A：您可以在订单结算页面通过“使用优惠券”选项使用一张符合使用条件的优惠券，抵扣相应的金额。<br/>
<br/>
Q：什么是券码？<br/>
A：用户可以通过ABS其他合作渠道获取兑换券码，兑换码可以在"我的优惠券”页兑换优惠券，抵扣相应金额。<br/>
<br/>
Q：优惠券的使用有什么其他限制吗？<br/>
A：优惠券的使用时限、抵用限额及其他限制条件请详见优惠券上的文字描述。<br/>
                    </div>);
                break;
        }

        Scroll.bind(self.$('.main'));

        self.model.set({
            type: type,
            title: title
        })
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
    }
});
