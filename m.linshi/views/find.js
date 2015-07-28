define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var model = require('../core/model');
    var Loading = require('../widget/extend/loading');
    var Promise = require('../core/promise');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');
    var bridge = require('bridge');

    return Activity.extend({
        events: {
            'tap .js_buy:not(.disabled)': function (e) {
                var member = util.store('member');
                if (!member) {
                    this.forward('/login?from=' + this.route.url);
                    return;
                }

                var data = this.model.data.data;
                var $target = $(e.currentTarget);

                $target.addClass('disabled');

                this.loading.setParam({
                    member_id: member.member_id,
                    total_price: data.SpecialPrice,
                    payment_price: data.SpecialPrice,
                    total_time: 1,
                    course_id: data.RelativeID,
                    class_method_id: 1,
                    coupon_id: 11,
                    coupon_price: data.Price - data.SpecialPrice,
                    class_address: '',
                    student_name: ''

                }).load();

            },
            'tap .js_back': function (e) {
                this.back('/find')
            },
            'tap .js_share': function (e) {
                alert('linshi://' + JSON.stringify({
                    method: "share",
                    params: {
                        shareTitle: "分享的标题",
                        shareContent: "分享的内容",
                        shareUrl: location.href
                    }
                }));
            }
        },

        className: 'piano_bg',

        onCreate: function () {
            var self = this;

            if (sl.hasStatusBar) {
                this.$el.find('header').css({ borderTop: '20px solid #f90', 'box-sizing': 'content-box' });
                this.$el.find('.main').css({ top: 67 });
            }

            model.Filter.htmlString = function (str) {
                return str && str.replace(/\r\n/mg, '<br>').replace(/\n/mg, '<br>').replace(/\r/mg, '<br>');
            }

            Scroll.bind(this.$el.find('.main'));

            this.$buy = this.$el.find('.js_buy');

            this.$share = this.$el.find('.js_share');
            if (!sl.isInApp) {
                this.$share.hide();

                if (util.isInWechat) {
                    seajs.use('http://res.wx.qq.com/open/js/jweixin-1.0.0.js', function (wx) {
                    });
                }
            }

            this.model = new model.ViewModel(this.$el, {
                title: '老师详情',
                data: util.store('find_data')
            });

            this.loading = new Loading({
                $el: this.$el,
                url: '/order/buy_course',
                method: 'POST',
                check: false,
                checkData: false,
                success: function (res) {
                    self.$buy.removeClass('disabled');
                    var data = self.model.data.data;

                    if (res.error_code == 1) {
                        sl.tip(res.error_msg);

                    } else if (sl.isInApp) {
                        alert("linshi://" + JSON.stringify({
                            method: 'pay',
                            params: {
                                order_code: res.data.order_code,
                                really_price: data.SpecialPrice,
                                subject: "钢琴",
                                teacherName: data.Title
                            }
                        }));

                    } else if (sl.isInWechat) {
                        self.forward('/order/' + res.data.order_code + "?from=" + self.route.url);

                    } else {
                        location.href = bridge.url('/alipay/index?out_trade_no=' + res.data.order_code)
                    }
                },
                error: function () {
                    sl.tip('生成订单失败');
                    this.hideLoading();
                    self.$buy.removeClass('disabled');
                }
            });
        },

        onLoad: function () {
        },

        onDestory: function () {
        }
    });
});
