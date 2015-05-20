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
        sl: [
            'zepto',
            'extend/touch',
            'extend/deferred',
            'extend/fx',
            'extend/matchMedia',
            'extend/ortchange',
            'extend/throttle',
            'util',
            'bridge',
            'graphics/matrix2d',
            'graphics/tween',
            'core/base',
            'core/linklist',
            'core/event',
            'core/view',
            'core/animation',
            'core/app',
            'core/activity',
            'core/touch',
            'widget/scrollview',
            'widget/scroll',
            'widget/dialog',
            'widget/tip',
            'widget/button',
            'widget/selector',
            'widget/loading',
            'widget/slider',
            'widget/dropdown'
        ],
        views: ['views/index']
    },
    html: ['index.html'],
    razor: ['template/index'],
    resource: ['images']
});