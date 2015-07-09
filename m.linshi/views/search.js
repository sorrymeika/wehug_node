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
            'tap [sn-repeat-name="data"][data-id]': function (e) {
                this.forward('/teacher/'+e.currentTarget.getAttribute('data-id')+'?from='+this.route.url);
            },
            'tap .js_search': function (e) {
                this.loading.reload();
            }
        },

        onCreate: function () {
            var self=this;

            var $main=this.$('.main');

            Scroll.bind($main,{
                //useScroll: true,
                refresh: function (resolve,reject) {
                    self.loading.reload({
                        showLoading: false
                    },function (err,data) {
                        if(err) reject(err)
                        else resolve(data);
                    });
                }
            });

            this.loading=new Loading({
                url: '/teacher/teacher_list',
                check: false,
                $el: this.$el,
                $content: $main.children(":first-child"),
                $scroll: $main,
                success: function (res) {
                    if(res.data.length>=10)
                        res.total=(this.pageIndex+1)*this.pageSize;

                    self.model.set(res);
                },
                append: function (res) {
                    if(res.data.length>=10) {
                        res.total=(this.pageIndex+1)*this.pageSize;
                    }

                    self.model.get('data').append(res.data);
                }
            });

            this.model=new model.ViewModel(this.$el);
            this.loading.load();
        },

        onShow: function () {
            var that=this;
        },

        onDestory: function () {
        }
    });
});
