<header>
    <div class="head_back" sn-binding="data-back:back"></div>
    <div sn-binding="html:title" class="head_title"></div>
</header>
<div class="main scrollview">
    <div class="member">
        <iframe style="top:-999px;left:-999px;position:absolute;display:none;" frameborder="0" width="0" height="0" name="__upload"></iframe>
        <form sn-binding="action:upload" method="post" class="member_avatars" enctype="multipart/form-data">
            <input type="file" name="Avatars" />
            <input type="hidden" name="userId" sn-binding="value:user.ID" />
            <input type="hidden" name="auth" sn-binding="value:user.Auth" />
            <img sn-binding="src:user.Avatars" />
        </form>
        <ul class="member_info">
            <li>
                <div>昵称</div>
                <div><input sn-binding="value:user.NickName,readonly:NickName.readonly" sn-model="NickName.input" /></div>
                <b sn-binding="class:NickName.edit,html:NickName.value" sn-on="click:NickName.click"></b>
            </li>
            <li class="member_one">
                <div>性别：</div>
                <div>
                    <span class="radio" member="gender" value="1" sn-binding="class:user.Gender|equal:1:'checked radio':'radio'">男</span>
                    <span class="radio" member="gender" value="0" sn-binding="class:user.Gender|equal:0:'checked radio':'radio'">女</span>
                </div>
            </li>
            <li>
                <div>地址</div>
                <div><input sn-binding="value:user.Address,readonly:Address.readonly" sn-model="Address.input" /></div>
                <b sn-binding="class:Address.edit,html:Address.value" sn-on="click:Address.click"></b>
            </li>
        </ul>
    </div>
</div>
