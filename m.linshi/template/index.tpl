<header>
    <div class="head_city" sn-binding='html:city.name'></div>
    <div class="head_search"><input placeholder="输入姓名或手机号搜索老师" /></div>
    <div class="head_search_btn"><b class="btn_small js_search">搜索</b></div>
</header>
<div class="main">
    <ul>
        <li sn-repeat="item in data" sn-binding="data-id:item.teacher_id"><img sn-binding="src:item.head_photo" />
            <div sn-binding="html:item.honor"></div>
            <div sn-binding="html:item.teacher_name|concat:'—':item.discipline"></div>
        </li>
    </ul>
</div>
