<header>
    <div class="head_back" sn-binding="data-back:back"></div>
    <div sn-binding="html:title" class="head_title"></div>
</header>
<div class="main teacherwrap">
    <div class="teacher_info">
        <div class="teacher_basic"><img class="head_photo" sn-binding="src:basic_info.head_photo" />
            <div><h1 class="teacher_name" sn-binding="html:basic_info.teacher_name"></h1>
                <div class="teacher_area" sn-binding="html:basic_info.area"></div>
            </div>
            <div><h2 class="discipline" sn-binding="html:basic_info.discipline"></h2>
                <div class="teaching_age" sn-binding="html:basic_info.teaching_age"></div>
            </div>
        </div>
        <ul class="teacher_cert">
            <li class="cert" sn-binding="display:basic_info.certification_flag">身份认证</li>
            <li class="t_cert" sn-binding="display:basic_info.teacher_certification_flag">教师资格认证</li>
            <li class="education" sn-binding="display:basic_info.education_flag">学历认证</li>
        </ul>
        <div class="teacher_honor" sn-binding="html:basic_info.honor"></div>
    </div>
    <ul class="teacher_data">
        <li sn-binding="html:basic_info.class_hours_number|concat:'小时'"></li>
        <li sn-binding="html:basic_info.students_number|concat:'个'"></li>
        <li sn-binding="html:basic_info.praise_rate"></li>
        <li sn-binding="html:basic_info.continue_rate"></li>
    </ul>
    <div class="tabs_nav">
        <ul class="tabs_nav_con">
            <li class="curr">经历</li>
            <li>评价</li>
        </ul>
    </div>
    <div class="tabs_content">
        <div class="tabs_panel teacher_exp curr"><h4>过往经历</h4>
            <dl sn-repeat="item in past_experience">
                <dt sn-binding="html:item.date_area"></dt>
                <dd sn-binding="html:item.content"></dd>
            </dl>
            <h4>教学成果</h4>
            <dl sn-repeat="item in teaching_achievements">
                <dt sn-binding="html:item.date_area"></dt>
                <dd sn-binding="html:item.content"></dd>
            </dl>
        </div>
        <div class="tabs_panel teacher_exp curr">
            <div sn-repeat="item in appraise_list"><h3><b sn-binding="html:item.student_name"></b><span class="class_time" sn-binding="html:item.class_time|format:'课时数（{0}小时）'"></span></h3>
                <ul>
                    <li sn-repeat="item1 in item.list"><h4><text sn-binding="html:item1.type"></text><span sn-binding="html:item1.score|round|concat:'分'"></span></h4>
                    <div sn-binding="html:item1.comments"></div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</div>
<footer class="bottom_bar">
    <b class="btn_large" data-forward="/appointment">免费试听</b>
</footer>
