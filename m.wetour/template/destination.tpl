<header>
    <div class="head_back" sn-binding="data-back:back"></div>
    <div sn-binding="html:title" class="head_title"></div>
</header>
<div class="main destwrap">
    <div class="destimg">
        <img sn-binding="src:data.MiddlePic" />
        <div class="destfav" sn-binding="html:data.Favorite"></div>
        <h1 sn-binding="html:data.Name"></h1>
    </div>
    <div class="destinfo">
        <h2>详情</h2>
        <div class="destcontent" sn-binding="html:data.Content"></div>
    </div>
    <div class="destinfo">
        <h2>评论</h2>
        <div class="destcontent"></div>
    </div>
</div>
