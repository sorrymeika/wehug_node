<header>
    <div sn-binding="class:menu"></div>
    <div sn-binding="html:title,class:titleClass"></div>
    <div class="head_msg" data-forward="/messages">
        <i>3</i>
    </div>
</header>
<div class="main js_usescroll" data-index="0" sn-binding="class:isLogin|equal:true:'':'isnotlogin'">
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
                    <div class="point" sn-binding="html:point"></div>
                    <div class="desc" sn-binding="html:currentLevel"></div>
                    <div class="point_tip">
                        <span sn-binding="html:nextLevel"></span><b>活力值</b>
                        <p>即可享有<em sn-binding="html:vip"></em>特权</p>
                    </div>
                </div>
            </div>
            <div class="home_points_bg">
                <div class="home_points"></div>
                <div class="home_points"></div>
                <div class="home_points_cursor"></div>
            </div>
        </div>
        <ul class="home_ad">
            <li sn-repeat="item in ads">
                <img sn-binding="src:item.Src" sn-on="tap:open:item.Url" />
            </li>
        </ul>
    </div>
    <div sn-binding="display:isLogin|not" class="home_notlogin">
        <div class="home_mask"></div>
        <div class="home_text" data-forward="/login">
            <h1></h1>
            <h2>让回家的灯，为爱亮起来。</h2>
            <h3>开启时尚居家之旅</h3>
            <h4>LIFE STARTS HERE</h4>
        </div>
        <div class="launch">
            <img src="images/launch0.png" />
            <img src="images/launch1.png" class="launch_hide" />
            <img src="images/launch2.png" class="launch_hide" />
        </div>
    </div>
</div>
<div class="main" style="display:none" data-index="1">
</div>
<div class="main" style="display:none" data-index="2">
</div>
<div class="main home_my" style="display:none" data-index="3">
    <div class="my">
        <div class="card">
            <div class="level">
                <span sn-binding="html:currentLevel"></span>
                <span sn-binding="html:point"></span>
            </div>
            <div class="point" sn-binding="html:id|format:'ID:{0}'"></div>
            <div class="barcode" sn-binding="html:barcode">
            </div>
            <div class="mobile" sn-binding="html:user.Mobile"></div>
        </div>
        <ul class="myabs">
            <li data-forward="/month">
                <b>我的月礼</b>
                <span>您当前享有<em>12个月</em>会员礼免费领特权。</span>
            </li>
            <li data-forward="/mycard">
                <b>我的卡券</b>
                <span>您现在拥有优惠券<em>8</em>张。</span>
            </li>
            <li data-forward="/mypoint">
                <b>我的积分</b>
                <span>您当前积分为<em>8</em>。</span>
            </li>
            <li data-forward="/myorder">
                <b>我买到的</b>
                <span>您目前在ABS共完成<em>8</em>次购物。</span>
            </li>
        </ul>
    </div>
</div>
<ul class="footer" sn-binding="display:isLogin">
    <li class="curr">首页</li>
    <li>马上购物</li>
    <li>附近门店</li>
    <li>我</li>
</ul>