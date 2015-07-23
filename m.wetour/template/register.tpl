<header>
    <div class="head_back" sn-binding="data-back:back"></div>
    <div sn-binding="html:title" class="head_title"></div>
</header>
<div class="main">
    <div class="apm_teacher"><img sn-binding="src:teacher.head_photo" />
        <ul>
            <li sn-binding="html:teacher.discipline|format:'科目：{0}'"></li>
            <li sn-binding="html:teacher.teacher_name|format:'教师：{0}老师'"></li>
        </ul>
    </div>
    <div class="apm_member" sn-binding="html:userName"></div>
    <div class="apm_member" sn-binding="html:mobile"></div>
    <div class="apm_member_form"><input placeholder="输入验证码" sn-model="validCode" />
        <b class="btn_large1 js_valid" sn-binding="html:valid"></b> </div>
    <div class="apm_member_form"><b class="btn_large1 js_submit">提交</b> </div>
</div>
