define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/loading');
    var model = require('../core/model');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');
    var bridge = require('bridge');

    var cardAnimation = function (items) {

        if (items.eq(0).hasClass('show') || !items.length) return;

        var count = items.length;
        var index = count - 1;
        items.parent().css({ height: 100 * count });
        items.each(function (j, item) {
            item.style.zIndex = j;
        });
        setTimeout(function () {
            var next = arguments.callee;
            var item = items.eq(index);
            item[0].clientHeight;
            item.addClass('show').one($.fx.transitionEnd, function () { });

            setTimeout((function (i) {
                return function () {
                    item.animate({
                        opacity: 1,
                        translate: '0px,' + 100 * i + 'px'

                    }, i * 450, 'ease-out');

                    index--;
                    if (index >= 0) {
                        next();
                    }
                }

            })(index), 300);

        }, 200)
    };

    return Activity.extend({
        events: {

        },

        swipeRightBackAction: '/',

        onCreate: function () {
            var self = this;

            var $main = this.$('.main');

            Scroll.bind($main);

            model.Filter.cardClass = function (price) {
                return price <= 10 ? 'price10' : price <= 50 ? 'price50' : '';
            }

            this.model = new model.ViewModel(this.$el, {
                back: '/',
                title: '我的卡券',
                isOverdue: false,
                open: function () {
                    bridge.open('http://m.abs.cn');
                }
            });

            self.loading = new Loading({
                url: "/api/user/voucher_list",
                params: {
                    status: 1
                },
                $el: this.$el,
                check: false,
                checkData: false,
                success: function (res) {
                    if (!res || !res.data || res.data.length == 0) {
                        self.model.set("data", []);
                        self.model.set("data1", []);
                    }
                    else {
                        self.model.set("data", util.find(res.data, function (item) {
                            return !item.IsOverdue;
                        }));
                        self.model.set("data1", util.find(res.data, function (item) {
                            return item.IsOverdue;
                        }));
                        var $items = self.$('.js_not_overdue').children('li');

                        cardAnimation($items);
                    }
                }
            });

            self.model.on('change:isOverdue', function () {
                if (self.model.data.isOverdue) {
                    var $items = self.$('.js_overdue').children('li');

                    cardAnimation($items);
                }
            });

            self.user = util.store('user');
        },

        onShow: function () {
            var self = this;

            self.user = util.store('user');

            if (!self.user) {
                self.forward('/login?success=' + this.route.url + "&from=" + this.route.url);
            } else {

                if (!self.isLoad && (self.isLoad = true))
                    self.loading.setParam({
                        UserID: self.user.ID,
                        Auth: self.user.Auth

                    }).load();
            }
        },

        onDestory: function () {
        }
    });
});
