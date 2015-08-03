<header>
    <div class="head_back" sn-binding="data-back:back"></div>
    <div sn-binding="html:title" class="head_title"></div>
</header>
<div class="main">
    <ul class="quan_list">
        <li class="quan_item" sn-repeat="item in comments" sn-binding="data-id:item.ID">
            <div class="quan_user">
                <img sn-binding="src:item.Avatars" />
                <div class="bd">
                    <h2 sn-binding="html:item.NickName|or:item.Mobile"></h2>
                    <div class="time" sn-binding="html:item.InsertTime|date:'MM-dd hh:ss'"></div>
                </div>
                <div class="ft">
                    <span class="quanli_reply" sn-binding="html:item.Reply|length"></span>
                    <span class="quanli_up" sn-binding="html:item.Up"></span>
                </div>
            </div>
            <div class="quan_con" sn-binding="html:item.Content"></div>
            <div class="quan_item quan_reply" sn-repeat="reply in item.Reply" sn-binding="data-id:item.ID,data-at:reply.NickName|or:reply.Mobile">
                <div class="quan_user">
                    <img sn-binding="src:reply.Avatars" />
                    <div class="bd">
                        <h2 sn-binding="html:reply.NickName|or:reply.Mobile"></h2>
                        <div class="time" sn-binding="html:reply.InsertTime|date:'MM-dd hh:ss'"></div>
                    </div>
                    <div class="ft">
                        <span class="quanli_reply"></span>
                    </div>
                </div>
                <div class="quan_con" sn-binding="html:reply.Content"></div>
            </div>
        </li>
    </ul>
</div>