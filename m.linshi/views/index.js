define(function(require,exports,module) {

    var $=require('$');
    var util=require('util');
    var Activity=require('activity');
    var Loading=require('../widget/extend/loading');
    var model=require('../core/model');
    var Scroll=require('../widget/scroll');
    var animation=require('animation');


    return Activity.extend({
        template: 'template/index',

        events: {
            'tap [sn-repeat-name="data"][data-id]': function(e) {
                console.log(e.currentTarget.getAttribute('data-id'))
            },
            'tap .js_search': function(e) {
                this.load();
            }
        },

        load: function(resolve,reject,showLoading) {
            var self=this;

            this.loading.load({
                url: '/teacher/teacher_list',
                check: false,
                pageIndex: 1,
                showLoading: showLoading,
                success: function(res) {
                    if(res.data.length>=10)
                        res.total=(this.pageIndex+1)*this.pageSize;

                    self.model.set(res);

                    resolve&&resolve();
                },
                error: reject,
                refresh: function(res) {
                    if(res.data.length>=10) {
                        res.total=(this.pageIndex+1)*this.pageSize;
                    }

                    self.model.get('data').append(res.data);

                    resolve&&resolve();
                }
            });
        },

        onCreate: function() {
            var self=this;

            var $main=this.$('.main');

            Scroll.bind($main,{
                //useScroll: true,
                refresh: function(resolve,reject) {
                    self.load(resolve,reject,function() { });
                }
            });

            this.loading=new Loading(this.$el,{
                $list: $main.children(":first-child"),
                $scroll: $main
            });

            this.model=new model.ViewModel(this.$el,{
                city: {
                    name: '上海'
                }
            });

            this.load();
        },

        onShow: function() {
            var that=this;
        },

        onDestory: function() {
        }
    });
});
