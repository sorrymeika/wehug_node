define(function (require,exports,module) {

    var $=require('$'),
        util=require('util'),
        Page=require('page')

    return Page.extend({
        template: 'template/index',

        events: {},

        onCreate: function () {
            var that=this;
        },

        onShow: function () {
            var that=this;
        },

        onDestory: function () {
        }
    });
});
