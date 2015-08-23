<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />
    <meta charset="utf-8" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="api-base-url" content="@html(debug?"http://192.168.0.104:5559":"http://m.abs.cn:7788")" />
    <title></title>
    @for(var key in css){
        var items=css[key],
            item;
        if (debug) {
            if (typeof items=='string')
                items=[items];
            for(var i=0,len=items.length;i<len;i++) {
                item=items[i];
                <link href="@(webresource)@item?v@(Date.now())" rel="stylesheet" type="text/css"/>
            }
        } else {
            <link href="@(webresource)@key?v@(Date.now())" rel="stylesheet" type="text/css"/>
        }
    }
    <script src="@(webresource)@html(isDebugFramework?'js/seajs/sea.js':'slan.m.js')?v@(Date.now())"></script>
    @if(debug){
    <script src="@(webresource)js/zepto.js"></script>
    <script src="@(webresource)js/extend/fx.js"></script>
    <script src="@(webresource)js/extend/touch.js"></script>
    <script src="@(webresource)js/extend/matchMedia.js"></script>
    <script src="@(webresource)js/extend/ortchange.js"></script>
    <script src="@(webresource)js/anim/default.js"></script>
    }
    @for(var key in js){
        var items=js[key],
            item;
        if (debug) {
            if (typeof items=='string')
                items=[item];
            for(var i=0,len=items.length;i<len;i++) {
                var item=items[i];
                <script src="@(webresource)@(item).js"></script>
            }
        } else {
            <script src="@(webresource)@(key).js"></script>
        }
    }
    <style>
        .viewport.applaunch { background: url(images/launch.jpg) no-repeat center top; background-size:  auto 100%; }
        .viewport.applaunch1 { background: url(images/launch101.jpg) no-repeat center top; background-size: auto 100%; }
        @@media screen and (max-height:480px) {
            .viewport.applaunch { background: url(images/launch.jpg) no-repeat center top; background-size: 100% auto; }
            .viewport.applaunch1 { background: url(images/launch101.jpg) no-repeat center top; background-size: 100% auto; }
        }
    </style>
</head>
<body>
    <div class="viewport applaunch"></div>
    <script>
        if (Date.now()>=1443628800000){
            var viewport=document.querySelector('.viewport');
            viewport.className="viewport applaunch1";
        }
        seajs.config({
            alias: {
                "$": "zepto",
                'animation': 'core/animation',
                'activity': 'core/activity'
            }
        });
        seajs.use(['$','util','core/app'],function($,util,App) {
            sl.isDebug=@debug;
            sl.buildVersion=@(Date.now());
            sl.appVersion='1.0.0';
            new App().mapRoute(@html(JSON.stringify(routes)),@debug).start(util.isInApp?2000:2000);
        });
    </script>
</body>
</html>
