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
                    $.post('/api/manage/delete_quan', {
                        id: id
                    }, function (res) {
                        if (res.success) {
                            self.grid.load()
                            sl.tip('删除成功')
                        } else {
                            sl.tip(res.msg)
                        }

                    }, 'json');
                }
            },
            'click .js_grid_resolve,.js_grid_reject': function (e) {
                var id = e.currentTarget.getAttribute('data-id');
                var self = this;

                $.post('/api/manage/modify_destination_comment', {
                    id: id,
                    status: $(e.currentTarget).hasClass('js_grid_resolve') ? 1 : 2

                }, function (res) {
                    if (res.success) {
                        self.grid.load()
                        sl.tip("设置成功");
                    } else {
                        sl.tip(res.msg)
                    }

                }, 'json');
            }
        },

        onCreate: function () {
            var self = this;

            this.model = new model.ViewModel(this.$el, {
                title: '目的地评论管理'
            });

            this.onResult('quan_change', function () {
                this.grid.load();
            });

            this.grid = new Grid({
                multiSelect: true,
                search: {
                    url: '/api/destination/comment_list?areaid=' + util.store('global_area'),
                    type: 'GET',
                    beforeSend: function () {
                    },
                    data: {
                        status: {
                            label: '状态',
                            type: 'select',
                            options: [{
                                text: '全部',
                                value: ''
                            }, {
                                text: '未审批',
                                value: '0'
                            }, {
                                text: '已审批',
                                value: '1'
                            }, {
                                text: '拒绝',
                                value: '2'
                            }]
                        },
                        keywords: {
                            label: '关键字',
                            type: 'text'
                        }
                    }
                },
                onSelectRow: function () {
                },
                pageEnabled: true,
                rowHeight: 100,
                pageSize: 20,
                columns: [{
                    text: "编号",
                    bind: "ID",
                    width: 5
                }, {
                    text: "发布人",
                    bind: "UserName",
                    width: 10,
                    render: function (data) {
                        this.append(data.UserName || data.Mobile);
                    }
                }, {
                    text: "发布时间",
                    bind: "CommentTime",
                    width: 10,
                    render: function (data) {
                        this.append(util.formatDate(data.CommentTime));
                        this.append('<br>');
                        this.append(!data.Status ? '未审批' : data.Status == 1 ? '已通过' : '已拒绝');
                    }
                }, {
                    text: "内容",
                    bind: "Content",
                    width: 30,
                    render: function (data) {
                        this.append(!data.Content || data.Content.length < 15 ? data.Content : data.Content.substr(0, 15));
                    }
                }, {
                    text: "图片",
                    bind: "Content",
                    width: 10,
                    render: function (data) {
                        this.append(util.template('<div style="overflow-y:auto;height:100%;"><%if (Pictures) {for(var i=0;i<Pictures.length;i++){var pic=Pictures[i];%><img src="<%=pic.Src%>" style="max-width:49%;float:left;max-height:90px;"><%}}%></div>', data));
                    }
                }, {
                    text: "操作",
                    width: 10,
                    align: 'center',
                    valign: 'center',
                    render: function (data) {
                        if (data.Status != 1) {
                            this.append('<a href="javascript:;" data-id="' + data.ID + '" class="js_grid_resolve">[通过]</a>');
                        }
                        if (data.Status != 2) {
                            this.append('<a href="javascript:;" data-id="' + data.ID + '" class="js_grid_reject">[拒绝]</a>');
                        }
                        this.append('<a href="javascript:;" data-id="' + data.ID + '" class="js_grid_delete">[删除]</a>');
                    }
                }]

            }).search();

            this.$el.find('.toolbar').after(this.grid.$el);
        },

        onShow: function () {
            this.menu = menu.get(this.route.path);
            this.$el.before(this.menu.$el);
        },

        onDestory: function () {
        }
    });
});
