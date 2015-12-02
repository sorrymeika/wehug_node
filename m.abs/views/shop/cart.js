define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('widget/loading');
    var model = require('core/model3');
    var Scroll = require('widget/scroll');
    var animation = require('animation');
    var api = require("models/base");

    return Activity.extend({
        events: {
            'tap .js_buy:not(.disabled)': function () {
                var self = this;
                this.forward('/buy?from=' + self.route.url);
            },
            'touchmove .ct_coupon_wrap': function (e) {
                return false;
            },
            'tap .ct_coupon_wrap': function (e) {
                if ($(e.target).hasClass('ct_coupon_wrap')) {
                    this.model.set({
                        isShowCoupon: false
                    })
                }
            },
            'tap .js_use_coupon': function () {
                this.$coupon.show();
                this.model.set({
                    couponType: 0,
                    isShowCoupon: true
                })
            },
            'tap .js_use_point': function () {
                this.prompt("输入要使用的积分", '100', function (res) {
                    console.log(res);
                })
            },
            'tap .js_use_freecard': function () {
                this.$coupon.show();
                this.model.set({
                    couponType: 4,
                    isShowCoupon: true
                })
            }
        },

        onCreate: function () {
            var self = this;

            Scroll.bind(self.$('.main'));
            Scroll.bind(self.$('.ct_coupon_list .bd'));

            self.swipeRightBackAction = self.route.query.from || '/';
            self.user = util.store('user');

            self.model = new model.ViewModel(this.$el, {
                back: self.swipeRightBackAction,
                title: '我的购物车',
                user: self.user,
                loading: true
            });
            
            this.$coupon = self.$('.ct_coupon_wrap');
            self.listenTo(self.$coupon, $.fx.transitionEnd, function (e) {
                if (self.$coupon.hasClass('out')) {
                    self.$coupon.hide();
                }
            });
            self.coupon = new Loading({
                url: "/api/user/voucher_list",
                params: {
                    status: 1
                },
                $el: this.$el,
                check: false,
                checkData: false,
                success: function (res) {
                    if (!res || !res.data || res.data.length == 0) {
                        self.model.set("coupon", []);
                    }
                    else {
                        var data = res.data;

                        data.sort(function (a, b) {
                            return a.IsOverdue && !b.IsOverdue ? 1 : !a.IsOverdue && b.IsOverdue ? -1 : a.CSV_END_DT > b.CSV_END_DT ? 1 : a.CSV_END_DT == b.CSV_END_DT ? 0 : -1;
                        });
                        self.model.set("coupon", data);
                    }
                }
            });

            self.cart = new api.CartAPI({
                $el: self.$el,
                checkData: false,
                success: function (res) {
                    console.log(res);

                    self.model.set(res).set({
                        loading: false
                    });
                }
            });

            if (self.user) {
                self.doWhenLogin();
            }

            self.onResult("Login", function () {
                self.doWhenLogin();
            })
        },

        doWhenLogin: function () {
            var self = this;
            this.user = util.store('user');
            self.cart.setParam({
                pspcode: self.user.Mobile
            }).load();
            this.coupon.setParam({
                UserID: self.user.ID,
                Auth: self.user.Auth
            }).load();
        },

        onShow: function () {
            var self = this;

            if (!self.user) {
                self.forward('/login?success=' + self.route.url + "&from=" + self.swipeRightBackAction);
            }
        },

        onDestory: function () {
        }
    });
});
