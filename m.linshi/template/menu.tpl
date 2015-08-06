<div class="menu_hd">个人中心</div>
<div class="menu_bd">
    <div class="menu_user" sn-binding="data-back:memberUrl">
        <img class="menu_avatars" sn-binding="src:avatars|or:defAvatar,onerror:defAvatar|format:'this.src=&quot;{0}&quot;'" />
        <h1 class="menu_username" sn-binding="html:user_name"></h1>
    </div>
    <ul class="menu_list">
        <li class="menu_home" data-back="/">首页</li>
        <li class="menu_settings" data-back="/settings">设置</li>
    </ul>
</div>