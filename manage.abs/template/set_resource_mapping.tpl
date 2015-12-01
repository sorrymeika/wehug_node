<div class="main">
    <h1 sn-binding="html:title"></h1>
    <div class="action js_action">
        <b class="button" sn-repeat="button in buttons" sn-on="click:button.click">
            <em sn-binding="class:button.ico"></em><text sn-binding="html:button.value"></text>
        </b>
    </div>
    <div class="js_data" style="padding:10px;word-break:break-all;"></div>
    <div class="action js_action1">
        <b class="button" sn-repeat="button in buttons1" sn-on="click:button.click">
            <em sn-binding="class:button.ico"></em><text sn-binding="html:button.value"></text>
        </b>
    </div>
</div>
