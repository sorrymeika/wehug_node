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
            'tap [data-id]': function (e) {
                this.forward('/orderinfo/' + e.currentTarget.getAttribute('data-id'));
            }
        },

        swipeRightBackAction: '/',

        onCreate: function () {
            var self = this;

            var $main = this.$('.main');

            this.model = new model.ViewModel(this.$el, {
                back: '/',
                title: '我的订单'
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
                url: '/order/order_list',
                params: {
                    sort: 'desc',
                    order_by: 'order_id',
                    member_id: ''
                },
                check: false,
                $el: this.$el,
                $content: $main.children(":first-child"),
                $scroll: $main,
                success: function (res) {
                    if (res.data.length >= 10)
                        res.total = (this.pageIndex + 1) * this.pageSize;


                    console.log(res.data[0])

                    self.model.set(res);
                },
                append: function (res) {
                    if (res.data.length >= 10) {
                        res.total = (this.pageIndex + 1) * this.pageSize;
                    }

                    self.model.get('data').append(res.data);
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
                    member_id: member.member_id

                }).load();
            }
        },

        onDestory: function () {
        }
    });
});
