define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/extend/loading');
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
            'tap .citylistwrap': function (e) {
                if ($(e.target).hasClass("citylistwrap")) {
                    this.$citylist.removeClass("show");
                    this.$('.head_city').removeClass('select_city');
                    this.model.set('ico', 'head_menu');
                }
            },
            'tap .head_menu': function (e) {
                this.forward('/menu');
            },
            'tap .head_city': function (e) {
                var $target = $(e.currentTarget).toggleClass("select_city");
                if ($target.hasClass('select_city')) {
                    this.$citylist.show()[0].clientHeight;
                    this.$citylist.addClass("show");
                    this.model.set('ico', 'display_none');
                } else {
                    this.$citylist.removeClass("show");
                    this.model.set('ico', 'head_menu');
                }
            }
        },
        swipeRightForwardAction: '/menu',

        onCreate: function () {
            var self = this;

            var $main = this.$('.main');

            Scroll.bind($main);

            this.model = new model.ViewModel(this.$el, {
                ico: 'head_menu',
                title: '发现身边好老师',
                city: '上海',
                city_list: [{
                    city_name: '成都'
                }, {
                    city_name: '杭州'
                }, {
                    city_name: '南京'
                }]
            });

            this.$citylist = this.$('.citylistwrap');
            this.listenTo(this.$citylist, $.fx.transitionEnd, function () {
                if (!this.$citylist.hasClass('show')) {
                    this.$citylist.hide();
                }
            });

            self.$slider = self.$('.js_slider');

            this.loading = new Loading({
                url: '/ad/ad_list',
                params: {
                    postion_id: 1
                },
                check: false,
                checkData: false,
                $el: self.$slider,
                success: function (res) {
                    self.slider = new Slider(self.$slider, {
                        autoLoop: 4000,
                        itemTemplate: '<a href="<%=url%>"><img src="<%=pic%>"></a>',
                        data: res.data,
                        loop: true
                    })
                }
            });
            this.loading.load();
        },

        onShow: function () {
            var that = this;
        },

        onDestory: function () {
        }
    });
});
