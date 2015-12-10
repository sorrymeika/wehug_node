define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('widget/loading');
    var model = require('core/model3');
    var Promise = require('core/promise');
    var Scroll = require('widget/scroll');
    var animation = require('animation');
    var api = require("models/base");
    var Deletion = require("components/deletion");

    return Activity.extend({
        events: {
            'tap .js_buy:not(.disabled)': function () {
                var self = this;
                var couponcode = this.model.get('couponcode');
                var freecouponcode = this.model.get('freecouponcode');

                this.forward('/buy?coupon=' + (couponcode ? couponcode.CSV_CODE : '') + '&couponprice=' + (couponcode ? couponcode.VCA_DEDUCT_AMOUNT : '') + '&freecoupon=' + (couponcode ? couponcode.CSV_CODE : '') + '&points=' + this.model.get('Points') + '&from=' + encodeURIComponent(self.route.url));
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
                var self = this;

                this.prompt("输入要使用的积分", '100', function (res) {
                    if (self.user.Points < parseInt(res)) {
                        sl.tip('您的积分不够');

                    } else {
                        self.model.set({
                            Points: res
                        })
                    }
                });
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
                loading: true,
                Points: 0
            });

            self.model.useCoupon = function (e, coupon) {
                console.log(coupon);

                self.model.set(coupon.VCA_VCT_ID == 4 ? {
                    freecouponcode: coupon

                } : {
                        couponcode: coupon
                    }).set({
                        isShowCoupon: false
                    });
            }

            self.cart = new api.CartAPI({
                $el: self.$el,
                checkData: false,
                success: function (res) {
                    self.model.set(res).set({
                        loading: false
                    });
                }
            });

            self.initCoupon();
            self.initModify();
            self.initDeletion();

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

        initDeletion: function () {
            var self = this;

            new Deletion({
                el: self.$('.ct_list'),
                children: 'li .ct_list_item_con',
                width: 45,
                events: {
                    'li': function (e) {
                        self.cartDeleteApi.setParam({
                            spbId: $(e.currentTarget).data('id')

                        }).load();
                    }
                }
            });

            self.cartDeleteApi = new api.CartDeleteAPI({
                $el: self.$el,
                checkData: false,
                params: {
                    pspcode: self.user.Mobile
                },
                success: function (res) {
                    var spbId = this.getParam('spbId');

                    self.model.getModel('data_baglist').remove(function (el) {
                        return el.model.get('SPB_ID') == spbId;
                    });
                    
                    self.cart.reload();
                },
                error: function (res) {
                    sl.tip(res.msg);
                }
            });
        },

        initModify: function () {
            var self = this;
            var promise = new Promise().resolve();

            self.cartModifyApi = new api.CartModifyAPI({
                $el: self.$el,
                checkData: false,
                success: function (res) {
                    self.cart.reload();
                    promise.resolve();
                },
                error: function (res) {
                    sl.tip(res.msg);
                    var ctx = this;

                    this.model.set({
                        SPB_QTY: this.originQty
                    });
                    promise.reject();
                }
            });

            self.model.on('change:data_baglist^child/SPB_QTY', function (e, model, origin, value) {
                if (origin != undefined) {
                    var qty = parseInt(model.get('SPB_QTY'));
                    if (qty && qty > 0) {
                        promise.then(function (err) {
                            if (!err) {
                                $.extend(self.cartModifyApi, {
                                    model: model,
                                    originQty: origin

                                }).setParam({
                                    pspcode: self.user.Mobile,
                                    spbId: model.get('SPB_ID'),
                                    qty: qty
                                }).load();

                                return this;
                            }
                            return new Error('change qty error');
                        });
                    }
                }
            });

        },

        initCoupon: function () {
            var self = this;

            self.$coupon = self.$('.ct_coupon_wrap');
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
                $el: this.$coupon,
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

                        var couponCount = 0;
                        var freeCount = 0;
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].VCA_VCT_ID == 4) {
                                freeCount++
                            } else {
                                couponCount++;
                            }
                        }
                        self.model.set({
                            coupon: data,
                            freeCount: freeCount,
                            couponCount: couponCount
                        });
                    }
                }
            });
        },

        onDestory: function () {
        }
    });
});
