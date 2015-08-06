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
            },
            'tap .coupon_list > .coupon_item': function (e) {
                var id = $(e.currentTarget).data('id');
                var coupon = util.first(this.model.data.data, function (item) {
                    return id == item.coupon_id;
                });

                this.setResult('couponSelect', coupon);
                this.back(this.swipeRightBackAction);
            }
        },

        swipeRightBackAction: '/',

        onCreate: function () {
            var self = this;

            var $main = this.$('.main');
            this.$exchange = this.$el.find('.btn_exchange');

            this.swipeRightBackAction = this.route.query.from || '/';

            this.model = new model.ViewModel(this.$el, {
                back: this.swipeRightBackAction,
                title: '优惠券',
                exchange: function () {
                    if (!this.data.coupon_code) {
                        sl.tip('请输入优惠券码')
                    } else {
                        self.exchange.setParam({
                            member_id: self.member.member_id,
                            exchange_code: this.data.coupon_code

                        }).load();
                    }
                }
            });

            Scroll.bind($main, {
                refresh: function (resolve, reject) {
                    self.loading.reload({
                        showLoading: false
                    }, function (err, data) {
                        if (err) reject(err)
                        else resolve(data);
                    });
                }
            });

            model.Filter.couponPrice = function (coupon) {
                return coupon.coupon_id == 11 ? '1折' : (Math.round(coupon.price) + '元');
            }
            model.Filter.getCouponStatus = function (status) {
                var result;
                switch (parseInt(status)) {
                    case 1:
                        result = '未使用';
                        break;
                    case 2:
                        result = "已使用";
                        break;
                    case 3:
                        result = "已过期";
                        break;
                    case 4:
                        result = "已练结";
                        break;
                }
                return result;
            }

            this.loading = new Loading({
                url: '/coupon/coupon_list',
                params: {
                    sort: 'asc',
                    order_by: 'end_time'
                },
                check: false,
                checkData: false,
                $el: this.$el,
                $content: $main.children(":first-child"),
                $scroll: $main,
                success: function (res) {
                    if (res.data.length >= 10)
                        res.total = (this.pageIndex + 1) * this.pageSize;

                    self.model.set(res);

                    if (!res.data || !res.data.length) {
                        this.showError('暂无优惠券');
                    }
                },
                append: function (res) {
                    if (res.data.length >= 10) {
                        res.total = (this.pageIndex + 1) * this.pageSize;
                    }

                    self.model.get('data').append(res.data);
                }
            });

            this.exchange = new Loading({
                url: '/coupon/exchange_coupon',
                check: false,
                checkData: false,
                $el: this.$el,
                success: function (res) {
                    if (res.error_code == 0) {
                        self.loading.reload();
                        self.model.set('coupon_code', '');
                    }
                    else
                        sl.tip(res.error_msg);
                }
            });

        },

        onShow: function () {
            var self = this;
            var member = util.store('member');

            if (!member) {
                this.forward('/login?success=' + this.route.url + "&from=/");
            } else {
                this.model.set('member', member);
                this.member = member;

                this.loading.setParam({
                    member_id: member.member_id,
                    use_type: 1

                }).load();
            }
        },

        onDestory: function () {
        }
    });
});
