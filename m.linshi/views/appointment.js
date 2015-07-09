define(function (require,exports,module) {

    var $=require('$');
    var util=require('util');
    var Activity=require('activity');
    var Loading=require('../widget/extend/loading');
    var model=require('../core/model');
    var Scroll=require('../widget/scroll');
    var animation=require('animation');


    return Activity.extend({
        events: {},

        onCreate: function () {
            var self=this;

            var $main=this.$('.main');

            Scroll.bind($main);

            var teacher=JSON.parse(localStorage.getItem('teacher'));

            this.model=new model.ViewModel(this.$el,{
                title: '预约试听',
                back: '/teacher/'+teacher.basic_info.teacher_id,
                teacher: teacher.basic_info
            });

            this.loading=new Loading({
                url: '/teacher/teacher_info',
                params: {
                    teacher_id: this.route.data.id
                },
                check: false,
                checkData: false,
                $el: this.$el,
                $content: $main.children(":first-child"),
                $scroll: $main,
                success: function (res) {
                }
            });

        },

        onShow: function () {
            var that=this;
        },

        onDestory: function () {
        }
    });
});
