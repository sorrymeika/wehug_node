﻿<div class="main">
    <h1 sn-binding="html:title"></h1>
    <div class="action">
        <b class="button" sn-repeat="button in buttons" sn-on="click:button.click">
            <em sn-binding="class:button.ico"></em><text sn-binding="html:button.value"></text>
        </b>
    </div>
    <div class="js_data"></div>
</div>
