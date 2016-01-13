var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model2');
var Scroll = require('widget/scroll');
var animation = require('animation');
var api = require('models/base');

module.exports = Activity.extend({
    events: {
        'tap .js_bind:not(.disabled)': function () {

        }
    },
    swipeRightBackAction: '/',

    onCreate: function () {
        var self = this;

        var $main = this.$('.main');

        self.user = util.store('user');

        Scroll.bind($main);

        this.model = new model.ViewModel(this.$el, {
            back: '/',
            title: '爱管家',
            displayType: 1,
            user: self.user
        });

        var listAPI = new api.StewardListAPI({
            $el: self.$el,
            params: $.extend({
                pspcode: self.user.PSP_CODE,
                pageSize: 10,
                currentpage: 1

            }, self.user.token),

            $scroll: $main,
            $content: $main,

            checkData: false,

            success: function (res) {
                if (res.data.length >= 10) {
                    res.total = (this.pageIndex + 1) * parseInt(this.pageSize)
                }

                self.model.set(res);
            },
            append: function (res) {
                if (res.data.length == 10)
                    res.total = (this.pageIndex + 1) * parseInt(this.pageSize);
                else if (!res.data.length) {
                    res.total = self.model.get('data').length;
                }
                
                self.model.getModel('data').add(res.data);
            }
        });
        listAPI.load();
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
    }
});