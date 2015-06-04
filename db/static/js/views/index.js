define(function(require,exports,module) {

    var $=require('$'),
        util=require('util'),
        Page=require('page'),
        Grid=require('../components/grid')

    return Page.extend({
        template: 'template/index',

        events: {},

        onCreate: function() {

            new Grid(this.$el,{
                search: {
                    url: "?action=search",
                    beforeSend: function() {
                        buttons.items([1,2]).disable();
                    },
                    data: {
                        role: {
                            label: '账号类型',
                            type: 'select',
                            options: [{
                                value: '',
                                text: '请选择'
                            },{
                                value: 1,
                                text: '业务员'
                            },{
                                value: 0,
                                text: '商户'
                            }]
                        },
                        shopId: {
                            label: '所属店铺',
                            type: 'select',
                            options: []
                        },
                        keywords: {
                            label: "关键字：",
                            type: 'text'
                        }
                    }
                },
                onRowSelect: function() {
                    buttons.items([1,2]).enable();
                },
                pageEnabled: true,
                columns: [{
                    text: "编号",
                    bind: "AccountID",
                    width: 3
                },{
                    text: "账号",
                    bind: "AccountName",
                    width: 10
                },{
                    text: "姓名",
                    bind: "Name",
                    width: 6
                },{
                    text: "类型",
                    bind: "Role",
                    width: 6,
                    render: function(cell,data) {
                        cell.append('<i class="gridCellItem">'+(data.Role==0?'商户':"业务员")+'</i>');
                    }
                },{
                    text: "查看",
                    bind: "Role",
                    width: 6,
                    render: function(cell,data) {
                        cell.append('<i class="gridCellItem"><a href="Transfer?accountid='+data.AccountID+'" style="color:#c00">[下属过户单]</a></i>');
                    }
                }]
            });


        },

        onShow: function() {
        },

        onDestory: function() {
        }
    });
});
