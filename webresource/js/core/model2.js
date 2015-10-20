define(function (require, exports, module) {
    var $ = require('$'),
        util = require('util'),
        Base = require('./base'),
        Event = require('./event');

    var rfilter = /\s*\|\s*([a-zA-Z_0-9]+)((?:\s*(?:\:|;)\s*\({0,1}\s*([a-zA-Z_0-9\.-]+|'(?:\\'|[^'])*')\){0,1})*)/g;
    var rparams = /\s*\:\s*([a-zA-Z_0-9\.-]+|'(?:\\'|[^'])*')/g;
    var rvalue = /^((-)*\d+|true|false|undefined|null|'(?:\\'|[^'])*')$/;
    var rrepeat = /([a-zA-Z_0-9]+)(?:\s*,(\s*[a-zA-Z_0-9]+)){0,1}\s+in\s+([a-zA-Z_0-9]+(?:\.[a-zA-Z_0-9]+){0,})(?:\s*\|\s*filter\s*\:\s*(.+?)){0,1}(?:\s*\|\s*orderBy\:(.+)){0,1}(\s|$)/;
    var rmatch = /\{\{(.+?)\}\}/g;
    var rvar = /(^|[\=\>\<\?\s\:\(\),\%\+\-\*\/\[\]]+)([a-zA-Z_0-9]+(?:\.[a-zA-Z_0-9]+)*(?![a-zA-Z_0-9]*\()|'(?:\\'|[^'])*')/g;
    var rtemp = /\/(?:\\\/|[^\/])*\/[img]+|"(?:\\"|[^"])*"/g;

    var isNull = function (str) {
        var arr = str.split('.');
        var result = [];

        for (var i = 0; i < arr.length; i++) {
            result[i] = (i == 0 ? '$data' : result[i - 1]) + '.' + arr[i];
        }
        for (var i = 0; i < result.length; i++) {
            result[i] = result[i] + '!=null&&' + result[i] + '!=undefined';
        }
        return '(' + result.join('&&') + '?' + str + ':"")';
    }

    var eachElement = function (el, fn) {

        var childNodes = el.length ? el : [el];

        for (var i = 0, len = childNodes.length; i < len; i++) {
            var child = childNodes[i];

            fn(child, i, childNodes);

            if (child.nodeType == 1 && child.childNodes.length) {
                eachElement(child.childNodes, fn)
            }
        }
    }

    var Filters = {
        contains: function (source, keywords) {
            return source.indexOf(keywords) != -1;
        },
        util: util,
        closestRepeatModel: function (el) {
            for (var parent = el.parentNode; parent != null; parent = parent.parentNode) {
                if (parent.repeat) {
                    return parent.repeat.parentModel.data;
                }
            }
        }
    };

    var Model = function (parent, key, data, repeats) {
        if (parent instanceof Model) {
            this.key = parent.key ? parent.key + '.' + key : key;

        } else if (parent instanceof Collection) {
            this.key = parent.key + '^child';

        } else {
            throw new Error('Model\'s parent mast be Collection or Model');
        }



        this._key = key;
        this.model = {};
        this.parent = parent;
        this.root = parent.root;
        this.data = data;

        if (repeats) {
            for (var j = 0, len = repeats.length; j < len; j++) {
                repeats[j].add(this);
            }
        }

        this.set(data);
    }

    Model.prototype = Object.create(Event);

    Model.prototype.get = function (key) {
        if (typeof key == 'string' && key.indexOf('.') != -1) {
            key = key.split('.');
        }
        if ($.isArray(key)) {
            var model = this;
            for (var i = 0, len = key.length; i < len; i++) {
                if (model instanceof Model)
                    model = model.model[key[i]];
                else if (model instanceof Collection)
                    model = model.models[key[i]];
                else
                    return null;
            }
            return model;
        }
        return this.model[key];
    }

    Model.prototype.cover = function (key, val) {
        return this.set(true, key, val);
    }

    Model.prototype.set = function (cover, key, val) {
        var self = this,
            origin,
            changed,
            attrs,
            model = self.model;

        if (cover !== true)
            val = key, key = cover, cover = false;

        if ($.isPlainObject(key)) {
            attrs = key;
        } else if (typeof val == 'undefined') {
            val = key, key = '';

            if (this.parent instanceof Collection) {
                this.parent.data[this.parent.models.indexOf(this)] = val;
            }
            this.data = val;
            return;

        } else {
            (attrs = {})[key] = val;
        }

        if (cover) {
            for (var attr in this.data) {
                if (attrs[attr] === undefined) {
                    attrs[attr] = null;
                }
            }
        }

        !this.root.init && $.extend(this.data, attrs);

        for (var attr in attrs) {
            origin = model[attr];
            value = attrs[attr];

            if (origin !== value) {

                var keys = attr.split('.');
                if (keys.length > 1) {
                    key = keys.pop();
                    model = this;
                    for (var i = 0, len = keys.length, prev; i < len; i++) {
                        attr = keys[i];
                        prev = model;

                        if (model instanceof Model) {
                            model = model.model[attr];
                            if (!model) {
                                model = prev.model[attr] = new Model(prev, attr, null);
                                prev.data[attr] = model.data;
                            }

                        } else if (model instanceof Collection) {
                            model = model.models[attr];
                            if (!model) {
                                throw new Error('[Collection index is bigger than length!]');
                            }
                        }

                    }
                    model.set(key, value);

                } else if (origin instanceof Model) {
                    value === null || value === undefined ? origin.clear() : origin.set(value);

                } else if (origin instanceof Collection) {
                    if (!$.isArray(value)) {
                        if (value == null) {
                            value = [];
                        } else {
                            throw new Error('[Array to ' + (typeof value) + ' error]不可改变' + attr + '的数据类型');
                        }
                    }
                    origin.set(value);

                } else if ($.isPlainObject(value)) {
                    model[attr] = new Model(this, attr, value);

                } else if ($.isArray(value)) {
                    model[attr] = new Collection(this, attr, value);

                } else {
                    model[attr] = value;

                    if (!this.root.init) {
                        this.trigger('change:' + attr, value);
                        this.root.trigger('sync:' + (this.key ? this.key + '.' + attr : attr).replace(/\./g, '/'), this, attr, value);
                    }
                }
            }
        }

        return self;
    }

    Model.prototype.clear = function () {
        var data = {};
        for (var attr in this.data) {
            data[attr] = null;
        }
        this.set(data);
    }

    Model.prototype.closest = function (key) {
        for (var parent = this.parent; parent != null; parent = parent.parent) {
            if (parent.key == key) {
                return parent;
            }
        }
    }

    Model.prototype.contains = function (model) {
        for (var parent = model.parent; parent != null; parent = parent.parent) {
            if (parent == this) {
                return true;
            }
        }
        return false;
    }

    var Repeat = function (options) {
        $.extend(this, options);

        var self = this;
        var attrs = this.collectionName.split('.');
        var parent = this.parent;

        while (parent) {
            if (parent.alias == attrs[0]) {
                attrs[0] = parent.collectionName + '^child';
                this.collectionName = attrs.join('.');
                this.isChild = true;
                break;
            }
            parent = parent.parent;
        }

        var replacement = document.createComment(this.collectionName);

        replacement.repeat = this;
        this.replacement = replacement;
        this.el.parentNode.insertBefore(replacement, this.el);
        this.el.parentNode.removeChild(this.el);
        this.collectionRepeats = [];

        if (this.filters) {
            var code = this.viewModel.compileExpression('{{' + this.filters + '}}', this, function (e, model) {

                for (var i = 0; i < self.collectionRepeats.length; i++) {
                    var collectionRepeat = self.collectionRepeats[i];

                    if (model.parent == collectionRepeat.collection || model.contains(collectionRepeat.collection)) {
                        collectionRepeat.update();
                    }
                }
            });

            this.filter = this.viewModel.fns.length + this.viewModel._fns.length;

            this.viewModel._fns.push(code);
        }
    }

    var CollectionRepeat = function (collection, repeat, parentModel) {
        var self = this;

        this.collection = collection;
        this.repeat = repeat;
        this.children = [];
        this.parentModel = parentModel;

        repeat.collectionRepeats[repeat.collectionRepeats.length] = this;

        if (!repeat.parent) {
            this.type = 'normal';
            this.replacement = repeat.replacement;

        } else if (repeat.isChild || parentModel) {
            this.type = 'children';

            this.findReplacement(parentModel || collection.parent);

        } else {
            this.type = 'in_other_repeat';

            for (var i = 0; i < repeat.parent.collectionRepeats.length; i++) {
                var parentCollectionRepeat = repeat.parent.collectionRepeats[i];

                parentCollectionRepeat.collection.on('add', function (e, _model) {
                    var child = new CollectionRepeat(collection, repeat, _model);
                    for (var j = 0; j < collection.models.length; j++) {
                        child.add(collection.models[j]);
                    }
                    self.children.push(child);
                    child.update();

                }).each(function (_model) {
                    self.children.push(new CollectionRepeat(collection, repeat, _model));
                });
                parentCollectionRepeat.children.push(this);
            }
        }

        this.el = this.cloneNode(repeat.el);
        this.elements = [];
    }

    CollectionRepeat.prototype.findReplacement = function (model) {
        for (var parent = model; parent != null && parent != model.root; parent = parent.parent) {
            if (parent instanceof Model && parent.replacement) {
                for (var i = 0; i < parent.replacement.length; i++) {
                    if (parent.replacement[i].repeat == this.repeat) {
                        this.replacement = parent.replacement[i];
                        break;
                    }
                }
            }
        }
    }

    CollectionRepeat.prototype.update = function () {
        if (this.type == 'in_other_repeat') {
            for (var i = 0, len = this.children.length; i < len; i++) {
                this.children[i].update();
            }
            return;
        }

        var fragment = document.createDocumentFragment();
        var index = 0;
        var list = this.elements;
        var repeat = this.repeat;
        var orderBy = repeat.orderBy;

        if (orderBy) {
            list.sort(function (a, b) {
                a = a.model.data[orderBy];
                b = b.model.data[orderBy];
                return a > b ? 1 : a < b ? -1 : 0;
            });
        }

        for (var i = 0, len = list.length; i < len; i++) {
            var item = list[i];
            if (repeat.filter === undefined || this.collection.root.fns[repeat.filter](Filters, item.model)) {
                fragment.appendChild(item);
                item.setAttribute('sn-index', index);
                if (repeat.indexAlias) {
                    item.setAttribute('sn-index-alias', repeat.indexAlias);

                    this.collection.root.trigger('sync:' + repeat.collectionName + '/' + repeat.alias + '/' + repeat.indexAlias, item.model);
                }
                index++;

            } else if (item.parentNode) {
                item.parentNode.removeChild(item);
            }
        }

        this.replacement.parentNode.insertBefore(fragment, this.replacement);
    }

    CollectionRepeat.prototype.cloneNode = function (el, model, parentNode) {
        var node = el.cloneNode(false);
        var len;

        if (el == this.el) {
            node.repeat = this;
            node.model = model;
        }

        if (parentNode) parentNode.appendChild(node);

        if (el.nodeType == 8 && el.repeat) {
            node.repeat = el.repeat;
            if (model) {
                (model.replacement || (model.replacement = [])).push(node);
            }

        } else {
            if (el.bindings) {
                node.bindings = el.bindings;

                if (model) {
                    node.model = model;
                    el._origin._elements.push(node);
                    model.root.setElementAttribute(node);
                } else {
                    node._origin = el;
                }
            }

            if (el.nodeType == 1 && (len = el.childNodes.length)) {
                for (var i = 0; i < len; i++) {
                    this.cloneNode(el.childNodes[i], model, node);
                }
            }
        }
        return node;
    }

    CollectionRepeat.prototype.each = function (fn) {
        for (var i = 0; i < this.children.length; i++) {
            fn.call(this, this.children[i]);
        }
        return this;
    }

    CollectionRepeat.prototype.remove = function (start, count) {
        if (this.type == 'in_other_repeat') {
            for (var i = 0, len = this.children.length; i < len; i++) {
                this.children[i].remove(start, count);
            }
        } else {
            this.elements.splice(start, count || 1).forEach(function (el) {
                $(el).remove();
            });
        }
    }

    CollectionRepeat.prototype.add = function (model) {
        if (this.type == 'in_other_repeat') {
            for (var i = 0, len = this.children.length; i < len; i++) {
                this.children[i].add(model);
            }

        } else
            this.elements[this.elements.length] = this.cloneNode(this.el, model);
    }

    CollectionRepeat.prototype.clear = function () {
        if (this.type == 'in_other_repeat') {
            for (var i = 0, len = this.children.length; i < len; i++) {
                this.children[i].clear();
            }

        } else {
            for (var i = this.elements.length - 1; i >= 0; i--) {
                this.elements[i].parentNode.removeChild(this.elements[i]);
            }
            this.elements.length = 0;
        }
    }

    var Collection = function (parent, attr, data) {
        var repeats;

        this.models = [];

        this.parent = parent;
        this.key = parent.key ? (parent.key + "." + attr) : attr;
        this._key = attr;

        this.root = parent.root;
        this.repeats = [];

        repeats = parent.root.repeats[this.key];
        if (repeats) {
            for (var i = 0; i < repeats.length; i++) {
                this.repeats[this.repeats.length] = new CollectionRepeat(this, repeats[i]);
            }
        }

        this.data = [];
        this.add(data);
        this.data = data;
    }

    Collection.prototype = Object.create(Event);

    Collection.prototype.each = function (fn) {
        for (var i = 0; i < this.models.length; i++) {
            fn.call(this, this.models[i]);
        }
        return this;
    }

    Collection.prototype.add = function (data) {
        var model;
        var length;

        if (!$.isArray(data)) {
            data = [data];
        }

        for (var i = 0, dataLen = data.length; i < dataLen; i++) {
            var dataItem = data[i];
            length = this.data.length;
            model = new Model(this, length, dataItem, this.repeats);

            this.models[length] = model;
            this.data[length] = dataItem;

            this.trigger('add', model);
        }

        for (var i = 0, len = this.repeats.length; i < len; i++) {
            this.repeats[i].update();
        }
        var key = this.key.replace(/\./g, '/');

        this.root.trigger('sync:' + key, this.parent, this._key, this.data)
            .trigger('sync:' + key + '/length', this.parent, this._key, this.data);
    }

    Collection.prototype.remove = function (start, count) {
        this.models.splice(start, count || 1);
        this.data.splice(start, count || 1);

        for (var i = 0, len = this.repeats.length; i < len; i++) {
            this.repeats[i].remove(start, count);
        }
    }

    Collection.prototype.clear = function (data) {
        this.models.length = this.data.length = 0;
        for (var i = 0, len = this.repeats.length; i < len; i++) {
            this.repeats[i].clear();
        }
    }

    Collection.prototype.set = function (data) {
        if (data.length == 0) {
            this.clear();
        } else {
            console.log(data.length, this.data.length);

            if (data.length < this.data.length) {
                this.remove(data.length, this.data.length - data.length)
            }
            var i = 0;
            this.each(function (model) {
                model.set(true, data[i]);
                i++;
            });
            for (; i < data.length; i++) {
                this.add(data[i]);
            }
        }
        return this;
    }

    Collection.prototype.get = function (i) {
        return this.models[i];
    }

    var snEvents = ['tap', 'click', 'change', 'focus', 'blur'];

    var ViewModel = function (template, data) {
        this.data = $.extend(true, {}, data);
        this.model = {};
        this.repeats = {};
        this._fns = [];
        this.fns = [];

        this.scan(template);
        this.init = true;
        this.set(data);
        this.init = false;
    }

    ViewModel.prototype = Object.create(Model.prototype);

    ViewModel.prototype.key = '';

    ViewModel.prototype.compileExpression = function (expression, repeat, listen) {
        var self = this;
        var code = 'function(Filters,model,el){var $el=$(el);var $data=$.extend({},Filters,model.root.data';

        if (repeat) {
            code += ',{';
            for (var parent = repeat.parent, current = repeat; parent != null; current = parent, parent = parent.parent) {
                code += parent.alias + ':' + (current.isChild ? 'model.closest(\'' + parent.collectionName + '^child\').data' : 'Filters.closestRepeatModel(el,"' + parent.alias + '")') + ',';

                if (parent.indexAlias) {
                    code += parent.indexAlias + ':$el.closest(\'[sn-index-alias="' + parent.indexAlias + '"]\').attr("sn-index"),';
                }
            }
            code += repeat.alias + ':model.data';

            if (repeat.indexAlias) {
                code += ',' + repeat.indexAlias + ':$el.closest(\'[sn-index-alias="' + repeat.indexAlias + '"]\').attr("sn-index")';
            }
            code += '}';
        }

        var replacement = [];

        code += ');with($data){return \''
            + expression.replace(rtemp, function (match) {
                replacement[replacement.length] = match;
                return '``' + (replacement.length - 1) + '~~';
            })
            .replace(/\\/g, '\\\\')
            .replace(/'/g, '\\\'')
            .replace(rmatch, function (match, exp) {
                return '\'+(' + exp.replace(/\\\\/g, '\\').replace(/\\'/g, '\'').replace(rvar, function (match, prefix, name) {
                    var attrs = name.split('.');
                    var alias = attrs[0];

                    if (alias == 'Math' || alias == '$' || rvalue.test(name) || !alias || Filters[alias]) {
                        return prefix + name;
                    }

                    var indexAlias;

                    if (repeat) {
                        if (alias == repeat.alias) {
                            attrs[0] = repeat.collectionName + '^child';

                        } else if (alias == repeat.indexAlias) {
                            indexAlias = repeat;
                        } else {
                            for (var parent = repeat.parent; parent != null; parent = parent.parent) {
                                if (parent.alias == alias) {
                                    attrs[0] = parent.collectionName + '^child';

                                } else if (alias == parent.indexAlias) {
                                    indexAlias = parent;
                                }
                            }
                        }
                    }

                    if (!indexAlias) {
                        self.on('sync:' + attrs.join('/'), listen);
                    } else {
                        self.on('sync:' + indexAlias.collectionName + '/' + indexAlias.alias + '/' + indexAlias.indexAlias, listen);
                    }

                    return prefix + isNull(name);
                }) + ')+\'';
            })
            .replace(/``(\d+)~~/g, function (match, i) {
                return replacement[i];
            });

        code += '\';}}';

        return code.replace('return \'\'+', 'return ').replace(/\+\'\'/g, '');
    };

    ViewModel.prototype.setElementAttribute = function (el, attr) {
        var self = this;
        if (el.bindings) {
            var attrs = attr ? [attr] : el.bindings;
            for (var attr in el.bindings) {
                var val = self.fns[el.bindings[attr]](Filters, el.model || self, el);

                if (attr == 'textContent') {
                    if (el.textContent != val) {
                        el.textContent = val;
                    }

                } else if (attr == 'value' && (el.tagName == 'INPUT' || el.tagName == 'SELECT' || el.tagName == 'TEXTAREA')) {
                    if (el.value != val) {
                        el.value = val;
                    }

                } else if (attr == 'html' || attr == 'sn-html') {
                    el.innerHTML = val;

                } else if (attr == 'display' || attr == 'sn-display') {
                    el.style.display = util.isFalse(val) ? 'none' : val == 'block' || val == 'inline' || val == 'inline-block' ? val : '';

                } else if (el.getAttribute(attr) != val) {
                    el.setAttribute(attr, val);
                }
            }
        }
    }

    ViewModel.prototype.bindAttr = function (node, attr, expression, repeat) {
        var self = this;
        self.root = this;

        if (!rmatch.test(expression)) return;

        var listen = function (e, model) {

            if (!repeat) {
                self.setElementAttribute(node, attr);

            } else {
                for (var i = 0; i < node._elements.length; i++) {
                    var el = node._elements[i];
                    if (model == model.root || el.model == model || model.contains(el.model)) {
                        self.setElementAttribute(el, attr);
                    }
                }
            }
        };
        (node.bindings || (node._elements = [], node.bindings = {}))[attr] = self.fns.length + self._fns.length;

        var code = this.compileExpression(expression, repeat, listen);

        self._fns.push(code);
    }


    ViewModel.prototype.getModel = function (el, name, callback) {
        var attrs = name.split('.');
        var alias = attrs[0];
        var closestModel;
        var model;
        var modelName;

        for (var parent = el; parent != null && parent != document.body; parent = parent.parent) {
            if (parent.model && !closestModel) {
                closestModel = parent.model;
            }
            if (parent.repeat && (parent.repeat.repeat.alias == alias)) {
                modelName = parent.repeat.repeat.collectionName + '^child';
                model = parent.model;
                attrs.shift();
                break;
            }
        }

        if (!model) {
            model = this;
        }

        callback && callback(model, attrs.join('.'), closestModel);

        return model;
    }

    ViewModel.prototype.scan = function (el) {
        var self = this;
        var elements = [];

        var $el = $(el).on('input change', '[sn-model]', function (e) {
            if (e._stopModelEvent == true) return;
            var target = e.currentTarget;
            var name = target.getAttribute('sn-model');

            self.getModel(target, name, function (model, attr) {
                model.set(attr, target.value);
            });
            e._stopModelEvent = true;
        });

        for (var i = 0; i < snEvents.length; i++) {
            $el.on(snEvents[i], '[sn-' + snEvents[i] + ']', function (e) {
                if (e._stopModelEvent == true) return;
                var target = e.currentTarget;
                var name = target.getAttribute('sn-' + e.type);

                self.getModel(target, name, function (model, attr, currentModel) {
                    e.model = currentModel;
                    model.get(attr).call(model, e);
                });
                e._stopModelEvent = true;
            });
        }


        eachElement(el, function (child, i, childList) {
            if (child.nodeType == 1) {
                var repeat = child.getAttribute('sn-repeat');
                if (repeat != null) {
                    var match = repeat.match(rrepeat);
                    repeat = new Repeat({
                        viewModel: self,
                        parent: childList.repeat,
                        alias: match[1],
                        indexAlias: match[2],
                        collectionName: match[3],
                        filters: match[4],
                        orderBy: match[5],
                        el: child
                    });
                    (self.repeats[repeat.collectionName] || (self.repeats[repeat.collectionName] = [])).push(repeat);

                } else {
                    repeat = childList.repeat;
                }
                repeat && (child.childNodes.repeat = repeat);


                for (var j = 0; j < child.attributes.length; j++) {
                    var attr = child.attributes[j].name;
                    var val = child.attributes[j].value;

                    if (attr == 'sn-error') {
                        attr = 'onerror'
                    } else if (attr == 'sn-src') {
                        attr = 'src'
                    }
                    if (attr == 'sn-display' || attr.indexOf('sn-') != 0) {
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

        [].push.apply(this.fns, window.eval('[' + this._fns.join(',') + ']'));
        this._fns.length = 0;

        for (var i = 0, len = elements.length; i < len; i++) {
            self.setElementAttribute(elements[i]);
        }
    }


    /*
    var $el = $('<div>\
    <input sn-model="name" sn-tap="tap" value="{{test.asdf+\'asdf\'}}"/>\
    <div class="{{text}}" style="{{test.asdf}}">name:{{name}}</div>\
    <ol sn-repeat="item,i in data" class="item">\
    <li>item:{{i}},{{item.value}},{{item.test}}<br><span sn-repeat="child,j in item.children|filter:child.value==name">{{item.value}}.{{child.value}}/</span><br></li>\
    </ol>\
    </div>').appendTo($('body').html(''));


    for (var i = 0; i < 10000; i++) {
        // $el.append('<div data-id="' + i + '">t</div>')
    }

    var now = Date.now();

    var elements = $el.find('*');

    console.log(Date.now() - now);

    now = Date.now();
    var vm = new ViewModel($el, {
        name: '1',
        tap: function () {
            console.log(this)
        },
        test: {
            asdf: 'color:#c00'
        },
        data: [{
            test: 1,
            value: 1,
            children: [{
                value: 1
            }, {
                value: 2
            }]
        }, {
            test: 'ttt',
            value: 2,
            children: [{
                value: 3
            }, {
                value: 4
            }]
        }]
    });

    vm.set({
        name: '222'
    }).set('data.0.test', '333')

    console.log(Date.now() - now);
    */
    exports.ViewModel = ViewModel;
    exports.Filters = Filters;

});