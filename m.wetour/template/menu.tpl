<div class="menu_bd">
    <div class="menu_user" sn-binding="data-back:memberUrl">
        <img class="menu_avatars" sn-binding="src:user.Avatars" />
        <div class="menu_username">
            <h1 sn-binding="html:user.NickName"></h1>
            <h2 sn-binding="html:user.Mobile"></h2>
        </div>
    </div>
    <ul class="menu_list">
        <li class="menu_activity" data-back="/">我的活动</li>
        <li class="menu_comments" data-back="/settings">我的评论</li>
    </ul>
    <ul class="menu_list">
        <li class="menu_pwd" data-back="/">修改密码</li>
        <li class="menu_settings" data-back="/settings">设置</li>
        <li class="menu_logout" sn-binding="html:logoutOrLogin,data-back:logout">退出</li>
    </ul>
</div>