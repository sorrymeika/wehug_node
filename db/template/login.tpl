<div class="main">
    <h1>{{title}}</h1>
    <ul>
        <li sn-repeat="conn in connections" sn-click="selectConnection">{{conn.user}}@@{{conn.host}}</li>
    </ul>
    <div class="action">
        <b class="button" sn-repeat="button in buttons" sn-click="button.click">
            <em class="{{button.ico}}"></em>{{button.value}}
        </b>
    </div>
</div>
