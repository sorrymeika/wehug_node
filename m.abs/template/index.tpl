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
                <ul class="rainbow_points">
                    <li>0</li>
                    <li>1000</li>
                    <li>5000</li>
                    <li>10000</li>
                    <li>50000</li>
                </ul>
                <ul class="rainbow_vip">
                    <li>银卡</li>
                    <li>金卡</li>
                    <li>钻石</li>
                    <li>VIP</li>
                    <li>SVIP</li>
                </ul>
                <div class="rainbow_bd">
                    <div class="point">3333</div>
                    <div class="desc">金卡会员</div>
                    <div class="point_tip">
                        <span>+xxxx</span><b>新鲜氧气</b>
                        <p>即可享有<em>钻石会员</em>特权</p>
                    </div>
                </div>
            </div>
            <div class="home_points_bg">
                <div class="home_points"></div>
                <div class="home_points"></div>
                <div class="home_points_cursor"></div>
            </div>
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