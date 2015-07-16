<header>
    <div class="head_back" sn-binding="data-back:back"></div>
    <div sn-binding="html:title" class="head_title"></div>
</header>
<div class="main">
    <div class="member">
        <div class="member_avatars">
            <img sn-binding="src:member.head_photo" />
        </div>
        <ul class="member_info">
            <li>
                <div>昵称</div>
                <div><input sn-binding="value:member.nick_name,readonly:nick_name.readonly" sn-model="nick_name.input" /></div>
                <b sn-binding="class:nick_name.edit,html:nick_name.value" sn-on="click:nick_name.click"></b>
            </li>
            <li class="member_one">
                <div>性别：</div>
                <div>
                    <span class="radio" member="gender" value="男" sn-binding="class:member.sex|case:'男':'checked radio':'radio'">男</span>
                    <span class="radio" member="gender" value="女" sn-binding="class:member.sex|case:'女':'checked radio':'radio'">女</span>
                </div>
            </li>
            <li>
                <div>地址</div>
                <div><input sn-binding="value:member.address,readonly:address.readonly" sn-model="address.input" /></div>
                <b sn-binding="class:address.edit,html:address.value" sn-on="click:address.click"></b>
            </li>
        </ul>
    </div>
</div>
