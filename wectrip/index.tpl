<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />
    <meta charset="utf-8" />
    <meta name="format-detection" content="telephone=no" />
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
    <!--[if lte IE 9]><script src="@(webresource+(debug?'/js/jquery-1.11.3.js':'jquery-1.11.3.min.js'))"></script><![endif]-->
    <script src="@(webresource)@html(isDebugFramework?'js/seajs/sea.js':'slan.js')"></script>
    @if(debug){
    <script src="@(webresource)js/zepto.js"></script>
    <script src="@(webresource)js/extend/fx.js"></script>
    }
    @for(var key in js){
        var items=js[key],
            item;
        if (debug) {
            if (typeof items=='string')
                items=[item];
            for(var i=0,len=items.length;i<len;i++) {
                var item=items[i];
                <script src="@(webresource)@item"></script>
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
                '$': window.jQuery||'zepto',
                'animation': 'core/animation',
                'page': 'core/page'
            }
        });
        seajs.use(['$','core/navigation'],function($,Navigation) {
            new Navigation().mapRoute(@html(JSON.stringify(routes)),@debug).start();
        });
    </script>
</body>
</html>
