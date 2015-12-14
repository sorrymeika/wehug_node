define(function (require, exports, module) {
    var $ = require('$'),
        util = require('util'),
        Base = require('./base'),
        Event = require('./event'),
        ComponentBase = require('./component');

    var rfilter = /\s*\|\s*([a-zA-Z_0-9]+)((?:\s*(?:\:|;)\s*\({0,1}\s*([a-zA-Z_0-9\.-]+|'(?:\\'|[^'])*')\){0,1})*)/g;
    var rparams = /\s*\:\s*([a-zA-Z_0-9\.-]+|'(?:\\'|[^'])*')/g;
    var rvalue = /^((-)*\d+|true|false|undefined|null|'(?:\\'|[^'])*')$/;
    var rrepeat = /([a-zA-Z_0-9]+)(?:\s*,(\s*[a-zA-Z_0-9]+)){0,1}\s+in\s+([a-zA-Z_0-9]+(?:\.[a-zA-Z_0-9]+){0,})(?:\s*\|\s*filter\s*\:\s*(.+?)){0,1}(?:\s*\|\s*orderBy\:(.+)){0,1}(\s|$)/;
    var rmatch = /\{\{(.+?)\}\}/g;
    var rvar = /'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/[img]*(?=[\)|\.|,])|\/\/.*|(^|[\!\=\>\<\?\s\:\(\),\%&\|\+\-\*\/\[\]]+)([\$a-zA-Z_0-9]+(?:\.[a-zA-Z_0-9]+)*(?![a-zA-Z_0-9]*\())/g;
    var rset = /([a-zA-Z_0-9]+(?:\.[a-zA-Z_0-9]+)*)\s*=\s*((?:\((?:'(?:\\'|[^'])*'|[^\)])+\)|'(?:\\'|[^'])*'|[^;])+?)(?=\;|\,|$)/g;
    var rthis = /\b(this\.[\.\w]+\()((?:'(?:\\'|[^'])*'|[^\)])*)\)/g;

    var isNull = function (str) {
        var arr = str.split('.');
        var result = [];
        var code = '';

        for (var i = 0; i < arr.length; i++) {
            result[i] = (i == 0 ? '$data' : result[i - 1]) + '.' + arr[i];
        }
        for (var i = 0; i < result.length; i++) {
            code += (i ? '&&' : '') + result[i] + '!==null&&' + result[i] + '!==undefined';
        }
        return '((' + code + ')?' + str + ':"")';
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
    var State;
    var Filters = {
        contains: function (source, keywords) {
            return source.indexOf(keywords) != -1;
        },
        like: function (source, keywords) {
            return source.indexOf(keywords) != -1 || keywords.indexOf(source) != -1;
        },
        util: util,
        closestModelData: function (el, alias) {
            for (el = el.parentNode; el != null; el = el.parentNode) {
                if (el.repeat) {
                    if ((!alias || el.repeat.repeat.alias == alias)) {
                        return el.model.data;
                    }
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

        this.type = $.isPlainObject(data) ? 'object' : 'value';
        parent.data[key] = this.data = this.type == 'object' ? $.extend({}, data) : data;

        this._key = key;
        this.model = {};
        this.parent = parent;
        this.root = parent.root;

        if (repeats) {
            for (var j = 0, len = repeats.length; j < len; j++) {
                repeats[j].add(this);
            }
        }

        this.set(data);
    }

    var ModelProto = {
        getModel: function (key) {
            if (typeof key == 'string' && key.indexOf('.') != -1) {
                key = key.split('.');
            }
            if ($.isArray(key)) {
                var model = this;
                if (key[0] == 'this') {
                    for (var i = 1, len = key.length; i < len; i++) {
                        if (!(model = model[key[i]]))
                            return null;
                    }
                } else {
                    for (var i = 0, len = key.length; i < len; i++) {
                        if (model instanceof Model)
                            model = model.model[key[i]];
                        else if (model instanceof Collection)
                            model = model.models[key[i]];
                        else
                            return null;
                    }
                }
                return model;
            }
            return key == 'this' ? this : key == '' ? this.data : this.model[key];
        },
        get: function (key) {
            var model = this.getModel(key);
            return (model instanceof Model || model instanceof Collection) ? model.data : model;
        },
        cover: function (key, val) {
            return this.set(true, key, val);
        },

        set: function (cover, key, val) {
            var self = this,
                origin,
                changed,
                attrs,
                model = self.model,
                parent;

            if (cover !== true)
                val = key, key = cover, cover = false;

            if ($.isPlainObject(key)) {
                attrs = key;
            } else if (key === null) {
                !cover && (cover = true);
                attrs = {};

            } else if (typeof val == 'undefined') {
                val = key, key = '', parent = this.parent;

                parent.data[(parent instanceof Collection) ? parent.models.indexOf(this) : this._key] = val;

                this.data = val;

                return this._triggerChangeEvent(this.key);

            } else {
                (attrs = {})[key] = val;
            }
            if (!$.isPlainObject(this.data)) this.data = {};

            if (cover) {
                for (var attr in this.data) {
                    if (attrs[attr] === undefined) {
                        attrs[attr] = null;
                    }
                }
            }

            $.extend(true, this.data, attrs);

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

                        this._triggerChangeEvent(this.key ? this.key + '/' + attr : attr, origin, value);
                    }
                }
            }

            this._triggerChangeEvent(this.key);

            return self;
        },

        _triggerChangeEvent: function (eventName, origin, value) {
            if (!this.root.init) {
                this.root.trigger('change' + (eventName ? ":" + eventName : '').replace(/\./g, '/'), this, origin, value);
            }
            return this;
        },

        clear: function () {

            var data = {};
            for (var attr in this.data) {
                data[attr] = null;
            }
            this.set(data);
        },
        closest: function (key) {
            for (var parent = this.parent; parent != null; parent = parent.parent) {
                if (parent.key == key) {
                    return parent;
                }
            }
        },
        contains: function (model, excollection) {
            for (model = model.parent; model != null; model = model.parent) {
                if (model == this) {
                    return true;
                } else if (excollection && model instanceof Collection)
                    return false;
            }
            return false;
        },

        _eachEl: function (el, fn, ret) {
            var val;
            for (; el != null; el = el.parentNode) {

                if ((val = fn(el)) !== undefined) return val;

                if (el.nodeType == 1 && el.getAttribute("sn-viewmodel"))
                    break;
            }
            return ret === undefined ? this : ret;
        },

        isRelativeToEl: function (el) {
            var isUnderRoot = true;
            var self = this;
            for (var model = this; model != null; model = model.parent) {
                if (model instanceof Collection) {
                    isUnderRoot = false;
                    break;
                }
            }
            if (isUnderRoot) {
                return true;
            }

            return self._eachEl(el, function (el) {
                if (el.model && (el.model == self || el.model.contains(self, true)))
                    return true;
            }, false);
        }
    }
    ModelProto.reset = ModelProto.clear;

    Model.prototype = $.extend(Object.create(Event), ModelProto);

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
            var code = this.viewModel._compile('{{' + this.filters + '}}', this, function (e, model) {

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

        repeat.collectionRepeats.push(this);

        if (!repeat.parent) {
            this.type = 'normal';
            this.replacement = repeat.replacement;

        } else if (repeat.isChild || parentModel) {
            this.type = 'children';
            this.replacement = this.findReplacement(parentModel || collection.parent);

        } else {
            this.type = 'inset';

            for (var i = 0; i < repeat.parent.collectionRepeats.length; i++) {
                var parentCollectionRepeat = repeat.parent.collectionRepeats[i];

                parentCollectionRepeat.collection.on('add', function (e, model) {
                    var child = new CollectionRepeat(collection, repeat, model);
                    for (var j = 0; j < collection.models.length; j++) {
                        child.add(collection.models[j]);
                    }
                    self.children.push(child);
                    child.update();

                }).on('remove', function (e, models) {
                    for (var i = self.children.length - 1; i >= 0; i--) {
                        var model = self.children[i].parentModel;
                        for (var j = models.length - 1; j >= 0; j--) {
                            if (model == models[j]) {
                                self.children.splice(i, 1);
                                break;
                            }
                        }
                    }

                }).each(function (model) {
                    self.children.push(new CollectionRepeat(collection, repeat, model));
                });
                parentCollectionRepeat.children.push(this);
            }
        }

        this.el = this.cloneNode(repeat.el);
        this.elements = [];
    }


    CollectionRepeat.prototype = {
        findReplacement: function (model) {
            for (; model != null && model != model.root; model = model.parent) {
                if (model instanceof Model && model.replacement) {
                    for (var i = 0; i < model.replacement.length; i++) {
                        if (model.replacement[i].repeat == this.repeat) {
                            return model.replacement[i];
                        }
                    }
                }
            }
        },

        _removeEl: function (el) {
            eachElement($(el).remove(), function (child, i, childList) {
                if (child._origin) {
                    var elements = child._origin._elements;
                    for (var i = elements.length - 1; i >= 0; i--) {
                        if (elements[i] == child) {
                            elements.splice(i, 1);
                            break;
                        }
                    }

                } else if (child.nodeType == 8 && child.repeat && child._replacement) {
                    for (var i = child._replacement.length - 1; i >= 0; i--) {
                        if (child._replacement[i] == child) {
                            child._replacement.splice(i, 1);
                            break;
                        }
                    }
                }
            });
        },

        update: function () {
            if (this.type == 'inset') {
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
            var root = this.collection.root;

            if (orderBy) {
                list.sort(function (a, b) {
                    a = a.model.data[orderBy];
                    b = b.model.data[orderBy];
                    return a > b ? 1 : a < b ? -1 : 0;
                });
            }

            for (var i = 0, len = list.length; i < len; i++) {
                var item = list[i];
                if (repeat.filter === undefined || root.fns[repeat.filter].call(root, Filters, item.model, this.replacement)) {
                    fragment.appendChild(item);
                    item.setAttribute('sn-index', index);
                    if (repeat.indexAlias) {
                        item.setAttribute('sn-index-alias', repeat.indexAlias);

                        root._triggerChangeEvent(repeat.collectionName + '/' + repeat.alias + '/' + repeat.indexAlias, item.model);
                    }
                    index++;

                } else if (item.parentNode) {
                    item.parentNode.removeChild(item);
                }
            }

            this.replacement.parentNode.insertBefore(fragment, this.replacement);
        },
        cloneNode: function (el, model, parentNode) {
            var node = el.cloneNode(false);
            var len;

            if (el == this.el) {
                node.repeat = this;
                node.model = model;
            }

            if (parentNode) parentNode.appendChild(node);

            //如果是给repeat占位的CommentElement，则存放到相关model的replacement中以备替换
            if (el.nodeType == 8 && el.repeat) {
                node.repeat = el.repeat;
                if (model) {
                    (model.replacement || (model.replacement = [])).push(node);
                    node._replacement = model.replacement;
                }

            } else {
                if (el.bindings) {
                    node.bindings = el.bindings;

                    if (model) {
                        node._origin = el._origin;
                        el._origin._elements.push(node);
                        model.root._setElAttr(node);
                    } else {
                        //CollectionRepeat实例化时cloneNode执行
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
        },
        do: function (fn) {
            if (this.type == 'inset') {
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].do(fn);
                }
            } else {
                fn.call(this);
            }
            return this;
        },
        each: function (fn, callback, reverse) {
            if (typeof callback !== 'function') reverse = callback, callback = null;
            return this.do(function () {
                for (var len = this.elements.length - 1, i = len; i >= 0; i--) {
                    var index = reverse ? i : (len - i);
                    if (fn.call(this, index, this.elements[index]) === false) {
                        break;
                    }
                }
                callback && callback.call(this);
            });
        },
        remove: function (start, count) {
            return this.do(function (i, el) {
                if (typeof start == 'function') {
                    for (var i = this.elements.length - 1; i >= 0; i--) {
                        var el = this.elements[i];
                        if (start(el, i)) {
                            this.elements.splice(i, 1)
                            this._removeEl(el);
                        }
                    }
                } else {
                    this.elements.splice(start, count || 1).forEach((function (el) {
                        this._removeEl(el);
                    }).bind(this));
                }
            });
        },
        add: function (model) {
            return this.do(function (i, el) {
                this.elements.push(this.cloneNode(this.el, model));
            });
        },
        clear: function () {
            return this.each(function (i, el) {
                el.parentNode.removeChild(el);
            }, function () {
                this.elements.length = 0;

            }, true);
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
                this.repeats.push(new CollectionRepeat(this, repeats[i]));
            }
        }

        this.data = [];
        parent.data[attr] = this.data;

        this.add(data);
    }

    Collection.prototype = Object.create(Event);

    Collection.prototype.each = function (fn) {
        for (var i = 0; i < this.models.length; i++) {
            fn.call(this, this.models[i]);
        }
        return this;
    }

    Collection.prototype.find = function (fn) {
        for (var i = 0; i < this.models.length; i++) {
            if (fn.call(this, this.data[i], i)) {
                return this.models[i];
            }
        }
        return null;
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
            this.models.push(model);

            this.trigger('add', model);
        }

        for (var i = 0, len = this.repeats.length; i < len; i++) {
            this.repeats[i].update();
        }

        this._triggerChangeEvent();
    }

    Collection.prototype._triggerChangeEvent = function () {
        if (!this._silent) {
            this.root._triggerChangeEvent(this.key, this, this.data)
                ._triggerChangeEvent(this.key + '/length', this, this.data.length);
        }
    }

    Collection.prototype.remove = function (start, count) {
        var models = this.models.splice(start, count || 1);
        this.data.splice(start, count || 1);

        for (var i = 0, len = this.repeats.length; i < len; i++) {
            this.repeats[i].remove(start, count);
        }
        this._triggerChangeEvent();
        this.trigger('remove', models);
    }

    Collection.prototype.clear = function (data) {
        this.models.length = this.data.length = 0;
        for (var i = 0, len = this.repeats.length; i < len; i++) {
            this.repeats[i].clear();
        }
        this._triggerChangeEvent();
    }

    Collection.prototype.set = function (data) {
        this._silent = true;
        if (data.length == 0) {
            this.clear();
        } else {
            if (data.length < this.data.length) {
                this.remove(data.length, this.data.length - data.length)
            }

            var i = 0;
            this.each(function (model) {
                model.set(true, data[i]);
                i++;
            });

            this.add(data.slice(i, data.length));
        }
        this._silent = false;

        this._triggerChangeEvent();

        return this;
    }

    Collection.prototype.get = function (i) {
        return this.models[i];
    }

    var snEvents = ['tap', 'click', 'change', 'focus', 'blur', 'transition-end'];
    var snGlobal = ['this', '$', 'Math', 'new', 'Date', 'encodeURIComponent', 'window', 'document'];

    var withData = function (repeat, content) {
        var code = ',$data=$.extend({},global,model.root.data,{$state:global.State.data}';
        if (repeat) {
            code += ',{';
            for (var parent = repeat.parent, current = repeat; parent != null; current = parent, parent = parent.parent) {
                code += parent.alias + ':' + (current.isChild ? 'model.closest(\'' + parent.collectionName + '^child\').data' : 'global.closestModelData(el,"' + parent.alias + '")') + ',';

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

        code += ');with($data){' + content + '}';

        return code;
    }

    var ViewModel = function (el, data) {
        if (typeof data === 'undefined' && (el == undefined || $.isPlainObject(el))) {
            data = el, el = this.el;
        }
        this.cid = util.guid();
        this._bindListenTo = [];

        this.data = $.extend({}, data);
        this.model = {};
        this.repeats = {};
        this._fns = [];
        this.fns = [];
        this.root = this;

        this.scan(el);
        this.init = true;
        this.set(this.data);
        this.init = false;

        this.on('Destroy', this.onDestroy);
        this.initialize.call(this, arguments);
    }

    ViewModel.prototype = $.extend(Object.create(Model.prototype), {
        key: '',

        initialize: util.noop,

        setState: function (cover, key, value) {
            State.set(cover, key, value);
            return this;
        },

        getState: function (key) {
            return State.get(key);
        },

        _compile: function (expression, repeat, listen) {

            var self = this;

            var content = 'try{return \''
                + expression
                    .replace(/\\/g, '\\\\').replace(/'/g, '\\\'')
                    .replace(rmatch, function (match, exp) {
                        return '\'+(' + exp.replace(/\\\\/g, '\\').replace(/\\'/g, '\'').replace(rvar, function (match, prefix, name) {
                            if (!name) return match;

                            var attrs = name.split('.');
                            var alias = attrs[0];

                            if (alias == "$state") {
                                State.on('change:' + name.replace('$state.', '').replace(/\./g, '/'), listen);
                                return prefix + name;

                            } else if (!alias || Filters[alias] || snGlobal.indexOf(alias) != -1 || rvalue.test(name)) {

                                return prefix + name;
                            }
                            var loopIndex;

                            if (repeat) {
                                for (var rp = repeat; rp != null; rp = rp.parent) {
                                    if (alias == rp.alias) {
                                        attrs[0] = rp.collectionName + '^child';
                                        break;

                                    } else if (alias == rp.indexAlias) {
                                        loopIndex = rp;
                                        break;
                                    }
                                }
                            }

                            var eventName = (loopIndex
                                ? loopIndex.collectionName + '/' + loopIndex.alias + '/' + loopIndex.indexAlias
                                : attrs.join('/').replace(/\./g, '/'));

                            self.on('change:' + eventName, listen);

                            return prefix + isNull(name);
                        }) + ')+\'';
                    })
                + '\';}catch(e){return \'\';}';

            var code = 'function(global,model,el){var $el=$(el)'
                + withData(repeat, content.replace('return \'\'+', 'return ').replace(/\+\'\'/g, '')) + '}';

            return code;
        },

        _setElAttr: function (el, attr) {
            var self = this;
            if (el.bindings) {
                var attrs = attr ? [attr] : el.bindings;
                for (var attr in el.bindings) {
                    var val = self.fns[el.bindings[attr]].call(self, Filters, self._closestByEl(el), el);

                    switch (attr) {
                        case 'textContent':
                            if (el.textContent !== val + '') {
                                el.textContent = val;
                            }
                            break;
                        case 'value':
                            if (el.tagName == 'INPUT' || el.tagName == 'SELECT' || el.tagName == 'TEXTAREA') {
                                if (el.value != val) {
                                    el.value = val;
                                }
                            } else
                                el.setAttribute(attr, val);
                            break;
                        case 'html':
                        case 'sn-html':
                            el.innerHTML = val;
                            break;
                        case 'display':
                        case 'sn-display':
                            el.style.display = util.isFalse(val) ? 'none' : val == 'block' || val == 'inline' || val == 'inline-block' ? val : '';
                            break;
                        case 'style':
                            el.style.cssText += val;
                            break;
                        default:
                            el.setAttribute(attr, val);
                            break;
                    }
                }
            }
        },
        _bindAttr: function (node, attr, expression, repeat) {
            var self = this;

            if (!rmatch.test(expression)) return;

            var listen = function (e, model) {
                if (!repeat) {
                    self._setElAttr(node, attr);

                } else {
                    for (var i = 0; i < node._elements.length; i++) {
                        var el = node._elements[i];

                        if (model == this || model.isRelativeToEl(el)) {
                            self._setElAttr(el, attr);
                        }
                    }
                }
            };
            (node.bindings || (node._elements = [], node.bindings = {}))[attr] = self.fns.length + self._fns.length;

            var code = self._compile(expression, repeat, listen);

            self._fns.push(code);
        },

        _closestByEl: function (el) {

            return this._eachEl(el, function (el) {
                if (el.model)
                    return el.model;
            });
        },

        _getByEl: function (el, name) {
            var self = this;
            var attrs = name.split('.');
            var alias = attrs[0];

            if (alias == 'this') {
                return self;
            } else if (alias == "$state")
                return $state;

            return this._eachEl(el, function (el) {
                if (el.repeat && (el.repeat.repeat.alias == alias))
                    return el.model;
            });
        },
        _getVal: function (model, name) {
            var model = model == this || model instanceof Model ? model : this._getByEl(model, name);

            return model.get(model == this ? name : name.replace(/^[^\.]+\./, ''));
        },

        _setByEl: function (el, name, value) {
            var model = this._getByEl(el, name);

            model.set(model == this || model == State ? name : name.replace(/^[^\.]+\./, ''), value);
        },

        scan: function (el) {
            var self = this;
            var elements = [];

            var $el = $(el).attr("sn-viewmodel", this.cid).on('input change', '[sn-model]', function (e) {
                if (e._stopModelEvent == true) return;
                var target = e.currentTarget;
                var name = target.getAttribute('sn-model');

                self._setByEl(target, name, target.value);
                e._stopModelEvent = true;
            }).each(function () {
                this.model = self;
            });

            self.$el = !self.$el ? $el : self.$el.add($el);

            var _handleEvent = function (e) {
                if (e._stopModelEvent == true) return;
                var target = e.currentTarget;
                var eventCode = target.getAttribute('sn-' + e.type);
                var argNames = eventCode.split(':');
                var argName;
                var args = [e];
                var fn;
                var ctx;

                if (/^\d+$/.test(eventCode)) {
                    var model = self._closestByEl(target);
                    (model.root === self) && self.fns[eventCode].call(self, e, model, Filters);

                } else {
                    for (var i = 0; i < argNames.length; i++) {
                        var attr = argNames[i];
                        if (i == 0) {
                            ctx = self._getByEl(target, attr);
                            fn = self._getVal(ctx, attr);

                            e.model = self._closestByEl(target, attr);

                        } else {
                            args.push(self._getVal(target, attr));
                        }
                    }

                    fn.apply(ctx, args);
                }
                e._stopModelEvent = true;
            };

            for (var i = 0, eventName, attr; i < snEvents.length; i++) {
                eventName = snEvents[i] == 'transition-end' ? $.fx.transitionEnd : snEvents[i];
                attr = '[sn-' + snEvents[i] + ']';
                $el.on(eventName, attr, _handleEvent).filter(attr).on(eventName, _handleEvent);
            }

            eachElement($el, function (child, i, childList) {
                if (child.nodeType == 1) {
                    var repeat = child.getAttribute('sn-repeat');
                    if (repeat != null) {
                        var match = repeat.match(rrepeat);
                        var collectionName = match[3];
                        var viewModel = collectionName.indexOf('$state') == 0 ? State : self;
                        repeat = new Repeat({
                            root: self,
                            viewModel: viewModel,
                            parent: childList.repeat,
                            alias: match[1],
                            indexAlias: match[2],
                            collectionName: collectionName,
                            filters: match[4],
                            orderBy: match[5],
                            el: child
                        });
                        (viewModel.repeats[repeat.collectionName] || (viewModel.repeats[repeat.collectionName] = [])).push(repeat);

                    } else {
                        repeat = childList.repeat;
                    }
                    repeat && (child.childNodes.repeat = repeat);

                    for (var j = 0; j < child.attributes.length; j++) {
                        var attr = child.attributes[j].name;
                        var val = child.attributes[j].value;

                        if (val) {
                            if (attr == 'sn-error') {
                                attr = 'onerror'
                            } else if (attr == 'sn-src') {
                                attr = 'src'
                            }
                            if (attr == 'sn-display' || attr == 'sn-html' || attr.indexOf('sn-') != 0) {
                                if (attr.indexOf('sn-') == 0 && val.indexOf("{{") == -1 && val.indexOf("}}") == -1) {
                                    val = '{{' + val + '}}';
                                }
                                self._bindAttr(child, attr, val, repeat);

                            } else if (snEvents.indexOf(attr.replace(/^sn-/, '')) != -1) {
                                if (rset.test(val) || rthis.test(val)) {

                                    var content = val.replace(rthis, function (match, $1, $2) {
                                        return $1 + "e" + ($2 ? ',' : '') + $2 + ")";

                                    }).replace(rset, 'this._setByEl(e.currentTarget,"$1",$2)');

                                    var code = 'function(e,model,global){var el=e.currentTarget' + withData(repeat, content) + "}";

                                    child.setAttribute(attr, self.fns.length + self._fns.length);
                                    self._fns.push(code);
                                }
                            }
                        }
                    }
                    if (!repeat && child.bindings) {
                        elements.push(child);
                    }

                } else if (child.nodeType == 3) {
                    self._bindAttr(child, 'textContent', child.textContent, childList.repeat);
                    if (!childList.repeat && child.bindings) {
                        elements.push(child);
                    }
                }
            });

            this.fns = this.fns.concat(window.eval('[' + this._fns.join(',') + ']'));
            this._fns.length = 0;

            for (var i = 0, len = elements.length; i < len; i++) {
                self._setElAttr(elements[i]);
            }
        }

    }, util.pick(ComponentBase.prototype, ['destroy', 'undelegateEvents', 'listenTo', 'listen', 'onDestroy', '$']));

    ViewModel.extend = util.extend;

    Filters.State = State = new ViewModel();

    exports.ViewModel = ViewModel;
    exports.Filters = Filters;
});


/*
    this.model = new model.ViewModel($('<div><div sn-repeat="item in data"><span>{{item.name}}</span><i sn-repeat="p in children">{{p.name}}</i></div></div>'), {
        data: [{
            name: '1234'
        }],
        children: [{
            name: 'aaa'
        }]
    });
    
    this.model = new model.ViewModel($('<div><div sn-repeat="item in data"><span>{{item.name}}</span><i sn-repeat="p in item.children">{{p.name}}</i></div></div>'), {
        data: [{
            name: '1234',
            children: [{
                name: 'aaa'
            }]
        }]
    });
    this.model.$el.appendTo($('body'));
    
    
    var data = {
        data: []
    }
    
    var data1={
        name:'state',
        data:[]
    }

    for (var i = 0; i < 10; i++) {
        data.data.push({
            id: i,
            name: 'adsf' + i,
            src: "http://" + i
        });
        
        data1.data.push({
            id: i,
            name: 'adsf' + i,
            src: "http://" + i
        });
    }

    this.model = new model.ViewModel($(<div>{{$state.name}}</div>), data);
        
    this.model.setState(data1);

    this.model.$el.appendTo($main.html(''));
    return;
*/