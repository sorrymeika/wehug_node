define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var model = require('core/model');
    var Page = require('common/page');
    var menu = require('common/menu');
    var Form = require('components/form');
    var Grid = require('components/grid');

    return Page.extend({
        events: {},

        onCreate: function () {
            var self = this;

            this.model = new model.ViewModel(this.$el, {
                title: '目的地管理',
                content: '欢迎使用ABS APP后台'
            });
        },

        onShow: function () {
            this.menu = menu.get('/');
            this.$el.before(this.menu.$el);
        },

        onDestory: function () {
        }
    });
});
