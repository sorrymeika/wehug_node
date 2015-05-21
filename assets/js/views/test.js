define(['$','util','bridge','activity','../widget/loading','../widget/slider','animation','../widget/scrollview'],function(require,exports,module) {

    var $=require('$'),
        util=require('util'),
        Activity=require('activity'),
        App=require('sl/app'),
        bridge=require('bridge'),
        Loading=require('../widget/loading'),
        Slider=require('../widget/slider'),
        animation=require('animation'),
        ScrollView=require('../widget/scrollview');

    return Activity.extend({
        template: 'template/test',

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
