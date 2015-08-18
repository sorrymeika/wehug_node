<header>
    <div class="head_back" sn-binding="data-back:back"></div>
    <div sn-binding="html:title" class="head_title"></div>
</header>
<div class="main">
    <div sn-binding="display:user.FreeMonths|not|equal:0">
        <div class="month_present">
            <img />
        </div>
        <div class="month_notice">
            亲，不要忘记啦！您还有<em sn-binding="html:user.FreeMonths"></em>个月的会员礼可以领取哟！
        </div>
        <ul class="month">
            <li class="overdue">
                <i class="flag">2015年</i>
                <img />
            </li>
            <li class="get"></li>
            <li class="curr"><em>立即领取</em></li>
            <li><span>11月</span></li>
            <li class="lastmonth"><span>12月</span></li>
            <li>
                <i class="flag">2016年</i>
                <span>1月</span>
            </li>
            <li><span>2月</span></li>
        </ul>
    </div>
    <div sn-binding="display:user.FreeMonths|equal:0" class="month_no_free">
    </div>
</div>
