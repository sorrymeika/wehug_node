<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />
    <meta charset="utf-8" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="api-base-url" content="@html(debug?"http://127.0.0.1:5556/api":"http://api.linshi.biz")" />
    <title></title>
    <link href="@html(webresource+'images/style.css')" rel="stylesheet" type="text/css"/>
    @if(debug){
        <link href="@html(webresource+'images/anim.css')" rel="stylesheet" type="text/css"/>
    }
    @for(var i=0;i<css.length;i++){
        var item=css[i];
        <link href="@item" rel="stylesheet" type="text/css"/>
    }
    <script src="@html(webresource+(isDebugFramework?'js/seajs/sea.js':'slan.m.js'))"></script>
    @if(debug){
        <script src="@(webresource)js/zepto.js"></script>
        <script src="@(webresource)js/extend/fx.js"></script>
        <script src="@(webresource)js/extend/touch.js"></script>
        <script src="@(webresource)js/extend/matchMedia.js"></script>
        <script src="@(webresource)js/extend/ortchange.js"></script>
        <script src="@(webresource)js/anim/default.js"></script>
    }
    @for(var i=0;i<js.length;i++){
        var item=js[i];
        <script src="@item"></script>
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
