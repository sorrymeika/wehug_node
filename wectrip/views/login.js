define(function (require,exports,module) {

    var $=require('$'),
        util=require('util'),
        Page=require('core/page'),
        model=require('core/model'),
        Form=require('components/formjs');

    return Page.extend({
        events: {},

        onCreate: function () {
            this.model=new model.ViewModel(this.$el,{
                buttons: [{
                    value: '提交',
                    click: function () {
                        form.submit();
                    }
                }]
            });

            var form=new Form({
                model: this.model,
                name: 'user',
                title: 'test',
                url: '',
                validator: 'userValid',
                enctype: '',
                fields: [{
                    label: '姓名',
                    field: 'name',
                    emptyAble: false,
                    emptyText: '不可为空'
                }]
            });

            this.model.append(form.$el);
        },

        onShow: function () {
        },

        onDestory: function () {
        }
    });
});

