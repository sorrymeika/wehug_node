var Tools=require('./../tools/tools');
var path=require('path');

var tools=new Tools(path.join(__dirname,'./'),path.join(__dirname,'./dest'));

tools.combine({
    "main.css": ['./images/reset.css'],
    slan: {
        'seajs': './js/seajs/sea',
        'zepto': './js/zepto',
        'extend/fx': './js/extend/fx',
        'util': './js/util',
        'graphics/matrix2d': './js/graphics/matrix2d',
        'graphics/tween': './js/graphics/tween',
        'core/base': './js/core/base',
        'core/promise': './js/core/promise',
        'core/linklist': './js/core/linklist',
        'core/event': './js/core/event',
        'core/view': './js/core/view',
        'core/page': './js/core/page',
        'core/route': './js/core/route',
        'core/animation': './js/core/animation',
        'core/navigation': './js/core/navigation',
        'widget/tip': './js/widget/tip',
        'widget/dialog': './js/widget/dialog'
    }
});
