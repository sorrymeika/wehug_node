define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var model = require('core/model');
    var Page = require('common/page');
    var menu = require('common/menu');
    var Form = require('components/form');
    var adtypes = require('settings/data/adtypes');

    return Page.extend({
        events: {},

        onCreate: function () {
            var self = this;

            this.model = new model.ViewModel(this.$el, {
                title: 'app资源管理',
                buttons: [{
                    value: '确认',
                    click: function () {
                        form.submit(function (res) {
                            if (res.success) {
                                sl.tip('设置成功');

                            } else {
                                sl.tip(res.msg);
                            }
                        });
                    }
                }]
            });

            var form = new Form({
                model: this.model,
                name: 'mapping',
                useIframe: true,
                url: '/api/manage/set_resource_mapping',
                validator: 'updateValid',
                enctype: '',
                fields: [{
                    label: 'Key',
                    field: 'Key',
                    emptyAble: false,
                    emptyText: '必填'
                }, {
                    label: 'Value',
                    field: 'Value'
                }]
            });

            this.model.before('.action', form.$el);

            $.get('/api/settings/resourceMapping', function (res) {
                if (res.success && res.data) {
                    console.log(res);
                    self.$('.js_data').html(JSON.stringify(res.data));
                }
            }, "json");
        },

        onShow: function () {
            this.menu = menu.get(this.route.path);
            this.$el.before(this.menu.$el);
        },

        onDestory: function () {
        }
    });
});
