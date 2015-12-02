var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model3');
var Scroll = require('widget/scroll');
var animation = require('animation');
var api = require('models/base');

module.exports = Activity.extend({
    events: {
        'tap .js_bind:not(.disabled)': function () {
        },
        'tap .js_add_address': function () {
            this.forward('/addaddress?from=' + encodeURIComponent(this.route.url));
        }
    },

    onCreate: function () {
        var self = this;
        var $main = self.$('.main');

        self.user = util.store('user');

        self.swipeRightBackAction = self.route.query.from || '/';

        Scroll.bind($main);

        self.model = new model.ViewModel(this.$el, {
            back: self.swipeRightBackAction,
            title: '收获地址'
        });

        self.model.forward = function (e, id) {
            var address = util.first(self.model.get('data'), function (item) {
                return item.AddressID == id;
            });

            util.store('address', address);
            self.forward('/addaddress?edittype=1&id=' + id);
        }

        var address = new api.AddressListAPI({
            $el: this.$el,
            params: {
                pspcode: self.user.Mobile
            },
            success: function (res) {
                console.log(res);

                self.model.set({
                    data: res.data
                });
            }
        });
        address.load();

    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
    }
});
