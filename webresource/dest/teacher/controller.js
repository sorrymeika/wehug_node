define("teacher/template/index",function(require){var util=require("util"),test=require("./test"),T={html:function($data){var __="";with($data||{})__+=' <div class="main"> 测试测试<br> <a href="/test/1">超链接</a> ',console.log(test.helpers),__+=" "+util.encodeHTML(test.helpers.testHelper("测试Helper"))+" "+util.encodeHTML(test.testFn("测试function"))+" </div> ";return __},helpers:{}};return T.template=T.html,T});define("teacher/views/index",function(e,t,i){var s=(e("$"),e("util"),e("page"));return s.extend({events:{},onCreate:function(){},onShow:function(){},onDestory:function(){}})});define("teacher/views/test",function(e,t,i){var s=(e("$"),e("util"),e("page"));return s.extend({events:{},onCreate:function(){},onShow:function(){},onDestory:function(){}})});define("teacher/template/test",function(require){var util=require("util"),T={html:function($data){var __="";with($data||{}){__+="  <div>正文正文正文正文</div> ";var test="as        df",test1="ccc",a=3,b=5,c=4;__+=" <br> 变量test："+util.encodeHTML(test)+" <br> 变量test1："+util.encodeHTML(test1)+" <br> 内部方法："+util.encodeHTML(this.testFn(2))+" ";for(var i=0;a>i;i++)0==i&&(__+="<div>first</div>"),b++,__+="测试文本<div>for循环"+util.encodeHTML(i)+"</div>";__+=" ",a>b?(console.log(2),__+="<div>if 判断</div>"):__+=c>b?"<div>else if</div>":"<div>else</div>",__+=" "+util.encodeHTML(this.helpers.testHelper("asdf"))}return __},helpers:{testHelper:function(e){var t="";return t+=" <div>测试helper"+util.encodeHTML(e)+"</div> "}},testFn:function(e){return 1==e?"1":"测试一下"}};return T.template=T.html,T});