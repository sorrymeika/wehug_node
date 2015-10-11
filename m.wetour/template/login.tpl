<header>
    <div sn-binding="html:title" class="head_title"></div>
    <div class="head_back" sn-binding="data-back:back"></div>
</header>
<div class="main">
    <div class="login_form">
        <ul class="form">
            <li><input placeholder="输入手机号" sn-model="mobile" /></li>
            <li><input placeholder="输入密码" sn-model="password" type="password" /></li>
        </ul>
        <div class="login_btn"><b class="btn_large js_login">登录</b> </div>
        <div class="login_notice"><a href="/register" forward>我要注册</a> | <a href="/resetpwd" forward>忘记密码？</a></div>
    </div>
</div>
