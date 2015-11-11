<header>
    <div class="head_back" data-back="{{back}}"></div>
    <div class="head_title">{{title}}</div>
</header>
<div class="main uc_month">
    <div sn-display="{{!user.FreeMonths}}">
        <div class="uc_month_card">
            <div class="uc_month_card_user">
                <b>金卡会员</b>
                <span>(3650/5000)</span>
                <p>
                    亲，不要忘记啦！<br />
                    您还有<em>{{user.FreeMonths}}</em>个月的会员礼可以领取哟！
                </p>
            </div>
            <div class="uc_month_val">
                <b>我的月礼</b>
                <span>(18/30)</span>
            </div>
        </div>
        <div class="uc_months_slider">
            <ul class="uc_month_slider_tit">
                <li>2014</li>
                <li class="curr">2015</li>
                <li>2016</li>
            </ul>
            <div class="uc_month_slider">
                <ul>
                    <li class="uc_month_item">
                        <p class="img canget">
                            <img src="{{item.FRE_TITLE_PIC}}"/>
                        </p>
                        <span>10月</span>
                    </li>
                    <li class="uc_month_item">
                        <p class="img disable">
                            <img src="{{item.FRE_TITLE_PIC}}" />
                        </p>
                        <span>10月</span>
                    </li>
                </ul>
            </div>
        </div>
        <div class="month_present">
            <img sn-binding="src:currentMonth.FRE_PIC1" sn-on="tap:openPresent:currentMonth" />
        </div>
        <div class="month_notice">
            不要忘记啦！您还有<em sn-binding="html:user.FreeMonths"></em>个月的会员礼可以领取哟！
        </div>
        <ul class="month">
            <li sn-repeat="item in data" sn-binding="class:item|eval:'($0.Overdue||$0.LPF_PUR_ID)&&$0.CanGet?\'overdue curr\':($0.Overdue||$0.LPF_PUR_ID)?\'overdue\':$0.CanGet?\'curr\':\'\'',data-year:item.Year" sn-on="tap:openPresent:item">
                <i class="flag" sn-binding="html:item.Year|concat:'年',display:item.Year" style="display:none"></i>
                <img sn-binding="src:item.FRE_TITLE_PIC,display:item.FRE_TITLE_PIC" />
                <span sn-binding="html:item|eval:'$0.Overdue||$0.LPF_PUR_ID?\'\':($0.Month+\'月\')',class:item|eval:'$0.Overdue?\'over\':$0.LPF_PUR_ID?\'get\':\'\''"></span>
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
