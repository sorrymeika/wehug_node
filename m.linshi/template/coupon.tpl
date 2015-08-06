<header>
    <div class="head_back" sn-binding="data-back:back"></div>
    <div sn-binding="html:title" class="head_title"></div>
</header>
<div class="main">
    <ul class="coupon_list">
        <li class="coupon_item" sn-repeat="item in data" sn-binding="data-id:item.coupon_id">
            <div class="coupon_price">
                <div class="status" sn-binding="html:item.status|getCouponStatus"></div>
                <div class="price" sn-binding="html:item|couponPrice"></div>
            </div>
            <div class="coupon_info">
                <div class="discipline" sn-binding="html:item.discipline|concat:'券'"></div>
                <div class="title" sn-binding="html:item.coupon_title"></div>
                <div class="time" sn-binding="html:item.begin_time|concat:'至'|concat:item.end_time|concat:'有效'"></div>
            </div>
        </li>
    </ul>
</div>
<footer class="coupon_ft">
    <input class="coupon_text" sn-model="coupon_code" sn-binding="value:coupon_code" placeholder="输入优惠券码" />
    <b class="btn_exchange" sn-on="click:exchange">兑换</b>
</footer>