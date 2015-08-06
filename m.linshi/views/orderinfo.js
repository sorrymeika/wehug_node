define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/extend/loading');
    var model = require('../core/model');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');

    return Activity.extend({
        events: {
            'tap': function (e) {
                if (e.target == this.el) {
                    this.back('/')
                }
            }
        },

        swipeRightBackAction: '/orderlist',

        onCreate: function () {
            var self = this;

            var $main = this.$('.main');

            this.model = new model.ViewModel(this.$el, {
                back: '/orderlist',
                title: '订单详情',
                cancel: function () {
                    self.cancel.load();
                },
                pay: function () {
                    var order_info = this.data.order_info;
                    var orderInfo = {
                        order_code: order_info.order_code,
                        really_price: order_info.payment_price,
                        subject: this.data.teacher_info.discipline,
                        teacherName: this.data.teacher_info.teacher_name
                    };
                    util.store('orderInfo', orderInfo);

                    if (util.isInWechat) {
                        location.href = 'http://' + (sl.isDebug ? 'front' : 'www') + '.linshi.biz/wxpay/index?out_trade_no=' + order_info.order_code + "&return=" + encodeURIComponent(location.href) + "&show=" + encodeURIComponent(location.href);
                        //self.forward('/order/' + res.data.order_code + "?from=" + self.route.url);

                    } else {
                        self.forward('/order/' + order_info.order_code + "?paytype=alipay&from=" + self.route.url + "&show=" + encodeURIComponent(location.href));
                    }
                }
            });

            Scroll.bind($main);

            model.Filter.getOrderStatus = function (status) {
                var result;
                switch (status) {
                    case 1:
                        result = '已取消';
                        break;
                    case 2:
                        result = "待确认课酬";
                        break;
                    case 3:
                        result = "已确认课酬";
                        break;
                    case 4:
                        result = "待评价";
                        break;
                    case 5:
                        result = "已评价，已完成";
                        break;
                    case 6:
                        result = "待付款";
                        break;
                }
                return result;
            }

            this.loading = new Loading({
                url: '/order/order_info',
                params: {
                    order_code: this.route.data.code
                },
                checkData: false,
                check: false,
                $el: this.$el,
                success: function (res) {
                    self.model.set(res.data);
                }
            });

            this.cancel = new Loading({
                url: '/order/cancel_order',
                params: {
                    order_code: this.route.data.code
                },
                checkData: false,
                check: false,
                $el: this.$el,
                success: function (res) {
                    if (res.error_code == 0) {
                        self.model.set('order_info.order_status', 1);
                        self.setResult('order_cancel', self.route.data.code);
                    }
                    sl.tip(res.error_msg);
                }
            });
        },

        onShow: function () {
            var self = this;
            var member = util.store('member');

            if (!member) {
                this.forward('/login?success=' + this.route.url + "&from=/");
            } else if (!this.isLoad) {
                this.isLoad = true;
                this.model.set('member', member);
                this.member = member;

                this.loading.setParam({
                    member_id: member.member_id

                }).load();

                this.cancel.setParam({
                    member_id: member.member_id
                });
            }
        },

        onDestory: function () {
        }
    });
});
