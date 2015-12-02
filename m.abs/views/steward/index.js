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
            displayType: 1
        });

        var listAPI = new api.StewardListAPI({
            $el: self.$el,
            params: $.extend({
                pspid: self.user.ID,
                pagesize: 10,
                currentpage: 1
            }, self.user.token),
            
            success: function (res) {
                console.log(res);
                
                self.model.set(res);
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