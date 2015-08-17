﻿<div class="menu">
    <div class="menu_hd">
        菜单
    </div>
    <div class="menu_sub_hd"><a href="/login">退出系统</a></div>
    <div class="menu_bd">
        <dl sn-repeat="item in data">
            <dt sn-binding="class:item.current|case:true:'curr':''">
                <a sn-binding="html:item.title,href:item.url"></a>
            </dt>
            <dd sn-repeat="child in item.children" sn-binding="class:child.current|case:true:'curr':''">
                <a sn-binding="html:child.title,href:child.url"></a>
            </dd>
        </dl>
    </div>
</div>