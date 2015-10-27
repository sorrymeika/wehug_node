<header>
    <div class="{{menu}}"></div>
    <div class="{{titleClass}}">{{title.title}}</div>
    <div class="head_msg" data-forward="/messages">
        <i sn-display="{{msg!=0}}">{{msg}}</i>
    </div>
</header>
<div sn-display="{{!isLogin}}">
    <div class="home_mask"></div>
    <div class="home_text" data-forward="/login">
        <h1></h1>
        <h2>让回家的灯，为爱亮起来。</h2>
        <h3>开启时尚居家之旅</h3>
        <h4>LIFE STARTS HERE</h4>
    </div>
    <div class="launch">
        <img src="images/launch0.jpg" />
        <img src="images/launch1.jpg" class="launch_hide" />
        <img src="images/launch2.jpg" class="launch_hide" />
    </div>
</div>
<div sn-display="{{isLogin}}">
    <div class="main js_usescroll {{isLogin?"":"isnotlogin"}}" data-index="0">
        <div class="home_bd">
            <div class="home_vip">
                <div class="rainbow">
                    <ul class="rainbow_points">
                        <li>0</li>
                        <li>1,000</li>
                        <li>5,000</li>
                        <li>10,000</li>
                        <li>50,000</li>
                    </ul>
                    <ul class="rainbow_vip">
                        <li>银卡</li>
                        <li>金卡</li>
                        <li>钻石</li>
                        <li>VIP</li>
                        <li>SVIP</li>
                    </ul>
                    <div class="rainbow_bd">
                        <div class="point">{{util.formatMoney(Point.toFixed(2))}}</div>
                        <div class="desc">{{currentLevel}}</div>
                        <div class="point_tip">
                            <div sn-display="{{nextLevel==0}}" class="max">
                                <p>活力值爆棚</p>
                                <p>感谢您的⽀持和惠顾</p>
                            </div>
                            <div sn-display="{{nextLevel!=0}}">
                                <span>+{{util.formatMoney(nextLevel)}}</span><b>活力值</b>
                                <p>即可享有<em>{{vip}}</em>特权</p>
                            </div>
                        </div>
                    </div>
                </div>
                <canvas class="home_points_bg js_canvas"></canvas>
                <div class="home_points_bg">
                    <div class="home_points"></div>
                    <div class="home_points"></div>
                    <div class="home_points_cursor"></div>
                </div>
            </div>
            <ul class="home_ad">
                <li sn-repeat="item,i in ads">
                    <img src="{{item.Src}}" sn-tap="openUrl:item.Url" />
                </li>
            </ul>
        </div>
    </div>
    <div class="main" style="display:none" data-index="1">
    </div>
    <div class="main" style="display:none" data-index="2">
        <div class="baiduMap" sn-html="{{baiduMap}}">
        </div>
    </div>
    <div class="main home_my" style="display:none" data-index="3">
        <div class="my">
            <div class="card">
                <div class="level">
                    <span>{{currentLevel}}</span>
                    <span>{{cardAmounts}}</span>
                </div>
                <div class="point"></div>
                <div class="barcode" sn-html="{{barcode}}">
                </div>
                <div class="mobile">{{user.Mobile}}</div>
            </div>
            <ul class="myabs">
                <li data-forward="/month">
                    <b>我的月礼</b>
                    <span sn-display="{{user.FreeMonths}}">您还有<em>{{user.FreeMonths}}个月</em>会员礼可以领取。</span>
                    <span sn-display="{{!user.FreeMonths}}">继续努力，马上就可以获得免费领取特权了。</span>
                </li>
                <li data-forward="/mycard">
                    <b>我的卡券</b>
                    <span>您现在拥有免邮卡<em>{{user.FreeCouponsCount}}</em>张，优惠券<em>{{user.CouponsCount}}</em>张。</span>
                </li>
                <li data-forward="/mypoint">
                    <b>积分钱包</b>
                    <span>您当前积分为<em>{{user.Points}}</em>。</span>
                </li>
                <li data-forward="/myorder">
                    <b>我买到的</b>
                    <span sn-display="{{user.OrderCount}}" style="display:none">您目前在ABS共完成<em>{{user.OrderCount}}</em>次购物。</span>
                    <span sn-display="{{!user.OrderCount}}"> 您还未购买过商品，立即开启您的购物之旅。</span>
                </li>
            </ul>
        </div>
    </div>
    <div class="main js_offline" sn-display="{{isOffline}}">
        <div class="home_offline">
            <div class="ico"></div>
            <div class="txt">您的网络不太顺畅哦</div>
            <div class="txt_sub">请检查您的手机是否联网</div>
            <div class="btn">重新加载</div>
        </div>
    </div>
</div>
<ul class="footer" sn-display="{{isLogin}}">
    <li class="curr">首页</li>
    <li>马上购物</li>
    <li>附近门店</li>
    <li>我</li>
</ul>
<div class="open_msg" style="display:none">
    <div class="msg_bd" sn-html="{{message}}"></div>
</div>
<div class="home_tip_mask" sn-display="{{isLogin&&isFirstOpen}}"></div>