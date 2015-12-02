define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('widget/loading');
    var model = require('core/model3');
    var Scroll = require('widget/scroll');
    var Share = require('components/share');
    var animation = require('animation');
    var api = require('models/base');

    return Activity.extend({
        events: {
            'tap .js_buy:not(.disabled)': function () {
                var self = this;

                self.cartAddAPI.load();
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

            self.user = util.store('user');

            self.model = new model.ViewModel(self.$el, {
                back: self.swipeRightBackAction,
                title: '床品',
                id: self.route.data.id,
                user: self.user,
                url: self.route.url
            });

            self.share = new Share({
                head: '分享商品至'
            });
            self.share.$el.appendTo(self.$el);

            var product = new api.ProductAPI({
                $el: self.$el,
                params: {
                    id: self.route.data.id
                },
                checkData: false,
                success: function (res) {
                    console.log(res.data);
                    self.model.set({
                        data: res.data
                    });
                    colorAndSpec.setParam({
                        id: res.data.PRD_PRH_ID
                    }).load();
                }
            });
            product.load();

            var colorAndSpec = new api.ProductColorAndSpec({
                $el: self.$el,
                checkData: false,
                success: function (res) {
                    var color = [];
                    var spec = [];
                    for (var i = 0, len = res.data.length; i < len; i++) {
                        var item = res.data[i];
                        if (color.indexOf(item.PRD_COLOR) == -1) {
                            color.push(item.PRD_COLOR);
                        }
                        if (spec.indexOf(item.PRD_SPEC) == -1) {
                            spec.push(item.PRD_SPEC);
                        }
                    }
                    console.log(res);
                    self.model.set({
                        color: color,
                        spec: spec
                    });
                }
            });

            self.cartAddAPI = new api.CartAddAPI({
                $el: self.$el,
                checkData: false,
                check: false,
                beforeSend: function () {
                    self.$('.js_buy').addClass('disabled');
                },
                params: {
                    pspcode: self.user.Mobile,
                    prd: self.model.get('id')
                },
                success: function (res) {
                    console.log(res);

                    if (res.success) {
                        self.forward('/cart?from=' + self.route.url);
                    }
                },
                complete: function () {
                    self.$('.js_buy').removeClass('disabled');
                }
            });
        },

        onShow: function () {
            var self = this;
        },

        onDestory: function () {
        }
    });
});
