define(function (require, exports, module) {
    var $ = require('$');
    var util = require('util');
    var menu = require('./menu.tpl');
    var model = require('core/model');

    module.exports = exports = function () {
        this.$el = $(menu.html());
        this.model = new model.ViewModel(this.$el, {
            data: [{
                url: '/',
                title: '目的地管理',
                children: [{
                    title: '添加目的地',
                    url: '/add_destination'
                }]
            }, {
                url: '/activity_list',
                title: '活动管理',
                children: [{
                    title: '添加活动',
                    url: '/add_activity'
                }]
            }, {
                url: '/recommend_list',
                title: '推荐管理'
            }, {
                id: 'user',
                url: '/user',
                title: '用户管理'
            }, {
                id: 'admin',
                title: '系统管理',
                url: '/admin'
            }]
        });
    };

    var cache = null;

    exports.get = function (id) {
        !cache && (cache = new exports());

        cache.current && cache.current.set({
            current: false
        });

        for (var i = 0, item; i < cache.model.data.data.length; i++) {
            item = cache.model.data.data[i];
            var children = item.children;

            if (item.url == id || item.id == id) {
                cache.current = cache.model.get('data').get(i).set({
                    current: true
                });
                break;

            } else if (children) {
                for (var j = 0; j < children.length; j++) {
                    if (children[j].url == id || children[j].id == id) {
                        cache.current = cache.model.get('data.' + i + '.children.' + j).set({
                            current: true
                        });
                        break;
                    }
                }
            }
        }

        return cache;
    }
});

