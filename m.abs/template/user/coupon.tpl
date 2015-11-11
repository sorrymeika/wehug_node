<header>
    <div class="head_back" data-back="{{back}}"></div>
    <div class="head_title">{{title}}</div>
</header>
<div class="main uc_coupon">
    <div class="uc_coupon_help">使用规则</div>
    <div class="uc_coupon_get">
        <input type="text" placeholder="请输入券码" />
        <b class="btn">我要领券</b>
    </div>
    <ul class="uc_coupon_hd">
        <li class="{{isOverdue?'':'curr'}}" sn-tap="isOverdue=false">优惠券</li>
        <li class="{{isOverdue?'curr':''}}" sn-tap="isOverdue=true">免邮卡</li>
    </ul>
    <ul class="uc_coupon_list js_not_overdue" sn-display="{{!isOverdue}}">
        <li sn-repeat="item in testData" class="{{(item.VCA_VCT_ID == 4 ? 'free' : item.VCA_VCT_ID == 2 ? 'price10' : item.VCA_VCT_ID == 1 ? 'price50' : '') + (item.IsOverdue ? ' dis' : '')}}">
            <div class="price">{{util.currency(item.VCA_DEDUCT_AMOUNT,'')}}</div>
            <div class="name">{{item.VCA_VCT_ID==4?'免邮卡':item.VCA_NAME}}</div>
            <div class="share">
                <i>分享</i>
            </div>
        </li>
        <li sn-repeat="item in data" sn-binding="class:item|cardClass">
            <div class="price" sn-binding="html:item.VCA_DEDUCT_AMOUNT|currency,display:item.VCA_VCT_ID|equal:4|not"></div>
            <div class="name" sn-binding="html:item.VCA_VCT_ID|equal:4:'免邮卡':item.VCA_NAME"><!--单笔订单满300可用--></div>
            <div class="time"><div class="hd">有效期</div><div class="con" sn-binding="html:item.CSV_START_DT|date:'yyyy/MM/dd'|concat:'至',display:item.IsOverdue|not"></div><div class="con" sn-binding="html:item.CSV_END_DT|date:'yyyy/MM/dd',display:item.IsOverdue|not"></div><div class="overdue" sn-binding="display:item.IsOverdue" style="display:none">已过期</div></div>
        </li>
    </ul>
    <ul class="mycard_con js_overdue" sn-binding="display:isOverdue">
        <li sn-repeat="item in data1" class="free" sn-binding="class:item.IsOverdue|equal:true:'dis':''">
            <div class="price" sn-binding="html:item.VCA_DEDUCT_AMOUNT|currency,display:item.VCA_VCT_ID|equal:4|not"></div>
            <div class="name" sn-binding="html:item.VCA_VCT_ID|equal:4:'免邮卡':item.VCA_NAME"><!--单笔订单满300可用--></div>
            <div class="time"><div class="hd">有效期</div><div class="con" sn-binding="html:item.CSV_START_DT|date:'yyyy/MM/dd'|concat:'至',display:item.IsOverdue|not"></div><div class="con" sn-binding="html:item.CSV_END_DT|date:'yyyy/MM/dd',display:item.IsOverdue|not"></div><div class="overdue" sn-binding="display:item.IsOverdue" style="display:none">已过期</div></div>
        </li>
    </ul>
    <div class="my_nodata" style="display:none">
        <div class="icon"></div>
        <div class="text">您目前还没有卡券哦</div>
        <div class="btn" sn-on="tap:open">去逛逛吧</div>
    </div>
</div>