define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var model = require('core/model');
    var Page = require('common/page');
    var menu = require('common/menu');
    var Form = require('components/form');

    return Page.extend({
        events: {},

        onCreate: function () {
            var self = this;

            this.model = new model.ViewModel(this.$el, {
                title: '添加推荐',
                buttons: [{
                    value: '确认',
                    click: function () {
                        form.submit(function (res) {
                            if (res.success) {
                                sl.tip('添加成功');
                                self.setResult('recommend_change');
                                self.back('/recommend_list');
                                form.reset();

                            } else {
                                sl.tip(res.msg);
                            }
                        });
                    }
                }, {
                    value: '重置',
                    click: function () {
                        form.reset();
                    }
                }]
            });

            var form = new Form({
                model: this.model,
                name: 'user',
                title: 'test',
                useIframe: true,
                url: '/api/manage/add_recommend',
                validator: 'userValid',
                enctype: '',
                fields: [{
                    field: 'areaId',
                    type: 'hidden',
                    value: util.store('global_area')
                }, {
                    label: '推荐名称',
                    field: 'name',
                    emptyAble: false,
                    emptyText: '必填'
                }, {
                    label: '推荐图片',
                    field: 'pic',
                    type: 'file',
                    emptyAble: false,
                    emptyText: '不可为空'
                }, {
                    label: '推荐详情',
                    field: 'content',
                    vAlign: 'top',
                    type: 'richTextBox',
                    emptyAble: false,
                    emptyText: '不可为空'
                }]
            });

            this.model.before('.action', form.$el);
        },

        onShow: function () {
            this.menu = menu.get(this.route.path);
            this.$el.before(this.menu.$el);
        },

        onDestory: function () {
        }
    });
});
