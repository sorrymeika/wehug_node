<header>
    <div sn-binding="class:back"></div>
    <div class="head_search"><input placeholder="输入姓名或手机号搜索老师" sn-model="search" /></div>
    <div class="head_search_btn"><b class="btn_small js_search">搜索</b></div>
</header>
<div class="main">
    <ul class="teacher_list">
        <li class="teacher_item" sn-repeat="item in data" sn-binding="data-id:item.teacher_id">
            <img sn-binding="src:item.head_photo" />
            <div class="tli_info">
                <!--<div class="tli_honor" sn-binding="html:item.honor"></div>-->
                <div class="tli_name" sn-binding="html:item.teacher_name|concat:'—':item.discipline"></div>
            </div>
        </li>
    </ul>
</div>
<div class="search_filters" style="display:none">
    <ul class="filters_list">
        <li sn-repeat="item in filters" sn-binding="html:item.name,data-forward:item.id|format:'/search/q?course_category={0}'"></li>
    </ul>
</div>