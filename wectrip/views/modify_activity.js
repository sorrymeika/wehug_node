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
                title: '修改活动',
                buttons: [{
                    value: '确认',
                    click: function () {
                        form.submit(function (res) {
                            if (res.success) {
                                sl.tip('修改成功');
                                self.setResult('activity_change');
                                self.back('/activity_list');
                                self.form.reset();

                            } else {
                                sl.tip(res.msg);
                            }
                        });
                    }
                }]
            });

            $.get('/api/activity/get?id=' + this.route.data.id, function (res) {
                res.data.StartTime = util.formatDate(res.data.StartTime);
                res.data.FinishTime = util.formatDate(res.data.FinishTime);
                self.model.set(res);

            }, 'json')

            var form = new Form({
                model: this.model,
                name: 'data',
                title: 'test',
                useIframe: true,
                url: '/api/manage/modify_activity',
                validator: 'userValid',
                enctype: '',
                fields: [{
                    field: 'ID',
                    type: 'hidden'
                }, {
                    label: '活动名称',
                    field: 'Name',
                    emptyAble: false,
                    emptyText: '必填'
                }, {
                    label: '活动图片',
                    field: 'Pic',
                    type: 'file'
                }, {
                    label: '活动开始时间',
                    field: 'StartTime',
                    type: 'timepicker',
                    emptyAble: false,
                    emptyText: '不可为空'
                }, {
                    label: '活动结束时间',
                    field: 'FinishTime',
                    type: 'timepicker',
                    emptyAble: false,
                    emptyText: '不可为空'
                }, {
                    label: '是否推荐',
                    field: 'IsRecommend',
                    type: 'checkbox'
                }, {
                    label: '活动详情',
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
