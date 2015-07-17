<header>
    <div sn-binding="html:title" class="head_title"></div>
    <div class="head_back" sn-binding="data-back:back"></div>
</header>
<div class="main">
    <div class="login_form">
        <ul class="form">
            <li><input placeholder="输入手机号" sn-model="mobile" /></li>
            <li><input placeholder="输入验证码" sn-model="password" type="text" /> <b class="js_valid" sn-binding="html:valid"></b></li>
        </ul>
        <div class="login_btn"><b class="btn_large js_bind">登录</b> </div>
        <div class="login_notice">新用户点击登陆即可完成注册</div>
    </div>
</div>
