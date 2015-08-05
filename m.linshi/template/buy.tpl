<header>
    <div class="head_back" sn-binding="data-back:back"></div>
    <div sn-binding="html:title" class="head_title"></div>
</header>
<div class="main">
    <ul class="buywrap bill">
        <li class="multi">
            <p><span class="label">科目：</span><em class="con" sn-binding="html:basic_info.discipline"></em></p>
            <p><span class="label">授课老师：</span><em class="con" sn-binding="html:basic_info.teacher_name"></em></p>
        </li>
        <li>
            <span class="label">学员名称</span>
            <b class="con" sn-binding="html:member.real_name|or:'请填写学员真实姓名'"></b>
            <i class="ico_next"></i>
        </li>
        <li>
            <span class="label">课程</span>
            <em class="con" sn-binding="html:course.class_method_name"></em>
            <i class="ico_next"></i>
        </li>
        <li>
            <span class="label">课时</span>
            <div class="con">
                <div class="cp-number">
                    <i class="cp-number-minus js_total_time_minus"></i>
                    <i class="cp-number-num" sn-binding="html:total_time"></i>
                    <i class="cp-number-plus js_total_time_plus"></i>
                    <input type="hidden" sn-binding="value:total_time" sn-model="total_time" />
                </div>
            </div>
        </li>
        <li>
            <span class="label">上课地址</span>
            <em class="con" sn-binding="html:basic_info.class_address.address_detail"></em>
        </li>
        <li>
            <span class="label">优惠券</span>
            <em class="con" sn-binding="html:coupon"></em>
            <i class="ico_next"></i>
        </li>
        <li class="multi">
            <p class="bill_li">
                <span class="label" sn-binding="html:basic_info.teacher_name"></span>
                <span class="label" sn-binding="html:basic_info.discipline"></span>
                <span class="label" sn-binding="html:total_time|concat:'小时'"></span><em class="con" sn-binding="html:total_time|mul:basic_info.price|concat:'元'"></em>
            </p>
            <p class="bill_li"><span class="label">优惠券</span><em class="con" sn-binding="html:coupon_price|concat:'元'"></em></p>
            <p class="bill_li"><span class="label">合计</span><em class="con" sn-binding="html:total_time|mul:basic_info.price|minus:coupon_price|concat:'元'"></em></p>
        </li>
    </ul>
</div>
<footer class="btn_submit_order js_submit">提交订单</footer>