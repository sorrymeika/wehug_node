define(function (require, exports, module) {

    var $ = require('$'),
        util = require('util'),
        Page = require('core/page'),
        model = require('core/model'),
        Form = require('components/formjs');

    return Page.extend({
        events: {},

        onCreate: function () {
            this.model = new model.ViewModel(this.$el, {
                title: '登录',
                buttons: [{
                    value: '确认',
                    click: function () {
                        form.submit();
                    }
                }]
            });

            var form = new Form({
                model: this.model,
                name: 'user',
                title: 'test',
                useIframe: true,
                url: '/api/manage/login',
                validator: 'userValid',
                enctype: '',
                fields: [{
                    label: '账号',
                    field: 'name',
                    emptyAble: false,
                    emptyText: '不可为空'
                }, {
                    label: '密码',
                    field: 'password',
                    type: 'password',
                    emptyAble: false,
                    emptyText: '不可为空'
                }, {
                    label: '富文本',
                    vAlign: 'top',
                    field: 'content',
                    type: 'richTextBox',
                    emptyAble: false,
                    emptyText: '不可为空'
                }]
            });

            this.model.before('.action', form.$el);



            var a = {
                asdf: 1,
                asdf1: 1
            };
            var b = {
                asdf: 1,
                asdf1: 1
            };
            delete a.adsf;
            b.asdf = null;
            console.log(Date.now());

            var now = Date.now();
            for (var i = 0; i < 1000000; i++) {
                if (typeof a == 'function') {
                }
            }
            console.log(Date.now() - now);

            now = Date.now();
            for (var i = 0; i < 1000000; i++) {
                if ($.isFunction(a)) {
                }
            }
            console.log(Date.now() - now);
        },

        onShow: function () {
        },

        onDestory: function () {
        }
    });
});

