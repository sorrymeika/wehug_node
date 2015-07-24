<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />
    <meta charset="utf-8" />
    <meta name="format-detection" content="telephone=no" />
	<meta name="api-base-url" content="@html(debug?"http://127.0.0.1:5558":"http://api.linshi.biz/v1.5.0")" />
    <title></title>
    @for(var key in css){
        var items=css[key],
            item;
        if (debug) {
            if (typeof items=='string')
                items=[item];
            for(var i=0,len=items.length;i<len;i++) {
                var item=items[i];
                <link href="@(webresource)@item" rel="stylesheet" type="text/css"/>
            }
        } else {
            <link href="@(webresource)@key" rel="stylesheet" type="text/css"/>
        }
    }
    <script src="@(webresource)@html(isDebugFramework?'js/seajs/sea.js':'slan.m.js')"></script>
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
            <script src="@(webresource)@key"></script>
        }
    }
</head>
<body>
    <script>
        seajs.config({
            alias: {
                "$": "zepto",
                'animation': 'core/animation',
                'activity': 'core/activity'
            }
        });
        seajs.use(['$','core/app'],function($,App) {
            new App().mapRoute(@html(JSON.stringify(routes)),@debug).start();
        });
    </script>
</body>
</html>
