<div sn-repeat="item in data">
    <div>{{item.name}}</div>
    <div sn-repeat="item1 in data1">
        <div>{{item1.name}}-{{item.name}}</div>
    </div>
</div>