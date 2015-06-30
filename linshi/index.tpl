<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />
    <meta charset="utf-8" />
    <meta name="format-detection" content="telephone=no" />
    <title></title>
    @for(var i=0;i<css.length;i++){
        var item=css[i];
    <link href="@item" rel="stylesheet" type="text/css"/>
    }
    <script src="@html(webresource+(isDebugFramework?'/js/seajs/sea.js':'/slan.js'))"></script>
    @if(debug){
    <script src="@(webresource)/js/zepto.js"></script>
    <script src="@(webresource)/js/extend/fx.js"></script>
    } else {
        <script src="@(root!='/'?root+'/':'/')controller.js"></script>
    }
    @for(var i=0;i<js.length;i++){
        var item=js[i];
    <script src="@item"></script>
    }
</head>
<body>
    <script>
        seajs.config({
           @html(debug?"":"base: './',")
            alias: {
                '$': 'zepto',
                'animation': 'core/animation',
                'page': 'core/page'
            }
        });
        seajs.use(['$','core/navigation'],function($,Navigation) {
            new Navigation().mapRoute(@html(JSON.stringify(routes))).start();
        });
    </script>
</body>
</html>
