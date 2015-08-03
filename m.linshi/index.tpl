<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />
    <meta charset="utf-8" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="api-base-url" content="@html(debug?"http://192.168.10.119:5556/api":"http://api.linshi.biz/v1.5.1")" />
    <title>邻师，发现身边的好老师</title>
    <meta name="description" content="邻师是中国最专业最安全最智能的针对0-18岁学生(家长)和教师教育O2O平台,提供上海100%实名认证老师、课程(线上/线下)、问答、社区等学习服务,帮助老师和学生快速精准对接，同时为学生(家长)和教师提供高性价比的各项服务，以保证双方的多样性需求。 " />
    <link href="@html(webresource+'images/style.css')" rel="stylesheet" type="text/css" />
    @if(debug){
    <link href="@html(webresource+'images/anim.css')" rel="stylesheet" type="text/css" />
    }
    @for(var i=0;i<css.length;i++){ 
        var item=css[i];
        <link href="@item" rel="stylesheet" type="text/css"/>
    }
    <script src="@html(webresource+(isDebugFramework?'js/seajs/sea.js':('slan.m.js?v'+Date.now())))"></script>
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
    <script type="text/javascript" name="baidu-tc-cerfication" data-appid="6534552" src="http://apps.bdimg.com/cloudaapi/lightapp.js"></script>
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
        seajs.use(['$','util','core/app'],function($,util,App) {
            sl.isInApp=/linshiapp/ig.test(navigator.userAgent);
            sl.hasStatusBar=sl.isInApp&&util.ios&&util.osVersion>=7;
            sl.isDebug=@debug;
            sl.buildVersion=@(Date.now());

            new App().mapRoute(@html(JSON.stringify(routes)),@debug).start();
        });
        window.callJS = function (data) {
            if (data.method=='setMember'){
                seajs.use(['$','util'],function($,util){
                    util.store('member', data.params);
                });
            }
        };
    </script>
</body>
</html>
