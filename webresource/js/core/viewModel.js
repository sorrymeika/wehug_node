define(function (require, exports, module) {

    var $ = require('$'),
        util = require('util'),
        Base = require('./base'),
        Event = require('./event');
    var model = require('./model');

    var rfilter = /\s*\|\s*([a-zA-Z_0-9]+)((?:\s*(?:\:|;)\s*\({0,1}\s*([a-zA-Z_0-9\.-]+|'(?:\\'|[^'])*')\){0,1})*)/g;
    var rparams = /\s*\:\s*([a-zA-Z_0-9\.-]+|'(?:\\'|[^'])*')/g;
    var rvalue = /^((-)*\d+|true|false|undefined|null|'(?:\\'|[^'])*')$/;
    var rrepeat = /([a-zA-Z_0-9]+)(?:\s*,(\s*[a-zA-Z_0-9]+)){0,1}\s+in\s+([a-zA-Z_0-9]+(?:\.[a-zA-Z_0-9]+){0,})((?:\s*\|\s*filter\s*\:\s*.+?){0,1})(?:\s*\|\s*orderBy\:(.+)){0,1}(\s|$)/;
    var rbinding = /\b([a-zA-Z_0-9-\.]+)\s*\:\s*([a-zA-Z_0-9]+)((?:\.[a-zA-Z_0-9]+)*)((?:\s*\|\s*[a-zA-Z_0-9]+(?:\s*\:\s*\({0,1}\s*(?:[a-zA-Z_0-9\.-]+|'(?:\\'|[^'])*')\){0,1})*)*)(\s|,|$)/g;
    var revents = /\b([a-zA-Z\s]+)\s*\:\s*([a-zA-Z_0-9]+)((?:\.[a-zA-Z_0-9]+)*)((?:\s*\:\s*(?:[a-zA-Z_0-9\.]+|'(?:\\'|[^'])*'))*|\s*=\s*(?:[a-zA-Z_0-9\.]+|'(?:\\'|[^'])*'))(\s|,|$)/g;
    var rmatch = /\{\{(.+?)\}\}/g;
    var rvar = /(^|[\=\>\<\?\s\:\(\),\%\+\-\*\/\[\]]+)([a-zA-Z_0-9\.-]+|'(?:\\'|[^'])*')/g;

    var isNull = function (str) {
        var arr = str.split('.');
        var result = [];

        for (var i = 0; i < arr.length; i++) {
            result[i] = (i == 0 ? '$data' : result[i - 1]) + '.' + arr[i];
        }
        return '(' + result.join('&&') + '?' + str + ':"")';
    };

    var $el = $('<div>\
    <input sn-model="name" />\
    <div class="{{text}}">name:{{name}}</div>\
    <ol sn-repeat="item,i in data" class="item">\
    <li>item:{{i}},{{item}}</li>\
    </ol>\
    </div>').appendTo($('body').html(''));


    for (var i = 0; i < 10000; i++) {
        // $el.append('<div data-id="' + i + '">t</div>')
    }

    function eachElement(el, fn) {

        var childNodes = el.length ? el : [el];

        for (var i = 0, len = childNodes.length; ;) {
            var child = childNodes[i];
            var nodeType = child.nodeType;
            var nodes;

            fn(child, i, childNodes);

            if (nodeType == 1 && (nodes = child.childNodes) && nodes.length) {
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

    function closestElement(el, fn) {
    }

    function parentElements(el, fn) {
        var parentNode = el.parentNode;
        var result = [];
        while (parentNode) {
            if (fn(parentNode, el)) {
                result.push(parentNode);
            }
            el = parentNode;
            parentNode = parentNode.parentNode;
        }
        return result;
    }

    function setElementAttribute(el, model) {
        if (el.bindings) {
            for (var attr in el.bindings) {
                var val = model.root.fns[el.bindings[attr]](model);
                if (attr == 'textContent')
                    el.textContent = val;
                else
                    el.setAttribute(attr, val);
            }
        }
    }

    var cloneNode = function (el, model) {
        var node = el.cloneNode();
        var len;

        if (el.bindings) {
            setElementAttribute(el, model);
            el.elements[el.elements.length] = node;
        }
        if (el.nodeType == 1 && (len = el.childNodes.length)) {
            for (var i = 0; i < len; i++) {
                node.appendChild(cloneNode(el.childNodes[i]));
            }
        }
        return node;
    }

    function compileExpression(expression, repeat) {
        var code = 'function(model){var $data=$.extend({},model.root.data';

        if (repeat) {
            code += ',{';

            var parent = repeat.parent;
            while (parent) {
                code += parent.alias + ':model.closest("' + parent.collectionName + '^child").data'
            }
            code += repeat.alias + ':model.data}';
        }
        code += ');with($data){return \''
            + expression.replace(/\\/g, '\\\\')
             .replace(/'/g, '\\\'')
             .replace(rmatch, function (match, exp) {
                 return '\'+' + exp.replace(/\\'/, '\'').replace(rvar, function (match, prefix, name) {
                     return prefix + isNull(name);
                 }) + '+\'';
             });

        code += '\';}}';

        return code;
    }

    var Filter = {};

    function Repeat(options) {
        $.extend(this, options);

        var attrs = this.collectionName.split('.');
        var parent = this.parent;
        while (parent) {
            if (parent.alias == attrs[0]) {
                attrs[0] = parent.collectionName;
                this.collectionName = attrs.join('.') + '^child'
                break;
            }
        }
        this.elements = [];

        console.log('collectionName:', this.collectionName);
    }

    Repeat.prototype.update = function () {
    }

    Repeat.prototype.add = function (model) {
        this.elements[this.elements.length] = cloneNode(this.el);
    }


    function ViewModel(template, data) {
        this.data = $.extend({}, data);
        this.fns = [];

        this.scan(template);
    }

    ViewModel.prototype = Object.create(Event);

    ViewModel.prototype.bindAttr = function (node, attr, expression, repeat) {
        var self = this;
        self.root = this;

        if (!rmatch.test(expression)) return;

        var code = compileExpression(expression, repeat, function () {
        });

        (node.bindings || (node.elements = [], node.bindings = {}))[attr] = self.fns.length;
        self.fns.push(code);
    }

    ViewModel.prototype.scan = function (el) {
        var self = this;
        var elements = [];

        eachElement(el, function (child, i, childList) {
            if (child.nodeType == 1) {
                var repeat = child.getAttribute('sn-repeat');
                if (repeat != null) {
                    var match = repeat.match(rrepeat);
                    var replacement = document.createComment('');

                    repeat = new Repeat({
                        parent: childList.repeat,
                        alias: match[1],
                        indexAlias: match[2],
                        collectionName: match[3],
                        filters: match[4],
                        orderBy: match[5],
                        replacement: replacement,
                        el: child
                    });
                    child.parentNode.insertBefore(replacement, child);
                    child.parentNode.removeChild(child);

                } else {
                    repeat = childList.repeat;
                }
                child.childNodes.repeat = repeat;

                for (var j = 0; j < child.attributes.length; j++) {
                    var attr = child.attributes[j].name;
                    var val = child.attributes[j].value;

                    if (attr.indexOf('sn-') != 0) {
                        self.bindAttr(child, attr, val, repeat);
                    }
                }
                if (!repeat && child.bindings) {
                    elements[elements.length] = child;
                }

            } else if (child.nodeType == 3) {
                self.bindAttr(child, 'textContent', child.textContent, childList.repeat);
                if (!childList.repeat && child.bindings) {
                    elements[elements.length] = child;
                }
            }
        });

        console.log('[' + this.fns.join(',') + ']');
        this.fns = eval('[' + this.fns.join(',') + ']');

        for (var i = 0, len = elements.length; i < len; i++) {
            setElementAttribute(elements[i], self);
        }
    }

    var now = Date.now();

    var elements = $el.find('*');

    console.log(Date.now() - now);

    now = Date.now();
    var vm = new ViewModel($el, {
        name: 'tets'
    });

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