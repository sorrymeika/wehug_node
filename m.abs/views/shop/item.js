define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('widget/loading');
    var model = require('core/model2');
    var Scroll = require('widget/scroll');
    var Share = require('components/share');
    var animation = require('animation');
    var api = require('models/base');

    return Activity.extend({
        events: {
            'tap .js_buy:not(.disabled)': function () {
                var self = this;
                
                this.forward('/cart?from=' + this.route.url);
            },
            'tap .js_share': function () {
                this.share.show();
            },
            'tap .js_select_size': function () {
                this.$('.js_size').show();
                this.model.set({
                    isShowSize: true
                });
            },
            'tap .js_size': function (e) {
                if ($(e.target).hasClass('js_size')) {
                    this.model.set({
                        isShowSize: false
                    });
                }
            }
        },

        className: 'pd_item_bg',

        onCreate: function () {
            var self = this;
            var $main = self.$('.main');
            self.$size = this.$('.js_size');
            self.listenTo(self.$size, $.fx.transitionEnd, function (e) {
                if (self.$size.hasClass('out')) {
                    self.$size.hide();
                }
            })

            self.swipeRightBackAction = self.route.query.from || '/list';

            Scroll.bind($main);

            self.model = new model.ViewModel(self.$el, {
                back: self.swipeRightBackAction,
                title: '床品',
                id: 1
            });

            self.share = new Share({
                title: '分享商品至'
            });
            self.share.$el.appendTo(self.$el);

            var product = new api.ProductAPI({
                $el: self.$el,
                params: {
                    id: 1044
                },
                success: function (res) {
                    console.log(res);
                }
            });
            product.load();
            
        },

        onShow: function () {
            var self = this;
        },

        onDestory: function () {
        }
    });
});
