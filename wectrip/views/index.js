define(function (require,exports,module) {

    var $=require('$');
    var util=require('util');
    var model=require('core/model');
    var Page=require('common/page');
    var menu=require('common/menu');
    var Form=require('components/form');
    var Grid=require('components/grid');

    return Page.extend({
        events: {},

        onCreate: function () {
            var self=this;

            this.model=new model.ViewModel(this.$el,{
                title: '目的地管理'
            });

            this.grid=new Grid({
                search: {
                    url: '/mongo',
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
                columns: [{
                    text: "数据库",
                    bind: "name",
                    width: 10,
                    sortable: true
                },{
                    text: "大小",
                    bind: "sizeOnDisk",
                    width: 10,
                    render: function (data) {
                        console.log(data)
                        this.cellItem(Math.round(data.sizeOnDisk/(1000*1000))/1000+'GB');
                    }
                }]

            }).search();

            console.log(this.grid)

            this.$el.find('h1').after(this.grid.$el);
        },

        onShow: function () {
            this.menu=menu.get('/');
            this.$el.before(this.menu.$el);
        },

        onDestory: function () {
        }
    });
});
