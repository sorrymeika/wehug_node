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
            'sl/base',
            'sl/linklist',
            'sl/event',
            'sl/razor',
            'sl/view',
            'sl/animations',
            'sl/app',
            'sl/activity',
            'sl/tween',
            'sl/touch',
            'sl/widget/scrollview',
            'sl/widget/scroll',
            'sl/widget/dialog',
            'sl/widget/tip',
            'sl/widget/button',
            'sl/widget/selector',
            'sl/widget/loading',
            'sl/widget/slider',
            'sl/widget/dropdown'
        ],
        views: ['views/index']
    },
    html: ['index.html'],
    razor: ['template/index'],
    resource: ['images']
});