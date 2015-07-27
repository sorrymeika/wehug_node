define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var model = require('../core/model');
    var Promise = require('../core/promise');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');

    return Activity.extend({
        events: {
            'tap .js_buy': function (e) {
                var $target = $(e.currentTarget);
            }
        },

        className: 'piano_bg',

        onCreate: function () {
            var self = this;

            this.promise = new Promise();

            Scroll.bind(this.$el);

            this.model = new model.ViewModel(this.$el, {
                data: util.store('find_data')
            });
        },

        onLoad: function () {
            this.promise.resolve();
        },

        onDestory: function () {
        }
    });
});
