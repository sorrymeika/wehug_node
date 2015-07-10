define("template/login",function(require){var T=(require("util"),{html:function($data){var __="";with($data||{})__+='<header> <div class="head_back" sn-binding="data-back:back"></div> <div sn-binding="html:title" class="head_title"></div> </header> <div class="main"> <div class="login_form"> <ul class="form"> <li><input placeholder="手机号" sn-model="userName" /></li> <li><input placeholder="密码" sn-model="password" type="password" /></li> </ul> <div class="login_btn"><b class="btn_large js_bind">绑定</b> </div> <div class="login_notice"> <div>温馨提示</div> <div> <p>若无邻师账号，以当前手机号和密码注册。</p> <p>若已有邻师账号，请直接输入账号密码。</p> </div> </div> </div> </div> ';return __},helpers:{}});return T.template=T.html,T});define("views/login",function(e,t,i){{var a=(e("$"),e("util")),r=e("activity"),l=e("../widget/extend/loading"),n=e("../core/model"),o=e("../widget/scroll");e("animation")}return r.extend({events:{"tap .js_bind:not(.disabled)":function(){var e=this.model.get("userName"),t=this.model.get("password");return e&&a.validateMobile(e)?t?void this.loading.setParam({user_name:e,password:t}).load():void sl.tip("请输入密码"):void sl.tip("请输入正确的手机")}},onCreate:function(){var t=this.$(".main");o.bind(t),this.model=new n.ViewModel(this.$el,{title:"绑定邻师账号",back:this.route.queries.from||"/"}),this.loading=new l({url:"/user/login",method:"POST",check:!1,checkData:!1,$el:this.$el,success:function(e){e.error_msg&&sl.tip(e.error_msg)},error:function(e){sl.tip(e.msg)}})},onShow:function(){},onDestory:function(){}})});define("views/index",function(e,t,i){{var n=(e("$"),e("util"),e("activity")),r=e("../widget/extend/loading"),l=e("../core/model"),o=e("../widget/scroll");e("animation")}return n.extend({events:{'tap [sn-repeat-name="data"][data-id]':function(e){this.forward("/teacher/"+e.currentTarget.getAttribute("data-id"))},"tap .js_search":function(e){var t=this.model.data.search;t?this.forward("/search/"+t):sl.tip("请输入搜索内容")}},onCreate:function(){var e=this,t=this.$(".main");o.bind(t,{refresh:function(t,i){e.loading.reload({showLoading:!1},function(e,s){e?i(e):t(s)})}}),this.loading=new r({url:"/teacher/teacher_list",check:!1,$el:this.$el,$content:t.children(":first-child"),$scroll:t,success:function(t){t.data.length>=10&&(t.total=(this.pageIndex+1)*this.pageSize),e.model.set(t)},append:function(t){t.data.length>=10&&(t.total=(this.pageIndex+1)*this.pageSize),e.model.get("data").append(t.data)}}),this.model=new l.ViewModel(this.$el,{city:{name:"上海"}}),this.loading.load()},onShow:function(){},onDestory:function(){}})});define("template/index",function(require){var T=(require("util"),{html:function($data){var __="";with($data||{})__+='<header> <div class="head_city" sn-binding=\'html:city.name\'></div> <div class="head_search"><input placeholder="输入姓名或手机号搜索老师" sn-model="search" /></div> <div class="head_search_btn"><b class="btn_small js_search">搜索</b></div> </header> <div class="main"> <ul class="teacher_list"> <li class="teacher_item" sn-repeat="item in data" sn-binding="data-id:item.teacher_id"><img sn-binding="src:item.head_photo" /> <div class="tli_info"> <div class="tli_honor" sn-binding="html:item.honor"></div> <div class="tli_name" sn-binding="html:item.teacher_name|concat:\'—\':item.discipline"></div> </div> </li> </ul> </div> ';return __},helpers:{}});return T.template=T.html,T});define("template/search",function(require){var T=(require("util"),{html:function($data){var __="";with($data||{})__+='<header> <div class="head_back" data-back="/"></div> <div class="head_search"><input placeholder="输入姓名或手机号搜索老师" sn-model="keywords" /></div> <div class="head_search_btn"><b class="btn_small js_search">搜索</b></div> </header> <div class="main"> <ul class="search_list"> <li class="search_item" sn-repeat="item in data" sn-binding="data-id:item.teacher_id"> <div class="s_teacher"><img class="search_photo" sn-binding="src:item.head_photo" /> <ul class="s_teacher_basic"> <li><strong class="s_name" sn-binding="html:item.teacher_name"></strong><em sn-binding="html:item.discipline"></em><i sn-binding="html:item.price|round|concat:\'元/小时\'"></i></li> <li><span class="s_area" sn-binding="html:item.area"></span><span class="s_age" sn-binding="html:item.teaching_age|concat:\'教龄\'"></span></li> <li class="s_data"><span sn-binding="html:item.class_hours_number|concat:\'小时\'"></span><span sn-binding="html:item.students_number|concat:\'个\'"></span><span sn-binding="html:item.praise_rate"></span><span sn-binding="html:item.continue_rate"></span></li> </ul> </div> <div class="s_honor" sn-binding="html:item.honor|format:\'获得荣誉：{0}\'"></div> <ul class="s_cert"> <li class="cert" sn-binding="display:item.certification_flag">身份认证</li> <li class="t_cert" sn-binding="display:item.teacher_certification_flag">教师资格认证</li> <li class="education" sn-binding="display:item.education_flag">学历认证</li> </ul> </li> </ul> </div> ';return __},helpers:{}});return T.template=T.html,T});define("views/search",function(e,i,t){{var s=(e("$"),e("util")),n=e("activity"),l=e("../widget/extend/loading"),r=e("../core/model"),d=e("../widget/scroll");e("animation")}return n.extend({events:{'tap [sn-repeat-name="data"][data-id]':function(e){this.forward("/teacher/"+e.currentTarget.getAttribute("data-id")+"?from="+this.route.url)},"tap .js_search":function(e){var i=this.getParam(this.model.data.keywords);this.loading.setParam(i).reload()}},getParam:function(e){return e?s.validateMobile(e)?{mobile:e,teacher_name:""}:{mobile:"",teacher_name:e}:{mobile:"",teacher_name:""}},onCreate:function(){var e=this,i=this.$(".main");d.bind(i,{refresh:function(i,t){e.loading.reload({showLoading:!1},function(e,a){e?t(e):i(a)})}}),this.loading=new l({url:"/teacher/teacher_list",check:!1,params:this.getParam(this.route.data.keywords),$el:this.$el,$content:i.children(":first-child"),$scroll:i,success:function(i){i.data.length>=10&&(i.total=(this.pageIndex+1)*this.pageSize),e.model.set(i)},append:function(i){i.data.length>=10&&(i.total=(this.pageIndex+1)*this.pageSize),e.model.get("data").append(i.data)}}),this.model=new r.ViewModel(this.$el),this.loading.load()},onShow:function(){},onDestory:function(){}})});define("views/appointment",function(e,i,t){{var s=(e("$"),e("util")),n=e("activity"),l=e("../widget/extend/loading"),d=e("../core/model"),r=e("../widget/scroll");e("animation")}return n.extend({events:{"tap .js_submit:not(.disabled)":function(e){return this.model.data.validCode?(this.$submit.addClass("disabled"),void this.loading.setParam({valid_code:this.model.data.validCode}).load()):void sl.tip("请输入验证码")},"tap .js_valid:not(.disabled)":function(e){this.$valid.addClass("disabled"),this.valid.load()}},onCreate:function(){var i=this.$(".main");r.bind(i);var t=localStorage.getItem("member"),a=JSON.parse(localStorage.getItem("teacher"));this.teacher=a,this.model=new d.ViewModel(this.$el,{title:"预约试听",back:"/teacher/"+a.basic_info.teacher_id,teacher:a.basic_info,valid:"获取验证码"}),t||this.forward("/login?from=/appointment")},validTimeout:function(){var e=this,i=localStorage.getItem("valid_time");i&&(i=parseInt(i))&&(e.$valid.addClass("disabled"),setTimeout(function(){0>=i?(e.$valid.removeClass("disabled"),e.model.set("valid","获取验证码"),localStorage.removeItem("valid_time")):(e.model.set("valid",i+"秒后获取"),i--,localStorage.setItem("valid_time",i),setTimeout(arguments.callee,1e3))},1e3))},onShow:function(){var e=this,i=localStorage.getItem("member");if(i&&!this.created){this.created=!0;var t=this.teacher;this.model.set({mobile:i.mobile,userName:i.user_name,member_id:i.member_id}),this.$submit=this.$(".js_submit"),this.$valid=this.$(".js_valid"),e.validTimeout(),this.loading=new l({url:"/student/appointment_teacher",method:"POST",params:{teacher_id:t.basic_info.teacher_id,student_id:this.model.data.member_id,discipline:t.basic_info.discipline,student_name:this.model.data.userName,student_mobile:this.model.data.mobile,teacher_name:t.basic_info.teacher_name,appointment_time:s.formatDate(new Date),valid_type:1},check:!1,checkData:!1,$el:this.$el,success:function(i){1==i.error_code&&sl.tip(i.error_msg),e.$submit.removeClass("disabled")}}),this.valid=new l({url:"/sms/send_valid_code",method:"POST",params:{mobile:e.model.data.mobile,type:7},check:!1,checkData:!1,$el:this.$el,success:function(i){1==i.error_code?sl.tip(i.error_msg):(localStorage.setItem("valid_time",59),e.validTimeout())}})}},onDestory:function(){}})});define("template/teacher",function(require){var T=(require("util"),{html:function($data){var __="";with($data||{})__+='<header> <div class="head_back" sn-binding="data-back:back"></div> <div sn-binding="html:title" class="head_title"></div> </header> <div class="main teacherwrap"> <div class="teacher_info"> <div class="teacher_basic"><img class="head_photo" sn-binding="src:basic_info.head_photo" /> <div class="tb_item"><h1 class="teacher_name" sn-binding="html:basic_info.teacher_name"></h1> <div class="teacher_area" sn-binding="html:basic_info.area"></div> </div> <div class="tb_item"><h2 class="discipline" sn-binding="html:basic_info.discipline"></h2> <div class="teaching_age" sn-binding="html:basic_info.teaching_age|concat:\'教龄\'"></div> </div> </div> <ul class="teacher_cert"> <li class="cert" sn-binding="display:basic_info.certification_flag">身份认证</li> <li class="t_cert" sn-binding="display:basic_info.teacher_certification_flag">教师资格认证</li> <li class="education" sn-binding="display:basic_info.education_flag">学历认证</li> </ul> <div class="teacher_honor" sn-binding="html:basic_info.honor"></div> </div> <ul class="teacher_data"> <li sn-binding="html:basic_info.class_hours_number|concat:\'小时\'"></li> <li sn-binding="html:basic_info.students_number|concat:\'个\'"></li> <li sn-binding="html:basic_info.praise_rate"></li> <li sn-binding="html:basic_info.continue_rate"></li> </ul> <div class="tabs_nav"> <ul class="tabs_nav_con"> <li class="curr">经历</li> <li>评价</li> </ul> </div> <div class="tabs_content"> <div class="tabs_panel teacher_exp curr"><h4>过往经历</h4> <dl sn-repeat="item in past_experience"> <dt sn-binding="html:item.date_area"></dt> <dd sn-binding="html:item.content"></dd> </dl> <h4>教学成果</h4> <dl sn-repeat="item in teaching_achievements"> <dt sn-binding="html:item.date_area"></dt> <dd sn-binding="html:item.content"></dd> </dl> </div> <div class="tabs_panel teacher_cmt"> <div class="teacher_cmt_item" sn-repeat="item in appraise_list"><h3><b sn-binding="html:item.student_name"></b><span class="class_time" sn-binding="html:item.class_time|format:\'课时数（{0}小时）\'"></span></h3> <ul> <li sn-repeat="item1 in item.list"><h4><text sn-binding="html:item1.type"></text><span sn-binding="html:item1.score|round|concat:\'分\'"></span></h4> <div class="comments" sn-binding="html:item1.comments"></div> </li> </ul> </div> </div> </div> </div> <footer class="bottom_bar"> <b class="btn_large" data-forward="/appointment">免费试听</b> </footer> ';return __},helpers:{}});return T.template=T.html,T});define("template/appointment",function(require){var T=(require("util"),{html:function($data){var __="";with($data||{})__+='<header> <div class="head_back" sn-binding="data-back:back"></div> <div sn-binding="html:title" class="head_title"></div> </header> <div class="main"> <div class="apm_teacher"><img sn-binding="src:teacher.head_photo" /> <ul> <li sn-binding="html:teacher.discipline|format:\'科目：{0}\'"></li> <li sn-binding="html:teacher.teacher_name|format:\'教师：{0}老师\'"></li> </ul> </div> <div class="apm_member" sn-binding="html:userName"></div> <div class="apm_member" sn-binding="html:mobile"></div> <div class="apm_member_form"><input placeholder="输入验证码" sn-model="validCode" /> <b class="btn_large1 js_valid" sn-binding="html:valid"></b> </div> <div class="apm_member_form"><b class="btn_large1 js_submit">提交</b> </div> </div> ';return __},helpers:{}});return T.template=T.html,T});define("views/teacher",function(i,e,t){{var a=i("$"),n=(i("util"),i("activity")),l=i("../widget/extend/loading"),d=i("../core/model"),c=i("../widget/scroll");i("animation")}return n.extend({events:{"tap .tabs_nav_con li:not(.curr)":function(i){var e=a(i.currentTarget);e.addClass("curr").siblings(".curr").removeClass("curr"),this.$panels.eq(e.index()).addClass("curr").siblings(".curr").removeClass("curr")}},onCreate:function(){var i=this,e=this.$(".main");c.bind(e),this.model=new d.ViewModel(this.$el,{title:"老师详情页",back:this.route.queries.from||"/"}),this.$panels=this.$(".tabs_panel"),this.loading=new l({url:"/teacher/teacher_info",params:{teacher_id:this.route.data.id},check:!1,checkData:!1,$el:this.$el,$content:e.children(":first-child"),$scroll:e,success:function(e){i.model.set(e.data),localStorage.setItem("teacher",JSON.stringify(e.data))}}),this.loading.load()},onShow:function(){},onDestory:function(){}})});