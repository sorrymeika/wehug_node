<header>
    <div class="head_back" sn-binding="data-back:back"></div>
    <div sn-binding="html:title" class="head_title"></div>
</header>
<div class="main">
    <div class="appointment_teacher">
        <img sn-binding="src:teacher.head_photo" />
        <ul>
            <li sn-binding="html:teacher.discipline|format:'科目：{0}'"></li>
            <li sn-binding="html:teacher.teacher_name|format:'教师：{0}老师'"></li>
        </ul>
    </div>
</div>
