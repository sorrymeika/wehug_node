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

                this.model.setState({
                    coupon: couponcode ? couponcode.CSV_CODE : '',
                    freecoupon: freecouponcode ? freecouponcode.CSV_CODE : ''
                });

                this.forward('/buy?coupon=' + (couponcode ? couponcode.CSV_CODE : '') + '&couponprice=' + (couponcode ? couponcode.VCA_DEDUCT_AMOUNT : '') + '&freecoupon=' + (freecouponcode ? freecouponcode.CSV_CODE : '') + '&points=' + this.model.get('Points') + '&from=' + encodeURIComponent(self.route.url));
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
                    if (!points) {
                        self.model.set({
                            isShowPoint: false
                        });
                        return;
                    }
                    points = parseFloat(points);
                    if (points > self.user.Points) {
                        sl.tip('您输入的数值已超过您的积分最大值，请重新输入');
                        return;
                    }
                    else if (points < 100 || points % 100 != 0) {
                        sl.tip('您输入的数值不是100的倍数，请重新输入');
                        return;
                    }

                    self.model.set({
                        isShowPoint: false,
                        Points: points
                    });
                },

                useCoupon: function (e, coupon) {
                    if (coupon.VCT_ID == 1 && coupon.VCA_MIN_AMOUNT > self.model.data.bag_amount) {
                        sl.tip('您的购物金额满' + coupon.VCA_MIN_AMOUNT + '元才可使用哦');
                        return;
                    }

                    self.model.set(coupon.VCT_ID == 4 ? {
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
                    res.coupon.sort(function (a, b) {
                        return a.CSV_END_DT > b.CSV_END_DT ? 1 : a.CSV_END_DT == b.CSV_END_DT ? 0 : -1;
                    });

                    self.model.set(res)
                        .set({
                            loading: false
                        });

                    var couponCount = 0;
                    var freeCount = 0;
                    for (var i = 0; i < res.coupon.length; i++) {
                        if (res.coupon[i].VCT_ID == 4) {
                            freeCount++
                        } else {
                            couponCount++;
                        }
                    }
                    self.model.set({
                        freeCount: freeCount,
                        couponCount: couponCount
                    });

                    console.log(res);
                }
            });

            self.initPoints();

            self.initCoupon();
            self.initModify();
            self.initDeletion();

            this.onResult('ResetCoupon', function () {
                self.model.set({
                    couponcode: null,
                    freecouponcode: null
                });
                self.model.setState({
                    coupon: '',
                    freecoupon: ''
                });
            });
        },

        doWhenLogin: function () {
            var self = this;
            this.user = util.store('user');
            self.cart.setParam({
                pspcode: self.user.Mobile
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
                el: self.$('.ct_list_wrap'),
                children: '.js_delete_item',
                width: 45,
                events: {
                    '.js_delete': function (e) {

                        var $target = $(e.currentTarget);
                        var id = $target.data('id');

                        if (id) {
                            self.cartDeleteApi.setParam({
                                spbId: id

                            }).load();
                        } else {
                            self.cartDeletePackageAPI.setParam({
                                wacid: $target.data('wacid'),
                                ppgid: $target.data('ppgid'),
                                groupid: $target.data('groupid')

                            }).load();
                        }

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

            self.cartDeletePackageAPI = new api.CartDeletePackageAPI({
                $el: self.$el,
                checkData: false,
                params: {
                    pspcode: self.user.Mobile
                },
                success: function (res) {
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
                        self.cart.reload();

                    } else {
                        sl.tip(res.msg);
                    }
                },
                error: function (res) {
                    sl.tip(res.msg);
                }
            });

        },
        onDestory: function () {
            this.model.setState({
                coupon: '',
                freecoupon: ''
            });
        }
    });
});
