<header>
    <div class="head_back" sn-binding="data-back:back"></div>
    <div sn-binding="html:title" class="head_title"></div>
</header>
<div class="main mycard">
    <ul class="mycard_hd">
        <li sn-binding="class:isOverdue|equal:false:'curr':''" sn-on="tap:isOverdue=false">待使用</li>
        <li sn-binding="class:isOverdue|equal:false:'':'curr'" sn-on="tap:isOverdue=true">已过期</li>
    </ul>
    <ul class="mycard_con" sn-binding="display:isOverdue|not">
        <!-- <li class="free">
             <div class="name">免邮券</div>
             <div class="time"><div class="hd">有效期</div><div class="con">2015/07/30</div></div>
         </li>-->
        <li sn-repeat="item in data" sn-binding="class:item.VCA_DEDUCT_AMOUNT|cardClass">
            <div class="price" sn-binding="html:item.VCA_DEDUCT_AMOUNT|currency"></div>
            <div class="name" sn-binding="html:item.VCA_NAME"><!--单笔订单满300可用--></div>
            <div class="time"><div class="hd">有效期</div><div class="con" sn-binding="html:item.CSV_END_DT|date:'yyyy/MM/dd'"></div></div>
        </li>
    </ul>
    <ul class="mycard_con" sn-binding="display:isOverdue">
        <li class="dis" sn-repeat="item in data1">
            <div class="price" sn-binding="html:item.VCA_DEDUCT_AMOUNT|currency"></div>
            <div class="name" sn-binding="html:item.VCA_NAME"><!--单笔订单满300可用--></div>
            <div class="time"><div class="hd">有效期</div><div class="con" sn-binding="html:item.CSV_END_DT|date:'yyyy/MM/dd'"></div></div>
        </li>
    </ul>
</div>