var Promise = require('../core/promise');
var build = require('../core/build');
var razor = require('../core/razor');
var Tools = require('../tools/tools');
var fsc = require('../core/fs');
var fs = require('fs');

module.exports = function () {
    build(__dirname, 'production', false, function (config, tools) {

        var promise = Promise(2);

        fs.readFile('../webresource/js/components/form.tpl', { encoding: 'utf-8' }, function (err, data) {
            var code = Tools.compressJs(Tools.replaceDefine('components/form.tpl', razor.web(data)));
            Tools.save('../webresource/js/components/form.tpl.js', code, function () {
                promise.next(0);
            });
        });

        fs.readFile('./common/menu.tpl', { encoding: 'utf-8' }, function (err, data) {
            var code = Tools.compressJs(Tools.replaceDefine('common/menu.tpl', razor.web(data)));
            Tools.save('./common/menu.tpl.js', code, function () {
                promise.next(1);
            });
        });

        promise.then(function () {

            tools.combine({
                'slan': {
                    'seajs': '../webresource/js/seajs/sea',
                    'zepto': '../webresource/js/zepto',
                    'extend/fx': '../webresource/js/extend/fx',
                    'util': '../webresource/js/util',
                    'bridge': '../webresource/js.m/bridge',
                    'graphics/matrix2d': '../webresource/js/graphics/matrix2d',
                    'graphics/tween': '../webresource/js/graphics/tween',
                    'core/base': '../webresource/js/core/base',
                    'core/promise': '../webresource/js/core/promise',
                    'core/linklist': '../webresource/js/core/linklist',
                    'core/event': '../webresource/js/core/event',
                    'core/view': '../webresource/js/core/view',
                    'core/model': '../webresource/js/core/model',
                    'core/page': '../webresource/js/core/page',
                    'core/navigation': '../webresource/js/core/navigation',
                    'core/route': '../webresource/js/core/route',
                    'core/animation': '../webresource/js/core/animation',
                    'core/master': '../webresource/js/core/master',
                    'common/menu.tpl': './common/menu.tpl',
                    'components/timepicker': '../webresource/js/components/timepicker',
                    'components/validator': '../webresource/js/components/validator',
                    'components/form.tpl': '../webresource/js/components/form.tpl',
                    'components/form': '../webresource/js/components/form',
                    'components/grid': '../webresource/js/components/grid',
                    'components/page': '../webresource/js/components/page',
                    'widget/tip': '../webresource/js/widget/tip',
                    'widget/dialog': '../webresource/js/widget/dialog'
                }
            });

        });

    });
};