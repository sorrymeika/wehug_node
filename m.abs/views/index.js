define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/loading');
    var Slider = require('../widget/slider');
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
                title: 'ABS + CLUB'
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

            console.log(util.circlePoint(0, 0, 91, 90 + 117));

            this.setPercent(55);
        },

        setPercent: function (percent) {
            var self = this;
            var deg = percent / 50 * 117 - 117;

            animation.animate(function (d) {
                var curr = animation.step(-117, deg, d);
                var point = util.circlePoint(0, 0, 91, 90 - curr);

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
            self.model.set('isLogin', !!self.user);
            self.model.set('isLogin', true);
        },

        onDestory: function () {
        }
    });
});
