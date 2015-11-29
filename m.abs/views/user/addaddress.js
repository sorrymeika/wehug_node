var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model2');
var Scroll = require('widget/scroll');
var Selector = require('widget/selector');
var animation = require('animation');
var api = require('models/base');

module.exports = Activity.extend({
    events: {
        'tap .js_submit:not(.disabled)': function () {
        },
        'tap .js_area': function () {
            this.selector.show();
        }
    },

    onCreate: function () {
        var self = this;
        var $main = self.$('.main');

        self.swipeRightBackAction = self.route.query.from || '/address';

        Scroll.bind($main);

        self.model = new model.ViewModel(this.$el, {
            back: self.swipeRightBackAction,
            title: '添加地址',
            address: {
                isDefault: true
            }
        });

        self.selector = new Selector({
            options: [{
                template: '<li><%=name%></li>',
                onChange: function (e, i, data) {
                }
            }, {
                    template: '<li><%=name%></li>'
                }],
            complete: function (res) {
                console.log(res);
            }
        });

        self.selector.eq(0).set([{
            name: '省'
        }]);

        this.province = new api.ProvinceAPI({
            $el: self.$('.js_area'),
            success: function (res) {
                console.log(this.province);
            }
        });
        this.province.load();
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
    }
});
