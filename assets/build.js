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
            'extend/matchMedia': '',
            'extend/ortchange': '',
            'util': '',
            'bridge': '',
            'graphics/matrix2d': '../webresource/js/graphics/matrix2d',
            'graphics/tween': '../webresource/js/graphics/tween',
            'core/base': '',
            'core/promise': '',
            'core/linklist': '',
            'core/event': '',
            'core/view': '',
            'core/animation': '',
            'core/app': '',
            'core/activity': '',
            'core/touch': '',
            'widget/scrollview': '',
            'widget/scroll': '',
            'widget/dialog': '',
            'widget/tip': '',
            'widget/button': '',
            'widget/selector': '',
            'widget/loading': '',
            'widget/slider': '',
            'widget/dropdown': '',
            'anim/default': ''
        },
        views: ['views/index','views/test']
    },
    html: ['index.html'],
    razor: ['template/index','template/test'],
    resource: ['images']
});
