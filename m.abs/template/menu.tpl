<div class="menu_bd">
    <div class="menu_user" sn-binding="data-back:memberUrl">
        <img class="menu_avatars" sn-binding="src:user.Avatars" />
        <div class="menu_username">
            <h1 sn-binding="html:user.NickName"></h1>
            <h2 sn-binding="html:user.Mobile"></h2>
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
        <li>练习客服</li>
    </ul>
    <ul class="menu_list menu_settings">
        <li>设置</li>
    </ul>
</div>