define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('widget/loading');
    var model = require('core/model2');
    var Promise = require('core/promise');
    var Scroll = require('widget/scroll');
    var animation = require('animation');
    var bridge = require('bridge');

    return Activity.extend({
        events: {
            'tap .js_comment': function () {
                this.forward('/destcomment/' + this.route.data.id);
            }
        },

        swipeRightBackAction: '/',

        onCreate: function () {
            var self = this;

            this.promise = new Promise();
            this.$main = this.$('.main');

            Scroll.bind(this.$main);

            this.model = new model.ViewModel(this.$el, {
                title: '我的月礼',
                back: this.route.query.from || '/',
                user: util.store('user'),
                openPresent: function (e, item) {
                    if (item.data.CanGet) {
                        var params = '';
                        if (self.user.OpenUrl) {
                            params = self.user.OpenUrl.substr(self.user.OpenUrl.lastIndexOf('?'));
                        }
                        bridge.openInApp('http://m.abs.cn/free/' + item.data.FRE_ID + '.html' + params);
                    }
                },
                open: function () {
                    bridge.openInApp(self.user.OpenUrl || 'http://m.abs.cn');
                }
            });

            this.loading = new Loading({
                url: '/api/user/get_month_free',
                params: {
                    id: this.route.data.id
                },
                check: false,
                checkData: false,
                $el: this.$el,
                $content: this.$main.children(":first-child"),
                $scroll: this.$main,
                success: function (res) {
                    self.model.set({
                        currentMonth: res.currentMonth,
                        data: res.data
                    });

                    //self.$('.month').find('')
                }
            });

        },

        onShow: function () {
            var self = this;

            self.user = this.model.data.user || util.store('user');

            if (!self.user) {
                self.forward('/login?success=' + this.route.url + "&from=/");
            } else {
                self.model.set({ user: self.user })

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
