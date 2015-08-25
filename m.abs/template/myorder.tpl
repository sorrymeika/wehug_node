<header>
    <div class="head_back" sn-binding="data-back:back"></div>
    <div sn-binding="html:title" class="head_title"></div>
</header>
<ul class="myorder_hd" sn-binding="display:data|eval:'$0&&$0.length||($1!=0)':'currentType'">
    <li class="curr" sn-on="tap:select:0">全部</li>
    <li sn-on="tap:select:1">待付款</li>
    <li sn-on="tap:select:2">待发货</li>
    <li sn-on="tap:select:3">配送中</li>
    <li sn-on="tap:select:4">已完成</li>
</ul>
<div class="main myorder">
    <ul class="con" sn-binding="display:data">
        <li sn-repeat="item in data" sn-binding="class:item.CNL_CLT_ID|format:'type{0}'">
            <div class="hd"><b class="from" sn-binding="html:item.CNL_DESC"></b><span class="status" sn-binding="html:item.PUS_DESC"></span></div>
            <div class="info">
                <span sn-binding="html:item.PUR_CODE|format:'订单号：{0}'"></span>
                <span sn-binding="html:item.PUR_DT|date"></span>
            </div>
            <div class="bd" sn-repeat="prd in item.Children" sn-on="tap:openPrd:prd">
                <img sn-binding="src:prd.WPP_LIST_PIC|or:'images/default.jpg'" src="images/default.jpg" onerror="this.src='images/default.jpg'" />
                <div class="con">
                    <h2 sn-binding="html:prd.PRD_NAME"></h2>
                    <h3>颜色：<span sn-binding="html:prd.PRD_COLOR"></span></h3>
                    <h4>尺寸：<span sn-binding="html:prd.PRD_SPEC"></span></h4>
                </div>
                <p class="priceinfo">
                    <span class="price" sn-binding="html:prd.PRD_MEMBER_PRICE|currency:'￥'"></span>
                    <span class="qty" sn-binding="html:prd.LPK_QTY|format:'x{0}'"></span>
                </p>
            </div>
            <div class="ft">
                总价：<span sn-binding="html:item.PUR_AMOUNT|currency:'￥'"></span>
                <b class="btn_sml" sn-binding="display:item.XPU_EXPRESS_CODE|equal:null|not" sn-on="tap:showExpress:item">查看物流</b>
            </div>
            <div class="express" sn-binding="display:item.showExpress" style="display:none">
                <div class="express_con">
                    <p>物流公司：<span sn-binding="html:item.EXP_NAME"></span></p>
                    <p>运单号码：<span sn-binding="html:item.XPU_EXPRESS_CODE"></span></p>
                    <p>如需跟踪物流详情 请复制运单号前往<span sn-binding="html:item.EXP_NAME"></span>官方网站查询</p>
                </div>
            </div>
        </li>
    </ul>
    <div class="my_nodata" sn-binding="display:data|eval:'$1==0&&(!$0||!$0.length)':currentType" style="display:none">
        <div class="icon"></div>
        <div class="text">您目前还没有购物记录哦</div>
        <div class="btn" sn-on="tap:open">去逛逛吧</div>
    </div>
    <div class="my_nodata" sn-binding="display:data|eval:'$1!=0&&(!$0||!$0.length)':currentType" style="display:none">
        <div class="icon"></div>
        <div class="text">您还没有相关的订单</div>
        <div class="btn" sn-on="tap:open">去逛逛吧</div>
    </div>
</div>
<div class="open_msg" style="display:none">
    <div class="msg_bd msg_alert">
        这款产品已经售罄喽
        <div class="btn_go">随便逛逛</div>
    </div>
</div>