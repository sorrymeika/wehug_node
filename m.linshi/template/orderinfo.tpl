<header>
    <div class="head_back" sn-binding="data-back:back"></div>
    <div sn-binding="html:title" class="head_title"></div>
</header>
<div class="main">
    <div class="orderinfo">
        <dl class="status"><dt>订单状态</dt><dd sn-binding="html:order_info.order_status|getOrderStatus"></dd></dl>
        <div class="order_teacher">
            <img sn-binding="src:teacher_info.head_photo" />
            <ul class="order_teacher_info">
                <li sn-binding="html:teacher_info.teacher_name"></li>
                <li sn-binding="html:teacher_info.teaching_age|concat:'年教龄'"></li>
                <li sn-binding="html:teacher_info.discipline"></li>
            </ul>
        </div>
        <div class="order_info">
            <ul class="orderinfo_bill">
                <li><span>课程：</span><span sn-binding="html:order_info.class_method"></span></li>
                <li><span>上课地址：</span><span sn-binding="html:order_info.class_address"></span></li>
                <li><span>学员姓名：</span><span sn-binding="html:order_info.student_name"></span></li>
                <li><span>联系方式：</span><span sn-binding="html:order_info.student_mobile"></span></li>
                <li><span>课时数：</span><span sn-binding="html:order_info.total_time|concat:'小时'"></span></li>
            </ul>
            <ul class="orderinfo_bill">
                <li><span>订单号：</span><span sn-binding="html:order_info.order_code"></span></li>
                <li><span>课程总价：</span><span sn-binding="html:order_info.total_price|concat:'元'"></span></li>
                <li><span>优惠券：</span><span sn-binding="html:order_info.coupon_price|concat:'元'"></span></li>
                <li><span>实际支付：</span><span sn-binding="html:order_info.payment_price|concat:'元'"></span></li>
            </ul>
        </div>
    </div>
</div>
<footer class="bottom_bar"> <b class="btn_large2" style="display:none" sn-binding="display:order_info.order_status|is:6" sn-on="tap:cancel">取消订单</b> <b class="btn_large" sn-binding="display:order_info.order_status|is:6" sn-on="tap:pay" style="display:none">支付</b> </footer>