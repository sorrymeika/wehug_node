define(['$','util','bridge','sl/activity','sl/widget/loading','sl/widget/slider','tween','sl/vdom','sl/images','sl/widget/scrollview'],function(require,exports,module) {
    var util=require('util');

    var $=require('$'),
        Activity=require('sl/activity'),
        App=require('sl/app'),
        Touch=require('sl/touch'),
        bridge=require('bridge'),
        Loading=require('sl/widget/loading'),
        Slider=require('sl/widget/slider');

    var VirtualDom=require('sl/vdom');
    var ImageCanvas=require('sl/images');
    var tween=require('sl/tween');

    var ScrollView=require('sl/widget/scrollview');

    return Activity.extend({
        template: 'views/index1.html',

        events: {
            'tap': function() {
            }
        },

        //swipeRightForwardAction: '/menu/index.html',

        //useScroll: true,

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
