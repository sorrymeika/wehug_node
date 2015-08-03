<header>
    <div sn-binding="class:menu"></div>
    <div sn-binding="html:title,class:titleClass"></div>
    <div class="head_msg"></div>
</header>
<div class="main" data-index="0">
    <div class="js_slider"></div>
    <div sn-binding="display:isLogin" class="home_bd">
        <div class="home_vip">
            <div class="rainbow">
            </div>
            <div class="home_points"></div>
        </div>
    </div>
    <div sn-binding="display:isLogin|not" class="home_notlogin">
        <div class="home_mask"></div>
        <div class="home_text">
            <h1></h1>
            <h2>让回家的灯，为爱亮起来。</h2>
            <h3>开启时尚居家之旅</h3>
            <h4>LIFE STARTS HERE</h4>
        </div>
        <div class="launch">
            <img src="images/launch0.png" />
        </div>
    </div>
</div>
<div class="main" style="display:none" data-index="1">
</div>
<div class="main" style="display:none" data-index="2">
</div>
<div class="main" style="display:none" data-index="3">
</div>
<ul class="footer" sn-binding="display:isLogin">
    <li class="curr">首页</li>
    <li>马上购物</li>
    <li>附件门店</li>
    <li>我</li>
</ul>