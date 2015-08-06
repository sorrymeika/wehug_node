define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/extend/loading');
    var model = require('../core/model');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');
    var Slider = require('../widget/slider');

    return Activity.extend({
        events: {
            'tap .js_bind:not(.disabled)': function () {

            }
        },
        swipeRightBackAction: '/',

        onCreate: function () {
            var self = this;

            var $main = this.$('.main');

            Scroll.bind($main);

            this.model = new model.ViewModel(this.$el, {
                back: '/',
                title: '品牌老师馆'
            });

            self.$slider = self.$('.js_slider');

            this.loading = new Loading({
                url: '/ad/ad_list',
                params: {
                    postion_id: 5
                },
                check: false,
                checkData: false,
                $el: self.$slider,
                success: function (res) {
                    if (res.data) {
                        for (var i = 0; i < res.data.length; i++) {
                            var item = res.data[i];
                            if (item.url.indexOf('http://192.168') == 0 || item.url.indexOf('http://m.linshi.biz') == 0) {
                                var m = item.url.match(/#(.+)/);
                                if (m && self.application.route.match(m[1])) {
                                    item.url = m[1]
                                }
                            }
                        }
                        self.slider = new Slider(self.$slider, {
                            width: 80,
                            itemTemplate: '<a href="<%=url%>" forward><img src="<%=pic%>"></a>',
                            data: res.data,
                            loop: true
                        });
                    }
                }
            });
            this.loading.load();
        },

        onShow: function () {
            var self = this;
        },

        onDestory: function () {
        }
    });
});
