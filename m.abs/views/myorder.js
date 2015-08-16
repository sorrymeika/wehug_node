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

            this.model = new model.ViewModel(this.$el, {
                back: '/',
                title: '我买到的',
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
                            status: 20,
                            payStatus: 0
                        }).reload();
                    }
                }
            });

            self.loading = new Loading({
                url: "/api/order/list",
                $el: this.$el,
                checkData: false,
                success: function (res) {
                    if (!res.data || res.data.length == 0) {
                        this.dataNotFound(res);
                    }
                    self.model.set("data", res.data);
                },
                append: function (res) {
                    self.model.get('data').append(res.data);
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
