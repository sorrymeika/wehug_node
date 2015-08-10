define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var model = require('../core/model');
    var Loading = require('../widget/extend/loading');
    var wxshare = require('../widget/extend/wxshare');
    var Promise = require('../core/promise');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');
    var bridge = require('bridge');

    return Activity.extend({
        events: {
            'tap .js_buy:not(.disabled)': function (e) {
                var member = util.store('member');
                if (!member) {
                    this.forward('/login?success=' + this.route.url + '&from=' + this.route.url);
                    return;
                }

                var data = this.model.data.data;
                var $target = $(e.currentTarget);

                $target.addClass('disabled');

                this.loading.setParam({
                    member_id: member.member_id,
                    total_price: data.Price,
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

                this.back(this.type ? '/findlist' + (this.route.template == "template/find2" ? '2' : '') + '/' + this.type : '/find');
            },
            'tap .js_share': function (e) {
                alert('linshi://' + JSON.stringify({
                    method: "share",
                    params: $.extend(wxshare.getShareData(this.type || 0), {
                        shareUrl: location.href
                    })
                }));
            }
        },

        className: 'piano_bg',

        onCreate: function () {
            var self = this;

            this.type = !this.route.data.type || this.route.data.type == 0 ? '' : this.route.data.type;
            if (this.type) {
                this.$('.piano_hd').css({ backgroundImage: getComputedStyle(this.$('.piano_hd')[0]).backgroundImage.replace('.jpg', this.type + '.jpg') });
                this.$el.addClass('find' + this.type);
            }

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
                    wxshare($.extend(wxshare.getShareData(this.type || 0), {
                        shareUrl: location.href
                    }));
                }
            }

            var data = util.store('find_data');

            this.model = new model.ViewModel(this.$el, {
                title: '老师详情',
                data: data
            });

            if (!data || data.ID != this.route.data.id) {
                $.get('data/find' + this.type + '.json', function (res) {
                    self.model.set('data', util.first(res.data, function (item) {
                        return item.ID == self.route.data.id;
                    }));
                    util.store('find_data', self.model.data.data);
                }, 'json');
            }

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

                    } else {
                        var orderInfo = {
                            order_code: res.data.order_code,
                            really_price: data.SpecialPrice,
                            subject: "钢琴",
                            id: self.route.data.id,
                            teacherName: data.Title
                        };
                        util.store('orderInfo', orderInfo);

                        if (sl.isInApp) {
                            alert("linshi://" + JSON.stringify({
                                method: 'pay',
                                params: orderInfo
                            }));

                        } else if (util.isInWechat) {
                            location.href = 'http://' + (sl.isDebug ? 'front' : 'www') + '.linshi.biz/wxpay/index?out_trade_no=' + res.data.order_code + "&return=" + encodeURIComponent(location.href) + "&show=" + encodeURIComponent(location.href);
                            //self.forward('/order/' + res.data.order_code + "?from=" + self.route.url);

                        } else {
                            self.forward('/order/' + res.data.order_code + "?paytype=alipay&from=" + self.route.url + "&show=" + encodeURIComponent(location.href));
                        }
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
