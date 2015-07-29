<header>
    <div class="head_back js_back"></div>
    <div sn-binding="html:title" class="head_title"></div>
    <div class="head_share js_share"></div>
</header>
<div class="main">
    <div class="piano">
        <div class="piano_hd">
            <img sn-binding="src:data.Pic1|or:data.Pic" />
            <div class="piano_base">
                <h1 sn-binding="html:data.Title"></h1>
                <h2 sn-binding="html:data.SubTitle"></h2>
                <p sn-binding="html:data.Content"></p>
                <div class="piano_price">
                    <del sn-binding="html:data.Price|format:'￥{0}起/小时'"></del>
                    <i>￥</i>
                    <h3 sn-binding="html:data.SpecialPrice"></h3>
                </div>
            </div>
        </div>
        <div class="piano_bd">
            <h4>01<b>简介</b></h4>
            <div class="piano_con" sn-binding="html:data.Content1|htmlString"></div>
            <h4>02<b>寄语</b></h4>
            <div class="piano_con" sn-binding="html:data.Content2|htmlString"></div>
            <h4>03<b>经历</b></h4>
            <div class="piano_con" sn-binding="html:data.Content3|htmlString"></div>
        </div>
    </div>
</div>
<footer class="piano_ft">
    <div class="btn_large js_buy">立即抢购</div>
</footer>