define(['$','util','bridge','activity','../widget/loading','../widget/slider','animation','../widget/scrollview'],function(require,exports,module) {
    var util=require('util');

    var $=require('$'),
        Activity=require('activity'),
        App=require('sl/app'),
        bridge=require('bridge'),
        Loading=require('../widget/loading'),
        Slider=require('../widget/slider');

    var animation=require('animation');

    var ScrollView=require('sl/widget/scrollview');

    return Activity.extend({
        template: 'template/index',

        events: {
            'tap': function() {
                // this.$('.main,.scroll').iScroll('refresh');
                //this.forward('index1.html');
            },

            'tap .js_buy': function() { },
            'tap .js_create': function() {
                if(!this.slider) {
                    sl.tip('T恤尚未载入，请稍候');
                } else {
                    var data=this.slider.data();

                    util.store('product',data);

                    this.forward('/create/'+data.WorkID+'.html');
                }
            },
            'tap .js_buy': function() {
                var data=this.slider.data();

                util.store('product',data);
                this.forward('/product/'+data.WorkID+'.html');
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
