<header>
    <div sn-binding="class:ico"></div>
    <div sn-binding="html:title" class="head_title"></div>
    <div class="head_city"><text sn-binding="html:city"></text><i></i></div>
</header>
<div class="main">
    <div class="js_slider home_slider">
    </div>
    <nav class="home">
        <ul class="nav_list">
            <li data-forward="/index">找老师</li>
            <li data-forward="/orderlist">订单</li>
            <li>优惠券</li>
            <li>品牌老师馆</li>
        </ul>
    </nav>
</div>
<div class="citylistwrap">
    <div class="city_list">
        <h1>即将开通城市</h1>
        <ul>
            <li sn-repeat="item in city_list">
                <span sn-binding="html:item.city_name"></span>
            </li>
        </ul>
    </div>
</div>