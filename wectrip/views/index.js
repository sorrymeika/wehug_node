define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var model = require('core/model');
    var Page = require('common/page');
    var menu = require('common/menu');
    var Form = require('components/form');
    var Grid = require('components/grid');

    return Page.extend({
        events: {
            'click .js_grid_delete': function (e) {
                var id = e.currentTarget.getAttribute('data-id');
                var self = this;

                if (window.confirm('确认删除？')) {
                    $.post('/api/manage/delete_destination', {
                        id: id
                    }, function (res) {
                        if (res.success) {
                            self.grid.load()
                        } else {
                            sl.tip(res.msg)
                        }

                    }, 'json');
                }
            }
        },

        onCreate: function () {
            var self = this;

            this.model = new model.ViewModel(this.$el, {
                title: '目的地管理'
            });

            this.onResult('destination_change', function () {
                this.grid.load();
            });

            this.grid = new Grid({
                search: {
                    url: '/api/destination/list',
                    type: 'GET',
                    beforeSend: function () {
                    },
                    data: {
                        keywords: {
                            label: '关键字',
                            type: 'text'
                        }
                    }
                },
                onSelectRow: function () {
                },
                pageEnabled: true,
                pageSize: 20,
                columns: [{
                    text: "目的编号",
                    bind: "ID",
                    width: 5
                }, {
                    text: "目的地名称",
                    bind: "Name",
                    width: 10
                }, {
                    text: "目的地图片",
                    bind: "MiddlePic",
                    width: 10,
                    render: function (data) {
                        this.append('<a href="/' + data.MiddlePic + '" target="_blank">' + data.MiddlePic + '</a>');
                    }
                }, {
                    text: "操作",
                    bind: "LargePic",
                    width: 10,
                    align: 'center',
                    valign: 'center',
                    render: function (data) {
                        this.append('<a href="/">[修改]</a> <a href="javascript:;" data-id="' + data.ID + '" class="js_grid_delete">[删除]</a>');
                    }
                }]

            }).search();

            this.$el.find('.toolbar').after(this.grid.$el);
        },

        onShow: function () {
            this.menu = menu.get('/');
            this.$el.before(this.menu.$el);
        },

        onDestory: function () {
        }
    });
});
