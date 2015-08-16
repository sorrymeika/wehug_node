define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/loading');
    var model = require('../core/model');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');


    return Activity.extend({
        events: {},

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
                isOverdue: false
            });

            self.loading = new Loading({
                url: "/api/user/voucher_list",
                params: {
                    status: 0
                },
                $el: this.$el,
                checkData: false,
                success: function (res) {
                    if (!res.data || res.data.length == 0) {
                        this.dataNotFound(res);
                    }
                    self.model.set("data", util.find(res.data, function (item) {
                        return !item.IsOverdue;
                    }));
                    self.model.set("data1", util.find(res.data, function (item) {
                        return item.IsOverdue;
                    }));
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
