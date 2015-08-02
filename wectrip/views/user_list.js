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
                    $.post('/api/manage/delete_user', {
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
                title: '用户管理'
            });

            this.onResult('activity_change', function () {
                this.grid.load();
            });

            this.grid = new Grid({
                search: {
                    url: '/api/manage/user_list',
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
                    text: "用户编号",
                    bind: "ID",
                    width: 5
                }, {
                    text: "手机号",
                    bind: "Mobile",
                    width: 10
                }, {
                    text: "昵称",
                    bind: "NickName",
                    width: 10
                }, {
                    text: "性别",
                    bind: "Gender",
                    width: 17,
                    render: function (data) {
                        this.append(data.Gender ? "男" : "女");
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
