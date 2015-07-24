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
                title: '修改目的地',
                buttons: [{
                    value: '确认',
                    click: function () {
                        form.submit(function (res) {
                            if (res.success) {
                                sl.tip('修改成功');
                                self.setResult('destination_change');
                                self.back('/');
                                self.form.reset();

                            } else {
                                sl.tip(res.msg);
                            }
                        });
                    }
                }]
            });

            $.get('/api/destination/get?id=' + this.route.data.id, function (res) {
                self.model.set(res);

            }, 'json')

            var form = new Form({
                model: this.model,
                name: 'data',
                title: 'test',
                useIframe: true,
                url: '/api/manage/modify_destination',
                validator: 'userValid',
                enctype: '',
                fields: [{
                    field: 'ID',
                    type: 'hidden'
                }, {
                    label: '目的地名称',
                    field: 'Name',
                    emptyAble: false,
                    emptyText: '必填'
                }, {
                    label: '目的地图片',
                    field: 'MiddlePic',
                    type: 'file'
                }, {
                    label: '目的地大图',
                    type: 'file',
                    field: 'LargePic'
                }, {
                    label: '是否推荐',
                    field: 'IsRecommend',
                    type: 'checkbox'
                }, {
                    label: '目的详情',
                    field: 'Content',
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
