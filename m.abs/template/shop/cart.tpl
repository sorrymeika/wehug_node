﻿@helper list(){
<div class="ct_list_wrap">
    <ul class="ct_list">
        <li class="ct_list_item">
            <div class="ct_list_item_con">
                <img src="" />
                <div class="con">
                    <b class="name">Mavis多功能榨汁活力瓶</b>
                    <p class="size">尺寸：XXL</p>
                    <p class="color">颜色：绿色</p>
                    <p class="qty">
                        <span class="minus">-</span>
                        <input type="text" value="1" />
                        <span class="plus">+</span>
                    </p>
                </div>
                <div class="ft">
                    <b class="price">￥000</b>
                    <del>￥000</del>
                </div>
            </div>
        </li>
        <li class="ct_list_item">
            <div class="ct_list_item_con">
                <img src="" />
                <div class="con">
                    <b class="name">Mavis多功能榨汁活力瓶</b>
                    <p class="size">尺寸：XXL</p>
                    <p class="color">颜色：绿色</p>
                    <p class="qty">
                        <span class="minus">-</span>
                        <input type="text" value="1" />
                        <span class="plus">+</span>
                    </p>
                </div>
                <div class="ft">
                    <b class="price">￥000</b>
                    <del>￥000</del>
                </div>
            </div>
        </li>
    </ul>
    <ul class="ct_list_info">
        <li><span>商品总价</span><em><b class="price">￥000</b></em></li>
        <li><span>使用优惠券</span><em><b>5</b>张可用</em></li>
        <li><span>积分抵扣</span><em><b>400</b>积分可用</em></li>
        <li><span>运费</span><em><b>1</b>张免邮卡可用</em></li>
        <li><span>总计</span><em><b class="price">￥000</b></em></li>
    </ul>
    <div class="ct_list_action"></div>
</div>
}
<header>
    <div class="head_back" data-back="{{back}}"></div>
    <div class="head_title">{{title}}</div>
</header>
<div class="main">
    @this.helpers.list()
</div>