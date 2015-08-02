<header>
    <div class="head_back" sn-binding="data-back:back"></div>
    <div sn-binding="html:title" class="head_title"></div>
</header>
<div class="main destwrap actwrap">
    <div class="destimg">
        <img sn-binding="src:data.Pic" />
        <div class="destfav" sn-binding="html:data.Favorite"></div>
        <h1 sn-binding="html:data.Name"></h1>
    </div>
    <div class="activity_info">
        <div class="act_signup"><b class="act_signup_num" sn-binding="html:data.SignUpQty"></b>报名</div>
        <div class="act_time"><text sn-binding="html:data.StartTime|date:'yyyy年MM月dd日 hh:mm'"></text>~<text sn-binding="html:data.FinishTime|date:'yyyy年MM月dd日 hh:mm'"></text></div>
        <div class="act_address" sn-binding="html:data.Address"></div>
    </div>
    <div class="destinfo">
        <h2>详情</h2>
        <div class="destcontent" sn-binding="html:data.Content"></div>
    </div>
    <div class="destinfo">
        <h2><span class="destcomment js_comment">发表评论</span>评论</h2>
        <div class="destcontent">
            <ul class="quan_list">
                <li class="quan_item" sn-repeat="item in comments" sn-binding="data-id:item.ID">
                    <div class="quan_user">
                        <img sn-binding="src:item.Avatars" />
                        <div class="bd">
                            <h2 sn-binding="html:item.NickName|or:item.Mobile"></h2>
                            <div class="time" sn-binding="html:item.CommentTime|date:'MM-dd hh:ss'"></div>
                        </div>
                    </div>
                    <div class="quan_con" sn-binding="html:item.Content"></div>
                </li>
            </ul>
        </div>
    </div>
</div>
<footer class="signup_bar">
    <b class="btn_signup js_submit">我要报名</b>
</footer>
