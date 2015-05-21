define(function(require,exports,module) {
    var util=require('util');

    var $=require('$'),
        Activity=require('activity'),
        bridge=require('bridge'),
        Loading=require('../widget/loading'),
        Slider=require('../widget/slider');

    var animation=require('animation');

    var ScrollView=require('../widget/scrollview');

    return Activity.extend({
        template: 'template/index',

        events: {
            'tap': function() {
                alert(1);
                //this.forward('index1.html');
            },

            'tap .js_buy': function() { },
            'tap .js_create': function() {
            },
            'tap .js_buy': function() {
            }
        },

        swipeLeftForwardAction: '/test',

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
