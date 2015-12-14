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
            'tap .js_coupon': function (e) {
                if ($(e.target).hasClass('js_coupon')) {
                    this.model.set({
                        isShowCoupon: false
                    })
                }
            },
            'tap .js_points': function (e) {
                if ($(e.target).hasClass('js_points')) {
                    this.model.set({
                        isShowPoint: false
                    });
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
                this.$points.show();

                self.model.set({
                    isShowPoint: true
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

            $.extend(self.model, {

                usePoint: function (e, points) {
                    if (points > self.user.Points) {
                        sl.tip('超过已有积分了');
                        return;
                    }
                    else if (parseFloat(points) % 100 != 0) {

                    }

                    self.model.set({
                        isShowPoint: false,
                        Points: points
                    });
                },

                useCoupon: function (e, coupon) {
                    self.model.set(coupon.VCA_VCT_ID == 4 ? {
                        freecouponcode: coupon
                    } : {
                            couponcode: coupon
                        }).set({
                            isShowCoupon: false
                        });
                }
            });

            self.cart = new api.CartAPI({
                $el: self.$el,
                checkData: false,
                success: function (res) {
                    self.model.set(res).set({
                        loading: false
                    });
                }
            });

            self.initPoints();

            self.initCoupon();
            self.initModify();
            self.initDeletion();
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
            } else {
                self.doWhenLogin();
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
            var isModifying = false;

            self.cartModifyApi = new api.CartModifyAPI({
                $el: self.$el,
                checkData: false,
                beforeSend: function () {
                    isModifying = true;
                },
                success: function (res) {
                    self.cart.reload();
                },
                error: function (res) {
                    sl.tip(res.msg);

                    self.model.getModel('data_baglist').find(function (item) {
                        return item.SPB_ID == self.modifySpbId;

                    }).set({
                        SPB_QTY: this.originQty
                    });
                },
                complete: function () {
                    isModifying = false;
                }
            });

            self.model.changeQty = function (e, item, qty) {
                var origin = parseInt(item.SPB_QTY);
                qty = parseInt(qty);
                if (!qty || isNaN(qty) || qty == origin) {
                    return;
                }
                self.modifySpbId = item.SPB_ID;

                $.extend(self.cartModifyApi, {
                    originQty: origin

                }).setParam({
                    pspcode: self.user.Mobile,
                    spbId: item.SPB_ID,
                    qty: qty
                }).load();
            }
        },

        initPoints: function () {
            var self = this;

            self.$points = self.$('.js_points');
            self.listenTo(self.$points, $.fx.transitionEnd, function (e) {
                if (self.$points.hasClass('out')) {
                    self.$points.hide();
                }
            });
        },

        initCoupon: function () {
            var self = this;

            self.$coupon = self.$('.js_coupon');
            self.listenTo(self.$coupon, $.fx.transitionEnd, function (e) {
                if (self.$coupon.hasClass('out')) {
                    self.$coupon.hide();
                }
            });

            this.model.couponGetApi = new api.CouponAPI({
                $el: this.$el,
                checkData: false,
                beforeSend: function () {
                    var code = self.model.get('code');
                    if (!code) {
                        sl.tip('请输入券号');
                        return false;
                    }
                    this.setParam({
                        csvcode: code
                    });
                },
                params: {
                    pspcode: self.user.Mobile
                },
                success: function (res) {
                    if (res.success) {
                        sl.tip('领取成功');
                        self.coupon.reload();

                    } else {
                        sl.tip(res.msg);
                    }
                },
                error: function (res) {
                    sl.tip(res.msg);
                }
            });
            
            //self.coupon = new api.AvailableCouponAPI({
            self.coupon = new Loading({
                url: "/api/user/voucher_list",
                params: {
                    pspcode: self.user.Mobile,
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
