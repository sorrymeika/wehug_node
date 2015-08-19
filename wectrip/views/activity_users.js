define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var model = require('core/model');
    var Page = require('common/page');
    var menu = require('common/menu');
    var Form = require('components/form');
    var Grid = require('components/grid');

    return Page.extend({
        events: {},

        onCreate: function () {
            var self = this;

            this.model = new model.ViewModel(this.$el, {
                title: '参加活动的用户管理'
            });

            this.grid = new Grid({
                search: {
                    url: '/api/activity/userlist?id=' + this.route.data.id,
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
                    text: "报名时间",
                    bind: "JoinTime",
                    width: 10,
                    render: function (data) {
                        this.append(util.formatDate(data.JoinTime));
                    }
                }, {
                    text: "性别",
                    bind: "Gender",
                    width: 5,
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
