﻿<header>
    <div class="head_back" sn-binding="data-back:back"></div>
    <div sn-binding="html:title" class="head_title"></div>
</header>
<div class="main mypoint">
    <div class="curr">当前积分：<b sn-binding="html:points"></b></div>
    <div class="notice">*您的积分可以直接抵扣现金使用。<span>（100积分＝1元）</span></div>
    <div class="hd">积分记录</div>
    <ul class="mypoint_list">
        <li sn-repeat="item in data">
            <p class="from" sn-binding="html:item.POT_DESC"></p>
            <p class="date" sn-binding="html:item.HPT_DT|date:'yyyy.MM.dd'"></p>
            <p class="points" sn-binding="html:item.HPT_POINT_AMOUNT|round|format:'{0}>0?&quot;+{0}&quot;:&quot;{0}&quot;'|eval,class:item.HPT_POINT_AMOUNT|lt:0|equal:true:'minus':''"></p>
        </li>
    </ul>
</div>