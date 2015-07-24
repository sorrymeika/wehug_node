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
                title: '添加文案',
                buttons: [{
                    value: '确认',
                    click: function () {
                        form.submit(function (res) {
                            if (res.success) {
                                sl.tip('添加成功');
                                self.setResult('article_change');
                                self.back('/article_list');
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
                name: 'form',
                useIframe: true,
                url: '/api/manage/add_article',
                validator: 'formValid',
                enctype: '',
                fields: [{
                    label: '标题',
                    field: 'Title',
                    emptyAble: false,
                    emptyText: '必填'
                }, {
                    label: '副标题',
                    field: 'SubTitle',
                    emptyAble: false,
                    emptyText: '必填'
                }, {
                    label: '关联ID',
                    field: 'RelativeID',
                    type: 'number',
                    regex: /^\d+$/,
                    regexText: '必填数字'
                }, {
                    label: '价格',
                    field: 'Price',
                    regex: /^\d+(\.\d+){0,1}$/,
                    regexText: '必填数字'
                }, {
                    label: '特价',
                    field: 'SpecialPrice',
                    regex: /^\d+(\.\d+){0,1}$/,
                    regexText: '必填数字'
                }, {
                    label: '图片',
                    field: 'Pic',
                    type: 'file',
                    emptyAble: false,
                    emptyText: '不可为空'
                }, {
                    label: '排序权重',
                    field: 'Sort',
                    type: 'number',
                    emptyAble: false,
                    emptyText: '不可为空',
                    regex: /^\d+$/,
                    regexText: '必填数字'
                }, {
                    label: '正文',
                    field: 'Content',
                    vAlign: 'top',
                    type: 'textarea',
                    emptyAble: false,
                    emptyText: '不可为空'
                }, {
                    label: '文案1',
                    field: 'Content1',
                    vAlign: 'top',
                    type: 'textarea'
                }, {
                    label: '文案2',
                    field: 'Content2',
                    vAlign: 'top',
                    type: 'textarea'
                }, {
                    label: '文案3',
                    field: 'Content3',
                    vAlign: 'top',
                    type: 'textarea'
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
