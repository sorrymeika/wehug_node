<header>
    <div class="head_back" sn-binding="data-back:back"></div>
    <div sn-binding="html:title" class="head_title"></div>
</header>
<div class="main">
    <ul class="order_list">
        <li class="order_item" sn-repeat="item in data" sn-binding="data-forward:item.order_code|format:'/orderinfo/{0}'">
            <div class="order_list_teacher">
                <img sn-binding="src:item.head_photo" />
                <div class="order_list_teacher_info">
                    <div class="name" sn-binding="html:item.teacher_name|concat:'　':item.course_name"></div>
                    <div class="class_method" sn-binding="html:item.class_method"></div>
                    <div class="course_time" sn-binding="html:item.course_time|round|concat:'小时'"></div>
                </div>
                <div class="order_list_status" sn-binding="html:item.order_status|getOrderStatus"></div>
            </div>
            <div class="order_list_info">
                <span sn-binding="html:item.order_code"></span>
                <em sn-binding="html:item.payment_price|format:'￥{0}'"></em>
            </div>
        </li>
    </ul>
</div>