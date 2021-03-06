﻿define(function (require, exports, module) {

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
                title: '添加活动',
                buttons: [{
                    value: '确认',
                    click: function () {
                        form.submit(function (res) {
                            if (res.success) {
                                sl.tip('添加成功');
                                self.setResult('activity_change');
                                self.back('/activity_list');
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
                }],
                user: {
                    areaId: util.store('global_area')
                }
            });

            var form = new Form({
                model: this.model,
                name: 'user',
                title: 'test',
                useIframe: true,
                url: '/api/manage/add_activity',
                validator: 'userValid',
                enctype: '',
                fields: [{
                    field: 'areaId',
                    type: 'hidden'
                }, {
                    label: '活动名称',
                    field: 'name',
                    emptyAble: false,
                    emptyText: '必填'
                }, {
                    label: '活动地址',
                    field: 'address',
                    emptyAble: false,
                    emptyText: '必填'
                }, {
                    label: '活动图片',
                    field: 'pic',
                    type: 'file',
                    emptyAble: false,
                    emptyText: '不可为空'
                }, {
                    label: '活动开始时间',
                    field: 'startTime',
                    type: 'timepicker',
                    emptyAble: false,
                    emptyText: '不可为空'
                }, {
                    label: '活动结束时间',
                    field: 'finishTime',
                    type: 'timepicker',
                    emptyAble: false,
                    emptyText: '不可为空'
                }, {
                    label: '活动详情',
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
