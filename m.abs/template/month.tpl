<header>
    <div class="head_back" sn-binding="data-back:back"></div>
    <div sn-binding="html:title" class="head_title"></div>
</header>
<div class="main mymonth">
    <div sn-binding="display:user.FreeMonths|not|equal:0">
        <div class="month_present">
            <img sn-binding="src:currentMonth.FRE_PIC1" />
        </div>
        <div class="month_notice">
            不要忘记啦！您还有<em sn-binding="html:user.FreeMonths"></em>个月的会员礼可以领取哟！
        </div>
        <ul class="month">
            <li sn-repeat="item in data" sn-binding="class:item|eval:'$0.Overdue&&$0.CanGet?\'overdue curr\':$0.Overdue?\'overdue\':$0.CanGet?\'curr\':\'\'',data-year:item.Year">
                <i class="flag" sn-binding="html:item.Year|concat:'年',display:item.Year" style="display:none"></i>
                <img sn-binding="src:item.FRE_PIC1,display:item.FRE_PIC1" />
                <span sn-binding="html:item|eval:'$0.Overdue?\'过期\':$0.LPF_PUR_ID?\'已领\':($0.Month+\'月\')'"></span>
                <em sn-binding="display:item.CanGet" style="display:none">立即领取</em>
            </li>
        </ul>
    </div>
    <div class="my_nodata" sn-binding="display:user.FreeMonths|equal:0" style="display:none">
        <div class="icon"></div>
        <div class="text">您目前还没有免费领取特权哦！</div>
        <div class="btn" sn-on="tap:open">去逛逛吧</div>
    </div>
</div>
