define(function (require,exports,module) {

    var $=require('$');
    var util=require('util');
    var Activity=require('activity');
    var Loading=require('../widget/extend/loading');
    var model=require('../core/model');
    var Scroll=require('../widget/scroll');
    var animation=require('animation');


    return Activity.extend({
        events: {
            'tap .js_bind:not(.disabled)': function () {

            }
        },
        swipeRightBackAction: '/',

        onCreate: function () {
            var self=this;

            var $main=this.$('.main');

            Scroll.bind($main);

            this.model = new model.ViewModel(this.$el, {
                back: '/',
                title: '设置',
                settings: [{
                    title: '关于我们'
                }]
            });

            var member = localStorage.getItem('member');
            if (member) {
                member = JSON.stringify(member);

                console.log(member);
            }
        },

        onShow: function () {
            var that=this;
        },

        onDestory: function () {
        }
    });
});
