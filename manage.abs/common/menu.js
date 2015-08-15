define(function (require, exports, module) {
    var $ = require('$');
    var util = require('util');
    var menu = require('./menu.tpl');
    var model = require('core/model');

    module.exports = exports = function () {
        this.$el = $(menu.html());
        this.model = new model.ViewModel(this.$el, {
            area: util.store('global_area') || 1,
            data: [{
                url: '/settings/ad_list',
                title: '广告位管理',
                children: [{
                    title: '添加广告位',
                    url: '/settings/add_ad'
                }]
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
        cache.$el.show();
        return cache;
    }
});

