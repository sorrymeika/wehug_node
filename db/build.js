var Tools=require('./../tools/tools');
var path=require('path');

var tools=new Tools(path.join(__dirname,'./'),path.join(__dirname,'./dest'));

tools.build({
    api: 'http://www.abs.cn',
    compress: [
        'seajs/sea'
    ],
    combine: {
        'style.css': [
        'anim.css',
        'style.css'
        ],
        sl: {
            'zepto': '../webresource/js/zepto',
            'extend/touch': '',
            'extend/fx': '../webresource/js/extend/fx',
            'util': '../webresource/js/util',
            'graphics/matrix2d': '../webresource/js/graphics/matrix2d',
            'graphics/tween': '../webresource/js/graphics/tween',
            'core/base': '../webresource/js/core/base',
            'core/promise': '../webresource/js/core/promise',
            'core/linklist': '../webresource/js/core/linklist',
            'core/event': '../webresource/js/core/event',
            'core/view': '../webresource/js/core/view',
            'core/page': '../webresource/js/core/page',
            'core/route': '../webresource/js/core/route',
            'core/animation': '../webresource/js/core/animation',
            'core/navigation': '../webresource/js/core/navigation',
            'widget/tip': '../webresource/js/widget/tip',
            'widget/dialog': '../webresource/js/widget/dialog'
        },
        views: ['views/index']
    },
    html: ['index.html'],
    razor: ['template/index'],
    resource: ['images']
});
