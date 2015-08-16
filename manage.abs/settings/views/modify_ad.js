﻿define(function (require, exports, module) {

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

            self.model.set('data', util.store('current_ad'));

            var form = new Form({
                model: this.model,
                name: 'data',
                title: 'test',
                useIframe: true,
                url: '/api/manage/modify_ad',
                validator: 'userValid',
                enctype: '',
                fields: [{
                    field: 'ID',
                    type: 'hidden'
                }, {
                    label: '广告位置',
                    field: 'Name',
                    type: 'select',
                    emptyAble: true,
                    options: {
                        data: adtypes
                    }
                }, {
                    label: '广告标题',
                    field: 'Title',
                    emptyAble: false,
                    emptyText: '必填'
                }, {
                    label: '广告链接',
                    field: 'Url',
                    emptyAble: false,
                    emptyText: '必填'
                }, {
                    label: '广告图片',
                    field: 'Src',
                    type: 'file',
                    emptyAble: false,
                    emptyText: '不可为空'
                }, {
                    label: '广告详情',
                    field: 'Description',
                    vAlign: 'top',
                    type: 'richTextBox'
                }, {
                    label: '广告详情',
                    field: 'Sort',
                    type: 'number',
                    label: '排序'
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
