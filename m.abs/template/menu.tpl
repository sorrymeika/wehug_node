<div class="menu_bd">
    <div class="menu_user" sn-binding="data-back:memberUrl">
        <div class="menu_username">
            <h1><text sn-binding="html:user.NickName|or:user.Mobile">adfasdf</text> <span>补全信息</span> </h1>
            <h2 sn-binding="html:user.BirthDay">1988/12/9</h2>
        </div>
    </div>
    <ul class="menu_list menu_my">
        <li data-forward="/month">我的月礼</li>
        <li data-forward="/mycard">我的卡券</li>
        <li data-forward="/mypoint">我的积分</li>
        <li data-forward="/myorder">我买到的</li>
    </ul>
    <ul class="menu_list menu_service">
        <li>新手指南</li>
        <li>联系客服</li>
    </ul>
    <ul class="menu_list menu_settings">
        <li data-forward="/settings">设置</li>
    </ul>
</div>