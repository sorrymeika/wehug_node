var util=require("util"),T={html:function($data){var __="";with($data||{}){__+='<!DOCTYPE html> <html> <head> <meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no" /> <meta charset="utf-8" /> <meta name="format-detection" content="telephone=no" /> <meta name="api-base-url" content="'+(debug?"http://192.168.10.129:5559":"http://m.abs.cn:7788")+'" /> <title></title> ';for(var key in css){var item,items=css[key];if(debug){"string"==typeof items&&(items=[items]);for(var i=0,len=items.length;len>i;i++)item=items[i],__+='<link href="'+util.encodeHTML(webresource)+util.encodeHTML(item)+"?v"+util.encodeHTML(Date.now())+'" rel="stylesheet" type="text/css"/>'}else __+='<link href="'+util.encodeHTML(webresource)+util.encodeHTML(key)+"?v"+util.encodeHTML(Date.now())+'" rel="stylesheet" type="text/css"/>'}__+=' <script src="'+util.encodeHTML(webresource)+(isDebugFramework?"js/seajs/sea.js":"slan.m.js")+"?v"+util.encodeHTML(Date.now())+'"></script> ',debug&&(__+='<script src="'+util.encodeHTML(webresource)+'js/zepto.js"></script><script src="'+util.encodeHTML(webresource)+'js/extend/fx.js"></script><script src="'+util.encodeHTML(webresource)+'js/extend/touch.js"></script><script src="'+util.encodeHTML(webresource)+'js/extend/matchMedia.js"></script><script src="'+util.encodeHTML(webresource)+'js/extend/ortchange.js"></script><script src="'+util.encodeHTML(webresource)+'js/anim/default.js"></script>'),__+=" ";for(var key in js){var item,items=js[key];if(debug){"string"==typeof items&&(items=[item]);for(var i=0,len=items.length;len>i;i++){var item=items[i];__+='<script src="'+util.encodeHTML(webresource)+util.encodeHTML(item)+'.js"></script>'}}else __+='<script src="'+util.encodeHTML(webresource)+util.encodeHTML(key)+'.js"></script>'}__+=" <style> .viewport.applaunch { background: url(images/launch.jpg) no-repeat center top; background-size: auto 100%; } .viewport.applaunch1 { background: url(images/launch101.jpg) no-repeat center top; background-size: auto 100%; } @media screen and (max-height:480px) { .viewport.applaunch { background-image: url(images/launch_480.jpg); } .viewport.applaunch1 { background-image: url(images/launch101_480.jpg); } } </style> </head> <body> <div class=\"viewport applaunch\"></div> <script> if (Date.now()>=1443628800000){ var viewport=document.querySelector('.viewport'); viewport.className=\"viewport applaunch1\"; } seajs.config({ alias: { \"$\": \"zepto\", 'animation': 'core/animation', 'activity': 'core/activity' } }); seajs.use(['$','util','core/app'],function($,util,App) { sl.isDebug="+util.encodeHTML(debug)+"; sl.buildVersion="+util.encodeHTML(Date.now())+"; sl.appVersion='1.0.0'; new App().mapRoute("+JSON.stringify(routes)+","+util.encodeHTML(debug)+").start("+util.encodeHTML(debug)+"?0:2000); }); </script> </body> </html> "}return __},helpers:{}};T.template=T.html,module.exports=T;