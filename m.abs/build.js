var build = require('../core/build');
var fsc = require('../core/fs');

module.exports = function () {
    build(__dirname, 'production', function (config, tools) {
        tools.combine({
            'slan.m': {
                'seajs': '../webresource/js/seajs/sea',
                'zepto': '../webresource/js/zepto',
                'extend/touch': '../webresource/js.m/extend/touch',
                'extend/fx': '../webresource/js/extend/fx',
                'extend/matchMedia': '../webresource/js.m/extend/matchMedia',
                'extend/ortchange': '../webresource/js.m/extend/ortchange',
                'util': '../webresource/js/util',
                'util/md5': '../webresource/js/util/md5',
                'bridge': '../webresource/js.m/bridge',
                'graphics/matrix2d': '../webresource/js/graphics/matrix2d',
                'graphics/tween': '../webresource/js/graphics/tween',
                'core/base': '../webresource/js/core/base',
                'core/promise': '../webresource/js/core/promise',
                'core/linklist': '../webresource/js/core/linklist',
                'core/event': '../webresource/js/core/event',
                'core/view': '../webresource/js/core/view',
                'core/model': '../webresource/js/core/model',
                'core/model2': '../webresource/js/core/model2',
                'core/page': '../webresource/js/core/page',
                'core/route': '../webresource/js/core/route',
                'core/animation': '../webresource/js/core/animation',
                'core/master': '../webresource/js/core/master',
                'core/app': '../webresource/js.m/core/app',
                'core/activity': '../webresource/js.m/core/activity',
                'core/touch': '../webresource/js.m/core/touch',
                'widget/scrollview': '../webresource/js.m/widget/scrollview',
                'widget/scroll': '../webresource/js.m/widget/scroll',
                'widget/tip': '../webresource/js/widget/tip',
                'widget/dialog': '../webresource/js/widget/dialog',
                'util/barcode': '../webresource/js/util/barcode',
                'widget/loading': '../webresource/js.m/widget/loading',
                'widget/slider': '../webresource/js.m/widget/slider',
                'widget/selector': '../webresource/js.m/widget/selector',
                'anim/default': '../webresource/js.m/anim/default'
            }
        });


    });
};