﻿<header>
    <div class="head_back" sn-binding="data-back:back"></div>
    <div sn-binding="html:title" class="head_title"></div>
</header>
<div class="main message_center">
    <div class="message_card" sn-repeat="item in data">
        <div class="hd">
            <h2 sn-binding="html:item.MSG_TITLE"></h2>
            <h3 sn-binding="html:item.LPM_START_DT|date:'yyyy.MM.dd'"></h3>
        </div>
        <div class="bd" sn-binding="html:item.MSG_CONTENT"></div>
    </div>
</div>