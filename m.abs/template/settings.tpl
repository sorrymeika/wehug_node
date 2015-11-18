<header>
    <div class="head_back" sn-binding="data-back:back"></div>
    <div sn-binding="html:title" class="head_title"></div>
    <div class="head_msg" data-forward="/messages?from=/settings"></div>
</header>
<div class="main settings">
    <div class="hello">
        <div class="name" sn-binding="html:user.UserName|or:'亲爱的用户'"></div>
        <div class="text">你好！</div>
    </div>
    <ul class="con">
        <li data-forward="/member?from=/settings">账户信息</li>
        <li data-forward="/about?from=/settings">隐私政策</li>
    </ul>
    <div class="ft">
        <b class="btn_large" sn-on="tap:logout" sn-binding="html:user|equal:null:'立即登录':'退出登录'"></b>
    </div>
</div>