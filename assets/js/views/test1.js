define(function(require,exports,module) {

    var $=require('$'),
        util=require('util'),
        Activity=require('activity'),
        bridge=require('bridge'),
        Loading=require('../widget/loading'),
        Slider=require('../widget/slider'),
        animation=require('animation'),
        ScrollView=require('../widget/scrollview');

    return Activity.extend({
        template: 'template/test1',

        events: {},

        onCreate: function() {
            var that=this;

        },

        onShow: function() {
            var that=this;
        },

        onDestory: function() {
        }
    });
});
