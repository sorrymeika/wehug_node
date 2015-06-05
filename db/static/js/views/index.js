define(function(require,exports,module) {

    var $=require('$'),
        util=require('util'),
        Page=require('page'),
        Grid=require('../components/grid')

    return Page.extend({
        template: 'template/index',

        events: {},

        onCreate: function() {

            this.grid=new Grid(this.$el,{
                search: {
                    url: '/mongo',
                    type: 'GET',
                    beforeSend: function() {
                    },
                    data: {
                        keywords: {
                            label: '关键字',
                            type: 'text'
                        }
                    }
                },
                onSelectRow: function() {
                },
                columns: [{
                    text: "数据库",
                    bind: "name",
                    width: 10,
                    sortable: true
                },{
                    text: "大小",
                    bind: "sizeOnDisk",
                    width: 10,
                    render: function(data) {
                        console.log(data)
                        this.cellItem(Math.round(data.sizeOnDisk/(1000*1000))/1000+'GB');
                    }
                }]

            }).search();


        },

        onShow: function() {
        },

        onDestory: function() {
        }
    });
});
