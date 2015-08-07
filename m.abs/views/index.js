﻿define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/loading');
    var Slider = require('../widget/slider');
    var model = require('../core/model');
    var Scroll = require('../widget/scroll');
    var barcode1 = require('../widget/barcode');
    var barcode = require('../util/barcode');
    var animation = require('animation');


    var points = [1000, 4000, 5000, 45000];
    var pointPercent = function (point) {
        var result = 0;
        for (var i = 0; i < points.length; i++) {
            if (point <= points[i]) {
                result += point * 25 / points[i];
                break;
            } else {
                result += 25;
                point -= points[i];
            }
        }
        return result;
    };

    return Activity.extend({
        events: {
            'tap': function (e) {
                if (e.target == this.el) {
                    this.back('/')
                }
            },
            'tap .head_menu': function (e) {
                this.forward('/menu');
            },
            'tap .js_comment_list [data-id]': function (e) {
            },
            'tap .footer li': function (e) {
                var $target = $(e.currentTarget);
                if (!$target.hasClass('curr')) {
                    var index = $target.index();
                    $target.addClass('curr').siblings('.curr').removeClass('curr');
                    this.$main.eq(index).show().siblings('.main').hide();

                    switch (index) {

                    }
                }
            }
        },

        swipeRightForwardAction: '/menu',

        className: 'home',
        titles: ['欢迎来到ABS会员俱乐部', '马上购物', '附件门店', '我'],

        onCreate: function () {
            var self = this;

            //sector

            this.model = new model.ViewModel(this.$el, {
                menu: 'head_menu',
                titleClass: 'head_title',
                title: 'ABS + CLUB',
                isLogin: false
            });

            var $main = this.$main = this.$('.main');

            Scroll.bind($main);

            var loading = new Loading({
                url: "",
                $el: $main.eq(3),
                $content: $main.eq(3).children(":first-child"),
                $scroll: $main.eq(3),
                success: function (res) {
                    self.model.set("data" + index, res.data);
                },
                append: function (res) {
                    self.model.get('data' + index).append(res.data);
                }
            });

            this.$points = this.$('.home_points');
            this.$cursor = this.$('.home_points_cursor');
        },

        setRainbow: function () {
            var self = this;
            var total = this.user.Amount;
            var percent = pointPercent(total);
            var deg = percent / 50 * 117 - 117;
            var level;
            var nextLevel;

            self.model.set('vip', total < 1000 ? (level = 0, nextLevel = 1000 - total, '银卡会员') : total < 5000 ? (level = 1, nextLevel = 5000 - total, '金卡会员') : total < 10000 ? (level = 2, nextLevel = 10000 - total, '钻石会员') : total < 50000 ? (level = 3, nextLevel = 50000 - total, 'VIP会员') : (level = 4, nextLevel = 0, 'SVIP会员'));

            this.$('.rainbow_vip :nth-child(' + (level + 1) + ')').addClass('curr');

            self.model.set('nextLevel', "+" + nextLevel);

            animation.animate(function (d) {
                var curr = animation.step(-117, deg, d);
                var num = Math.round(animation.step(0, total, d));
                var point = util.circlePoint(0, 0, 91, 90 - curr);

                if (point.x > 0) {
                    if (deg == 0) {
                        point.x = 0;
                    } else if (deg < 55) {
                        point.x -= 4;
                        point.y += 2;
                    } else if (deg < 80) {
                        point.x -= 7;
                    } else {
                        point.x -= 9;
                        point.y += 2;
                    }
                } else {
                    point.y += 2;
                }

                self.model.set('point', num);

                self.$cursor.css({
                    '-webkit-transform': 'rotate(' + deg + 'deg)',
                    top: 91 - point.y,
                    left: 91 + point.x
                });

            }, 300, 'ease-out')

            if (percent > 50) {
                this.$points.eq(0).animate({
                    rotate: '0deg'
                }, 300, 'ease-out');
            }
            this.$points.eq(1).animate({
                rotate: deg + 'deg'

            }, 300, 'ease-out');
        },

        onShow: function () {
            var self = this;

            self.user = util.store('user');
            var isLogin = !!self.user;
            self.model.set('isLogin', isLogin);

            if (isLogin) {
                self.showPoints();
                self.model.set('barcode', barcode.code93(self.user.Mobile).replace(/0/g, '<em></em>').replace(/1/g, '<i></i>'))
            }
        },

        showPoints: function () {

            this.setRainbow(this.user.Amount);

            this.$('.point_tip').addClass('show');
        },

        onLoad: function () {
        },

        onDestory: function () {
        }
    });
});
