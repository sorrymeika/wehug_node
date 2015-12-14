define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/loading');
    var model = require('core/model3');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');
    var bridge = require('bridge');
    var api = require('models/base');

    var IFRAME;

    return Activity.extend({
        events: {
            'tap .open_msg': function (e) {
                if ($(e.target).hasClass('open_msg')) {
                    $(e.target).removeClass('show');
                }
            },
            'tap .btn_go': function () {
                self.back('/all');
            }
        },

        swipeRightBackAction: '/',

        onCreate: function () {
            var self = this;
            var $main = this.$('.main');

            self.user = util.store('user');

            Scroll.bind($main);

            this.model = new model.ViewModel(this.$el, {
                back: '/',
                title: '我买到的',
                currentType: 0,
                isLoading: true
            });

            this.wxPayApi = new api.WxPayAPI({
                $el: self.$el,
                success: function (res) {
                    console.log(res);
                    bridge.open(res.url);
                }
            });

            $.extend(this.model, {
                select: function (e, type) {
                    if (!$(e.currentTarget).hasClass('curr')) {
                        $(e.currentTarget).addClass('curr').siblings('.curr').removeClass('curr');

                        self.loading.setParam(type == 0 ? {
                            status: 0,
                            payStatus: 0
                        } : type == 1 ? {
                            status: 0,
                            payStatus: 3
                        } : type == 2 ? {
                            status: 18,
                            payStatus: 0
                        } : type == 3 ? {
                            status: 19,
                            payStatus: 0
                        } : {
                                            status: 8,
                                            payStatus: 0
                                        }).reload();

                        this.set('currentType', type)
                    }
                },
                showExpress: function (e, item) {
                    item.set('showExpress', !item.showExpress);
                    e.stopPropagation();
                },
                openOrder: function (e, order) {
                    if (order.PUS_DESC == '待付款') {
                        /*
                        self.wxPayApi.setParam({
                            order_no: order.PUR_CODE
                        }).load();
                        
                         bridge.wx({
                            type: 'pay',
                            spUrl: api.API.prototype.baseUri + '/api/shop/wxcreateorder',
                            orderCode: order.PUR_CODE,
                            orderName: 'ABS商品',
                            orderPrice: order.PUR_AMOUNT
                        }, function (res) {
                            sl.tip(res.msg);
                        });
                        */
                        self.orderStatusAPI.showLoading();

                        setTimeout(function () {
                            self.orderStatusAPI.hideLoading();
                        }, 10000);

                        bridge.openInApp(api.API.prototype.baseUri + '/AlipayDirect/Pay/' + order.PUR_ID + "?UserID=" + self.user.ID + "&Auth=" + self.user.Auth);

                        /*
                                                if (!IFRAME) {
                                                    IFRAME = $('<iframe name="__order" style="width:0px;height:0px;"></iframe>').appendTo('body');
                                                }
                                                IFRAME.attr('src', api.API.prototype.baseUri + '/AlipayDirect/Pay/' + order.PUR_ID + "?UserID=" + self.user.ID + "&Auth=" + self.user.Auth);
                                                */
                    }
                    e.stopPropagation();
                },
                cancelOrder: function (e, order) {

                    self.confirm('你确定取消订单吗？', function () {
                        self.cancelOrderApi.setParam({
                            purcode: order.PUR_CODE

                        }).load();
                    });
                    e.stopPropagation();
                    e.preventDefault();
                },
                openPrd: function (e, prd, order) {
                    e.stopPropagation();
                    if (order.PUS_DESC != '待付款' || e.target.tagName == "IMG") {
                        if (prd.PRD_DISCONTINUED_FLAG) {
                            self.$open_msg.show();
                            self.$open_msg[0].clientHeight;
                            self.$open_msg.addClass('show');

                        } else if (prd.Url) {
                            self.forward('/item/' + prd.PRD_ID + "?from=" + encodeURIComponent(self.route.url));
                        }
                    } else {
                        this.openOrder(e, order);
                    }
                }
            })

            self.$open_msg = this.$('.open_msg').on($.fx.transitionEnd, function (e) {
                if (!self.$open_msg.hasClass('show')) {
                    self.$open_msg.hide();
                }
            });

            self.loading = new Loading({
                url: "/api/order/list",
                $el: this.$el,
                checkData: false,
                success: function (res) {
                    self.model.set({
                        isLoading: false,
                        data: res.data
                    });
                },
                append: function (res) {
                    self.model.getModel('data').add(res.data);
                }
            });


            self.loading.setParam({
                UserID: self.user.ID,
                Auth: self.user.Auth

            }).load();

            self.onResult("OrderChange", function () {
                self.loading.reload();
            });

            self.cancelOrderApi = new api.CancelOrderAPI({
                $el: this.$el,
                checkData: false,
                params: {
                    pspcode: self.user.Mobile
                },
                success: function (res) {
                    if (res.success) {
                        sl.tip('订单已成功取消');
                        self.loading.reload();
                    }
                },
                error: function (res) {
                    sl.tip(res.msg);
                }
            });

            self.orderStatusAPI = new api.OrderStatusAPI({
                $el: this.$el,
                success: function (res) {
                    if (res.status == 0) {
                        self.timer = setTimeout(function () {
                            self.checkStatus();
                        }, 1500);

                    } else if (res.status == 3) {
                        self.forward("/news/order" + self.route.query.id);
                    }
                }
            });
        },

        checkStatus: function () {
            var self = this;

            self.timer && clearTimeout(self.timer);

            if (self.route.query.id) {
                self.orderStatusAPI.setParam({
                    id: self.route.query.id

                }).load();
            }
        },

        onShow: function () {
            var self = this;

            self.checkStatus();
        },

        onDestory: function () {
            var self = this;
            self.timer && clearTimeout(self.timer);
        }
    });
});
