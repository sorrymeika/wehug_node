define(function (require,exports,module) {

    var $=require('$'),
        util=require('util'),
        Page=require('page');

    return Page.extend({
        //{id}对应route中的{id}
        api: '/api/test/{id}',

        template: 'template/test',

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
