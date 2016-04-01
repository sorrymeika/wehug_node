var $ = require('$');
var util = require('util');
var model = require('core/model2');

var Menu = model.ViewModel.extend({
    el: <div class="menu">
        <div class="menu_hd">
            菜单
        </div>
        <div class="menu_sub_hd"><a href="/login">断开链接</a></div>
        <div class="menu_bd">
            <dl sn-repeat="item in data">
                <dt class="{{item.current?'curr':''}}">
                    <a href="{{item.url}}">{{ item.title }}</a>
                </dt>
                <dd sn-repeat="child in item.children" class="{{child.current?'curr':''}}">
                    <a href="{{child.url}}">{{ child.title }}</a>
                </dd>
            </dl>
            <dl sn-repeat="item in databases">
                <dt class="{{item.Database==database?'curr':''}}">
                    <a href="/?database={{item.Database}}">{{ item.Database }}</a>
                </dt>
                <dd sn-repeat="child in item.children" class="{{child.name==table?'curr':''}}">
                    <a href="/?database={{item.Database}}&table={{child.name}}">{{ child.name }}</a>
                </dd>
            </dl>
        </div>
    </div>,

    setDatabases: function(databases) {

        this.set({
            databases: databases
        });
    }
});

var cache = null;

Menu.get = function(id) {
    !cache && (cache = new Menu({
        data: [{
            url: '/',
            title: '数据库管理'
        }]
    }));

    cache.current && cache.current.set({
        current: false
    });

    for (var i = 0, item; i < cache.data.data.length; i++) {
        item = cache.data.data[i];
        var children = item.children;

        if (item.url == id || item.id == id) {
            cache.current = cache.getModel('data').get(i).set({
                current: true
            });
            break;

        } else if (children) {
            for (var j = 0; j < children.length; j++) {
                if (children[j].url == id || children[j].id == id) {
                    cache.current = cache.getModel('data.' + i + '.children.' + j).set({
                        current: true
                    });
                    break;
                }
            }
        }
    }
    cache.$el.show();

    $('.viewport').prepend(cache.$el);
    return cache;
}

module.exports = Menu;