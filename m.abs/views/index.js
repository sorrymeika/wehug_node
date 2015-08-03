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
