<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />
    <meta charset="utf-8" />
    <meta name="format-detection" content="telephone=no" />
    <title></title>
    @for(var i=0;i<js.length;i++){
        var item=js[i];
    <script src="@item"></script>
    }
    @for(var i=0;i<css.length;i++){
        var item=css[i];
    <link href="@item" rel="stylesheet" type="text/css"/>
    }
</head>
<body>
    <script>
        seajs.config({
            base: './',
            alias: {
                "$": "zepto",
                'animation': 'core/animation',
                'page': 'core/page'
            }
        });

        seajs.use(['$','core/navigation'],function($,Navigation) {
            new Navigation().mapRoute(@html(JSON.stringify(route))).start();
        });
    </script>
</body>
</html>
