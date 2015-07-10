define(function(require,exports,module) {

    var $=require('$');
    var util=require('util');
    var Activity=require('activity');
    var Loading=require('../widget/extend/loading');
    var model=require('../core/model');
    var Scroll=require('../widget/scroll');
    var animation=require('animation');


    return Activity.extend({
        events: {
            'tap .tabs_nav_con li:not(.curr)': function(e) {
                var $target=$(e.currentTarget);

                $target.addClass('curr').siblings('.curr').removeClass('curr');
                this.$panels.eq($target.index()).addClass('curr').siblings('.curr').removeClass('curr');
            }
        },

        onCreate: function() {
            var self=this;

            var $main=this.$('.main');

            Scroll.bind($main);

            this.model=new model.ViewModel(this.$el,{
                title: '老师详情页',
                back: this.route.queries.from||'/'
            });

            this.$panels=this.$('.tabs_panel');

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
                success: function(res) {
                    self.model.set(res.data);

                    localStorage.setItem('teacher',JSON.stringify(res.data));
                }
            });

            this.loading.load();
        },

        onShow: function() {
            var that=this;
        },

        onDestory: function() {
        }
    });
});
