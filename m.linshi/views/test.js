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
        template: 'template/test',

        events: {
            'tap': function() {
                this.forward('/test1');
            }
        },

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
