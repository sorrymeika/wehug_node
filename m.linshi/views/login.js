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
            'tap .js_bind:not(.disabled)': function() {
                var userName=this.model.get('userName');
                var password=this.model.get('password');

                if(!userName||!util.validateMobile(userName)) {
                    sl.tip('请输入正确的手机');
                    return;
                }
                if(!password) {
                    sl.tip('请输入密码');
                    return;
                }

                this.loading.setParam({
                    user_name: userName,
                    password: password
                }).load();
            }
        },

        onCreate: function() {
            var self=this;

            var $main=this.$('.main');

            Scroll.bind($main);

            this.model=new model.ViewModel(this.$el,{
                title: '绑定邻师账号',
                back: this.route.queries.from||'/'
            });

            this.loading=new Loading({
                url: '/user/login',
                method: 'POST',
                check: false,
                checkData: false,
                $el: this.$el,
                success: function(res) {
                    if(res.error_msg)
                        sl.tip(res.error_msg);
                    else {
                    }
                },
                error: function(res) {
                    sl.tip(res.msg);
                }
            });

        },

        onShow: function() {
            var that=this;
        },

        onDestory: function() {
        }
    });
});
