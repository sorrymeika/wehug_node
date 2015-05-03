define(['$','util','bridge','../base','./tip'],function(require) {
    var $=require('$');
    var bridge=require('bridge');
    var util=require('util');
    var sl=require('../base');
    var tip=require('./tip');

    var Button=function($cont,options) {
        !($cont instanceof $)&&($cont=$($cont));

        this.$el=$(this.template(util.pick(options,['className','text']))).appendTo($cont);
        this.el=this.$el[0];
    };

    Button.prototype={
        template: util.template('<b class="btn<%=className?" "+className:""%>"><%=text%></b>')
    };

    return {
        create: function(container,options) {
            return new Button(container,options);
        },
        sync: function(fn,msg) {
            return function(e) {
                var $btn=$(e.currentTarget);
                if(!$btn.hasClass('disabled')) {

                    var that=this,
                    val=$btn[0].tagName=="INPUT"?"val":'html',
                    data=fn.call(this,e);

                    if(!data) return;

                    $btn.data('val',$btn[val]())
                    $btn.addClass('disabled')[val]("请稍候..."||msg);

                    $.ajax({
                        url: bridge.url(data.url),
                        type: data.type||'POST',
                        dataType: data.dataType||'json',
                        data: data.data,
                        success: function(res) {
                            data.success&&data.success.call(that,res);
                        },
                        error: (data.error||function(res) {
                            tip((res&&res.msg)||"网络错误");
                        }),

                        complete: function() {
                            $btn.removeClass('disabled')[val]($btn.data('val'));
                        }
                    });
                }
            }
        }
    }
});