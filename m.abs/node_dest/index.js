var util=require("util"),T={html:function($data){var __="";with($data||{}){__+='<!DOCTYPE html> <html> <head> <meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no" /> <meta charset="utf-8" /> <meta name="format-detection" content="telephone=no" /> <meta name="api-base-url" content="'+(debug?"http://172.16.168.128:6005":"http://m.abs.cn:7788")+'" /> <title></title> ';for(var key in css){var item,items=css[key];if(debug){"string"==typeof items&&(items=[items]);for(var i=0,len=items.length;len>i;i++)item=items[i],__+='<link href="'+util.encodeHTML(webresource)+util.encodeHTML(item)+"?v"+util.encodeHTML(Date.now())+'" rel="stylesheet" type="text/css"/>'}else __+='<link href="'+util.encodeHTML(webresource)+util.encodeHTML(key)+"?v"+util.encodeHTML(Date.now())+'" rel="stylesheet" type="text/css"/>'}__+=' <style> .viewport.applaunch { background: url(images/launch101.jpg) no-repeat center top !important; background-size: auto 100% !important; } @media screen and (max-height:480px) { .viewport.applaunch { background-image: url(images/launch101_480.jpg) !important; } } </style> </head> <body> <div class="viewport applaunch js_global_launch"></div> <div class="viewport js_global_offline" style="display:none;z-index:1000;"> <div class="home_offline" style="position: absolute;left: 50%;top: 50%;margin: -100px 0 0 -66px;"> <div class="ico"></div> <div class="txt">您的网络不太顺畅哦</div> <div class="txt_sub">请检查您的手机是否联网</div> <div class="btn">重新加载</div> </div> </div> <script> var launchImage=localStorage.getItem("LAUNCH_IMAGE"); if (launchImage){ var styleElement = document.createElement(\'style\'); styleElement.type = \'text/css\'; document.getElementsByTagName(\'head\')[0].appendChild(styleElement); styleElement.appendChild(document.createTextNode(\'.viewport.applaunch{background-image: url(\'+launchImage+\') !important;}@media screen and (max-height:480px) {background-image: url(\'+launchImage+\') !important;}\')); } </script> <script src="'+util.encodeHTML(webresource)+(isDebugFramework?"js/seajs/sea.js":"slan.m.js")+"?v"+util.encodeHTML(Date.now())+'"></script> ',debug&&(__+='<script src="'+util.encodeHTML(webresource)+'js/zepto.js"></script><script src="'+util.encodeHTML(webresource)+'js/extend/fx.js"></script><script src="'+util.encodeHTML(webresource)+'js/extend/touch.js"></script><script src="'+util.encodeHTML(webresource)+'js/extend/matchMedia.js"></script><script src="'+util.encodeHTML(webresource)+'js/extend/ortchange.js"></script><script src="'+util.encodeHTML(webresource)+'js/anim/default.js"></script>'),__+=" ";for(var key in js){var item,items=js[key];if(debug){"string"==typeof items&&(items=[item]);for(var i=0,len=items.length;len>i;i++){var item=items[i];__+='<script src="'+util.encodeHTML(webresource)+util.encodeHTML(item)+'.js"></script>'}}else __+='<script src="'+util.encodeHTML(webresource)+util.encodeHTML(key)+'.js"></script>'}__+=" <script> seajs.config({ alias: { \"$\": \"zepto\", 'animation': 'core/animation', 'activity': 'core/activity' } }); seajs.use(['$','util','core/app','bridge','widget/loading'],function($,util,App,bridge,Loading) { sl.isDebug="+util.encodeHTML(debug)+"; sl.buildVersion="+util.encodeHTML(Date.now())+"; sl.appVersion='1.0.2'; sl.$globalOffline=$('.js_global_offline'); sl.offline=function(reloadFn){ sl.$globalOffline.show().find('.btn').one('tap',function(){ sl.$globalOffline.hide(); reloadFn(); }); }; var loading=new Loading({ url: bridge.url('/api/settings/resourceMapping'), timeout: 5000, checkData: false, $el: $('.js_global_launch'), error: function(){ sl.offline(load); }, success: function(res){ var resourceMapping=res.data; seajs.on('fetch', function (emitData) { var id = emitData.uri.replace(seajs.data.base, '').replace(/\\.js(\\?.*)*/, ''); console.log(id); if (resourceMapping&&resourceMapping[id]) emitData.requestUri = resourceMapping[id]; }); seajs.on(\"error\", function(errorData){ errorData.pause=true; sl.offline(function(){ seajs.request(errorData.uri,errorData.callback); }); }); new App().mapRoute("+JSON.stringify(routes)+","+util.encodeHTML(debug)+").start("+util.encodeHTML(debug)+"?0:2000); } }); var load=function(){ loading.reload(); }; load(); }); </script> </body> </html> "}return __},helpers:{}};T.template=T.html,module.exports=T;