define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('widget/loading');
    var model = require('core/model3');
    var Scroll = require('widget/scroll');
    var animation = require('animation');
    var api = require('models/base');
    var bridge = require('bridge');

    return Activity.extend({
        events: {
            'tap .js_buy:not(.disabled)': function () {
                this.orderCreateApi.load();
            },
            'tap .js_address': function () {
                this.forward('/address?buy=1&from=' + encodeURIComponent(this.route.url));
            }
        },

        onCreate: function () {
            var self = this;
            var $main = self.$('.main');

            self.swipeRightBackAction = self.route.query.from || '/cart';
            self.user = util.store('user');

            Scroll.bind($main);

            self.model = new model.ViewModel(this.$el, {
                back: self.swipeRightBackAction,
                title: '确认订单',
                payType: 1,
                couponprice: 0,
                Points: self.route.query.points ? parseInt(self.route.query.points) : 0
            });

            var address = new api.AddressListAPI({
                $el: this.$el,
                params: {
                    pspcode: self.user.Mobile
                },
                checkData: false,
                success: function (res) {
                    if (res.data && res.data[0]) {
                        self.model.set({
                            address: util.first(res.data, function (item) {
                                return item.MBA_DEFAULT_FLAG
                            }) || res.data[0]
                        });
                    }
                }
            });
            address.load();

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

            self.cart.setParam({
                pspcode: self.user.Mobile
            });

            self.orderCreateApi = new api.OrderCreateAPI({
                $el: this.$el,
                beforeSend: function () {
                    var address = self.model.get('address');
                    if (!address) {
                        sl.tip('请填写收货地址信息');
                        return false;
                    }

                    this.setParam({
                        mba_id: address.AddressID,
                        pay_type: self.model.get('payType')
                    });

                },
                checkData: false,
                success: function (res) {
                    if (res.success) {
                        sl.tip("生成订单成功！");
                        self.setResult('OrderChange').setResult('ResetCoupon');

                        self.forward('/myorder?id=' + res.pur_id);

                        if (self.model.get('payType') == 1) {
                            bridge.openInApp(api.API.prototype.baseUri + '/AlipayDirect/Pay/' + res.pur_id + "?UserID=" + self.user.ID + "&Auth=" + self.user.Auth);
                             
                            /*
                           if (!IFRAME) {
                               IFRAME = $('<iframe name="__order" style="width:0px;height:0px;"></iframe>').appendTo('body');
                           }
                           IFRAME.attr('src', api.API.prototype.baseUri + '/AlipayDirect/Pay/' + res.pur_id + "?UserID=" + self.user.ID + "&Auth=" + self.user.Auth);
                           */

                        } else {
                            bridge.wx({
                                type: 'pay',
                                spUrl: api.API.prototype.baseUri + '/api/shop/wxcreateorder',
                                orderCode: res.code,
                                orderName: 'ABS商品',
                                orderPrice: res.puramount

                            }, function (res) {
                                sl.tip(res.msg);
                            });
                        }
                    }
                },
                error: function (res) {
                    sl.tip(res.msg);
                }
            });

            self.onResult('useAddress', function (e, address) {
                self.model.set({
                    address: address
                });
            });
        },

        onShow: function () {
            var self = this;

            var search = location.hash.substr(location.hash.indexOf('?'));
            var query = {};

            search.replace(/(?:\?|&|\b)(\w+)\=([^\&]*)/g, function (match, key, val) {
                query[key] = decodeURIComponent(val);
            });

            self.orderCreateApi.setParam({
                pspcode: self.user.Mobile,
                pay_type: 1,
                coupon: this.model.getState('coupon'),
                points: self.route.query.points,
                freecoupon: this.model.getState('freecoupon')
            });

            self.model.set({
                couponprice: self.route.query.couponprice ? parseInt(self.route.query.couponprice) : 0,
                freecouponcode: self.route.query.freecoupon,
            });

            self.cart.load();
        },

        onDestory: function () {
        }
    });
});
