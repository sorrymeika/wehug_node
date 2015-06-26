define(function (require,exports,module) {

    var $=require('$'),
        util=require('util'),
        Page=require('page');

    return Page.extend({
        //接口地址
        api: '',

        template: 'template/index',

        events: {},

        onCreate: function () {

        },

        onShow: function () {
        },

        onDestory: function () {
        }
    });
});
