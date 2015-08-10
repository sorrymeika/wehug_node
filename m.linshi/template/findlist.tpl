<header>
    <div class="head_back js_back"></div>
    <div sn-binding="html:title" class="head_title"></div>
    <div class="head_share js_share"></div>
</header>
<div class="main">
    <div class="pianolist">
        <div class="pianolist_hd">
        </div>
        <ul class="pianolist_bd js_findlist">
            <li sn-repeat="item in data" sn-binding="data-id:item.ID">
                <img sn-binding="src:item.Pic" />
                <div class="pianoli_con">
                    <h2 sn-binding="html:item.Title"></h2>
                    <h3 sn-binding="html:item.SubTitle"></h3>
                    <p sn-binding="html:item.Content"></p>
                    <div class="pianoli_flag">
                        <i>￥</i>
                        <div class="pianoli_price" sn-binding="html:item.SpecialPrice">
                        </div>
                        <div class="pianoli_info">
                            <span sn-binding="html:item.TeachingAge|concat:'教龄'"></span>
                            <span>一对一学生上门</span>
                            <del sn-binding="html:item.Price|format:'￥{0}起/小时'"></del>
                        </div>
                        <div class="pianoli_praise_rate" sn-binding="html:item.PraiseRate"></div>
                    </div>
                </div>
                <div class="btn_cart"></div>
            </li>
        </ul>
    </div>
</div>