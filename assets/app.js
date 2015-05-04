var express=require('express');
var app=express();
var args=process.argv;
var port=args.length>=3?parseInt(args[2]):5554;

app.use(express.static(__dirname));

app.listen(port,"127.0.0.1");

console.log("start with",port,__dirname,process.argv);

var tools=require('./../tools');

tools.build({
    api: 'http://www.abs.cn',
    compress: [
        'seajs/sea.js'
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
    template: ['views/index.html'],
    razor: ['views/index.html'],
    resource: ['images']
});