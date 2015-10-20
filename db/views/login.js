define(function (require, exports, module) {


    var $ = require('$');
    var util = require('util'),
        Page = require('core/page'),
        model = require('core/model2'),
        Form = require('components/form2');

    return Page.extend({
        events: {},

        onCreate: function () {
            var self = this;

            self.$el.siblings().hide();



            this.model = new model.ViewModel(this.$el, {
                title: '连接服务器',
                selectConnection: function (e) {
                    var model = e.model;
                    this.set({
                        user: model.data
                    });
                },
                buttons: [{
                    value: '确认',
                    click: function () {
                        form.submit(function (res) {
                            if (res.success) {
                                sl.tip('登录成功');
                                self.back('/');

                            } else {
                                sl.tip(res.msg);
                            }
                        });
                    }
                }]
            });

            $.get('/api/mysql/config', function (res) {
                if (res.success && res.data) {
                    self.model.set({
                        user: res.data.currentConnection,
                        connections: res.data.connections
                    });
                }
            }, 'json');

            var form = new Form({
                model: this.model,
                name: 'user',
                url: '/api/mysql/connect',
                enctype: '',
                fields: [{
                    label: '主机',
                    field: 'host',
                    emptyAble: false,
                    emptyText: '不可为空'
                }, {
                    label: '用户名',
                    field: 'user',
                    emptyAble: false,
                    emptyText: '不可为空'
                }, {
                    label: '密码',
                    field: 'password',
                    type: 'password',
                    emptyAble: false,
                    emptyText: '不可为空'
                }]
            });

            form.$el.insertBefore(this.$('.action'))
        },

        onShow: function () {
        },

        onDestory: function () {
        }
    });
});

