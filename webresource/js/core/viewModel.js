define(function (require, exports, module) {

    var $ = require('$'),
        util = require('util'),
        Base = require('./base'),
        Event = require('./event');

    var rfilter = /\s*\|\s*([a-zA-Z_0-9]+)((?:\s*(?:\:|;)\s*\({0,1}\s*([a-zA-Z_0-9\.-]+|'(?:\\'|[^'])*')\){0,1})*)/g;
    var rparams = /\s*\:\s*([a-zA-Z_0-9\.-]+|'(?:\\'|[^'])*')/g;
    var rvalue = /^((-)*\d+|true|false|undefined|null|'(?:\\'|[^'])*')$/;
    var rrepeat = /([a-zA-Z_0-9]+)(?:\s*,(\s*[a-zA-Z_0-9]+)){0,1}\s+in\s+([a-zA-Z_0-9]+(?:\.[a-zA-Z_0-9]+){0,})((?:\s*\|\s*[a-zA-Z_0-9]+(?:\s*\:\s*\({0,1}\s*(?:[a-zA-Z_0-9\.-]+|'(?:\\'|[^'])*')\){0,1})*)*)(\s|$)/g;
    var rbinding = /\b([a-zA-Z_0-9-\.]+)\s*\:\s*([a-zA-Z_0-9]+)((?:\.[a-zA-Z_0-9]+)*)((?:\s*\|\s*[a-zA-Z_0-9]+(?:\s*\:\s*\({0,1}\s*(?:[a-zA-Z_0-9\.-]+|'(?:\\'|[^'])*')\){0,1})*)*)(\s|,|$)/g;
    var revents = /\b([a-zA-Z\s]+)\s*\:\s*([a-zA-Z_0-9]+)((?:\.[a-zA-Z_0-9]+)*)((?:\s*\:\s*(?:[a-zA-Z_0-9\.]+|'(?:\\'|[^'])*'))*|\s*=\s*(?:[a-zA-Z_0-9\.]+|'(?:\\'|[^'])*'))(\s|,|$)/g;
    return;

    var $el = $('<div>\
    <input sn-model="name" />\
    <div>name:{{name}}</div>\
    <ol sn-repeat="item,i in data" class="item">\
    <li>item:{{i}},{{item}}</li>\
    </ol>\
    </div>').appendTo($('body').html(''));

    for (var i = 0; i < 10000; i++) {
        $el.append('<div data-id="' + i + '">t</div>')
    }

    function ViewModel(el) {
        this.scan(el);
    }

    ViewModel.prototype.scan = function (el) {

        var childNodes = el.length ? el : [el];

        for (var i = 0, len = childNodes.length; ;) {
            var child = childNodes[i];
            var nodes = child.childNodes;

            if (child.nodeType == 1) {
                // console.log(child.attributes);
                if (child.attributes['data-id']) {
                }

            } else if (child.nodeType == 3) {
                //console.log(child.textContent);
            }

            if (nodes && nodes.length) {

                if (i + 1 < len) {
                    nodes.prevNodes = childNodes;
                    nodes.prevIndex = i + 1;
                    nodes.prevLength = len;
                }

                childNodes = nodes;
                len = childNodes.length;
                i = 0;

            } else {
                i++;
                if (i == len) {

                    if (childNodes.prevNodes) {
                        i = childNodes.prevIndex;
                        len = childNodes.prevLength;
                        childNodes = childNodes.prevNodes;

                    } else {
                        break;
                    }
                }
            }

        }
    }

    var now = Date.now();

    $el.find('[data-id="1000"]')
    $el.find('[data-id="1000"]')
    console.log(Date.now() - now);

    now = Date.now();
    var vm = new ViewModel($el);

    console.log(Date.now() - now);

    now = Date.now();
    var vm = new ViewModel($el);

    console.log(Date.now() - now);

    now = Date.now();
    var vm = new ViewModel($el);

    console.log(Date.now() - now);

    now = Date.now();
    var vm = new ViewModel($el);

    console.log(Date.now() - now);

    now = Date.now();

    $el.find('[data-id="1000"]')
    $el.find('[data-id="2000"]')
    $el.find('[data-id="3000"]')
    $el.find('[data-id="3000"]')
    $el.find('[data-id="3000"]')
    $el.find('[data-id="3000"]')
    $el.find('[data-id="3000"]');

    $el.find('[data-id="5000"]');
    $el.find('[data-id="5000"]');
    $el.find('[data-id="5000"]');
    $el.find('[data-id="5000"]');

    console.log(Date.now() - now);

    /*
    function testCollectionItem() {

    var $el=$('<div>\
    <input sn-model="name" />\
    <div sn-binding="html:name"></div>\
    <div sn-repeat="item in data" class="item">\
    <input sn-model="item" />\
    <div sn-binding="data:item">测试Collection的Item为非Object：<text sn-binding="html:item"></text></div>\
    <div sn-repeat="item1 in item.children" class="item1">\
    <div sn-binding="html:item|json"></div>\
    <div sn-binding="html:item1|json"></div>\
    <div sn-binding="html:data|json"></div>\
    </div>\
    </div>\
    </div>').appendTo('body');

    now=Date.now();
    var vm=new ViewModel($el);

    var data=[];

    for(var i=0;i<1000;i++) {
    data.push({
    test: "item"+i
    });
    }

    vm.set({
    name: 'asdf',
    data: data
    });

    vm.get('data').get(1).set({
    children: [{
    asdf: 1
    }]
    })

    console.log(Date.now()-now);
    }

    //testCollectionItem();

    function testFilter() {

    var $el=$('<div sn-binding="test:name,title:node.test,tt:node.deep.end">\
    <input sn-model="name" />\
    <div sn-binding="html:name"></div>\
    <div sn-repeat="item in data| filter:name| orderBy:alt:reverse" class="item">\
    <input sn-model="item.alt" />\
    id:<input sn-model="item.id" />\
    <img sn-binding="src:item.picture|lowercase:asdf.cc:\'asdf\'|uppercase,alt:item.alt|uppercase"/>\
    <div sn-binding="data:item.content">测试<text sn-binding="html:item.content"></text>一下</div>\
    <div sn-repeat="item1 in item.children" class="item1">\
    <img sn-binding="src:item.picture,alt:item1.title|uppercase:item.id:name"/>\
    <div sn-binding="data:item1.content">测试1<text sn-binding="html:item1.title"></text>一下1</div>\
    </div>\
    </div>\
    </div>').appendTo('body');

    //new
    now=Date.now();
    var vm=new ViewModel($el);

    var data=[];

    for(var i=0;i<1000;i++) {
    data.push({
    picture: 'xxx',
    alt: 'zzzz'+i,
    content: 'asdf',
    children: [{
    title: 'asdf',
    date: '2000'
    }]
    });
    }

    vm.set({
    reverse: true,
    name: 'asdf',
    data: data,
    asdf: {
    cc: 'as'
    },
    test: [{
    ooo: 's'
    }],
    node: {
    test: 'ccc',
    deep: {
    end: 1
    }
    }
    });
    console.log(Date.now()-now);

    return;
    vm.get('data.0.children.0'.split('.')).set({
    picture: 'a',
    alt: 'b',
    title: 'cctv'
    });

    console.log(vm.get('data').get(0))
    }

    //testFilter();

    function test2() {
    var b={
    a: {
    b: {
    c: {
    d: "end"
    }
    }
    }
    }
    var a="a.b.c.d";

    now=Date.now();
    for(var i=0;i<10000;i++) {
    }
    console.log(Date.now()-now);

    now=Date.now();
    for(var i=0;i<10000;i++) {
    }
    console.log(Date.now()-now);
    }
    */
    exports.ViewModel = ViewModel;
});