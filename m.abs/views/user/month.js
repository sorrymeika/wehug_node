﻿define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('widget/loading');
    var Slider = require('widget/slider');
    var model = require('core/model3');
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
            self.user = util.store('user');

            this.$main = this.$('.main');

            Scroll.bind(this.$main);

            this.model = new model.ViewModel(this.$el, {
                title: '我的月礼',
                back: this.route.query.from || '/',
                user: self.user,
                openPresent: function (e, item) {
                    if (item.data.CanGet) {
                        var params = '';
                        if (self.user.OpenUrl) {
                            params = self.user.OpenUrl.substr(self.user.OpenUrl.lastIndexOf('?'));
                        }
                        bridge.openInApp('http://m.abs.cn/free/' + item.data.FRE_ID + '.html' + params);
                    }
                }
            });

            self.$slider = this.$('.uc_month_slider');

            this.loading = new Loading({
                url: '/api/user/get_month_free',
                params: {
                    id: this.route.data.id,
                    UserID: self.user.ID,
                    Auth: self.user.Auth
                },
                check: false,
                checkData: false,
                $el: this.$el,
                $content: this.$main.children(":first-child"),
                $scroll: this.$main,
                success: function (res) {
                    self.model.set({
                        currentMonth: res.currentMonth,
                        data: res.data,
                        current: res.data && res.data[0],
                        year: res.year
                    });

                    self.slider = new Slider(self.$slider, {
                        itemTemplate: '<p class="img<%=CanGet?" canget":""%><%=Overdue?" disabled":""%>">\
                                    <img src="<%=FRE_TITLE_PIC%>" />\
                                </p>\
                                <span><%=Month%>月</span>',
                        data: res.data,
                        onChange: function (index) {
                            self.model.set({
                                current: res.data[index]
                            })
                        }
                    });
                }
            });

            self.doWhenLogin();
        },

        doWhenLogin: function () {
            var self = this;
            var total = Math.round(this.user.Amount);
            var percent = 1;
            var level;
            var nextLevel;
            var currentLevel;
            var levelAmounts;
            var levels = ['银卡会员', '金卡会员', '钻石会员', 'VIP会员', 'SVIP会员', '无敌会员'];

            self.model.set('vip', total < (levelAmounts = 1000) ? (level = 0, nextLevel = 1000 - total, levels[1]) : total < (levelAmounts = 5000) ? (level = 1, nextLevel = 5000 - total, levels[2]) : total < (levelAmounts = 10000) ? (level = 2, nextLevel = 10000 - total, levels[3]) : total < (levelAmounts = 50000) ? (level = 3, nextLevel = 50000 - total, levels[4]) : (level = 4, nextLevel = '0', levels[5]));

            percent = Math.min(1, total / levelAmounts);

            self.model.set({
                energy: total,
                nextLevel: nextLevel,
                currentLevel: levels[level],
                levelAmounts: levelAmounts,
                energyPercent: percent * 100 + '%',
                ucCardAmounts: util.formatMoney(total) + (total > 50000 ? '' : ('/' + util.formatMoney(levelAmounts)))
            });

            self.loading.setParam({
                UserID: self.user.ID,
                Auth: self.user.Auth

            }).load();
        },

        onShow: function () {
            var self = this;
        },

        onDestory: function () {
        }
    });
});