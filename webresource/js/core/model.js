define(function (require, exports, module) {

    var $ = require('$'),
        util = require('util'),
        Base = require('./base'),
        Event = require('./event');

    var slice = Array.prototype.slice;

    var Filter = {
        date: util.formatDate,
        isFalse: function (val, a, b) {
            return arguments.length == 1 ? util.isFalse(val) : util.isFalse(val) ? a : b;
        },
        isTrue: function (val, a, b) {
            return arguments.length == 1 ? util.isTrue(val) : util.isTrue(val) ? a : b;
        },
        json: function (data) {
            return (data instanceof Model || data instanceof Collection) ? JSON.stringify(data.data) : JSON.stringify(data);
        },
        length: function (data) {
            return data instanceof Collection ? data.data.length : (data && data.length || 0)
        },
        join: function (arr, split) {
            return (arr instanceof Collection) ? arr.data.join(split) : arr.join(split);
        },
        replace: function (str, reg, replacement) {
            return str.replace(reg, replacement)
        },
        is: function (val, type) {
            switch (type) {
                case 'array':
                    return $.isArray(val);
                case 'object':
                    return $.isPlainObject(val);
                default:
                    return typeof val == type;
            }
        },
        equal: function (val, compare, a, b) {
            return arguments.length == 2 ? val == compare : (val == compare ? a : b);
        },
        eval: function (str, format) {
            var args = {};
            var cache = this._evalCache || (this._evalCache = {});
            var fn = cache[format] || (cache[format] = new Function("$args", "with($args){ return " + format + "}"));

            for (var i = 0, j = 0, len = arguments.length; i < len; i++) {
                if (i != 1) {
                    args['$' + j] = arguments[i];
                    j++;
                }
            }
            return fn.call(this, args);
        },
        lt: function (a, b) {
            return a < b;
        },
        lte: function (a, b) {
            return a <= b;
        },
        gt: function (a, b) {
            return a > b;
        },
        gte: function (a, b) {
            return a >= b;
        },
        choose: function (flag, a, b) {
            return flag ? a : b;
        },
        or: function (str, or) {
            return str || or;
        },
        and: function (str, or) {
            return str && or;
        },
        not: function (str) {
            return !str;
        },
        lowercase: function (str) {
            return str.toLowerCase();
        },
        uppercase: function (str) {
            return str.toUpperCase();
        },
        currency: function (str, p) {
            return (p || '') + Math.round(parseFloat(str) * 100) / 100;
        },
        concat: function () {
            return slice.call(arguments).join('');
        },
        round: function (number) {
            return Math.round(number)
        },
        max: Math.max,
        min: Math.min,
        mul: function (str, num) {
            return parseFloat(str) * parseFloat(num);
        },
        plus: function (str, num) {
            return parseFloat(str) + parseFloat(num);
        },
        minus: function (str, num) {
            return parseFloat(str) - parseFloat(num);
        },
        format: function (obj) {
            var args;
            var format = arguments[1];
            if (arguments.length == 2 && typeof obj == 'object') {
                args = obj;
            } else {
                args = slice.call(arguments)
                args.splice(1, 1);
            }
            return format.replace(/\{([_a-zA-Z0-9]+)\}/g, function (match, index) {
                return args[index];
            });
        },
        'case': function (str) {
            var args = slice.call(arguments, 1),
                i = 0,
                len = args.length;

            for (; i < len; i += 2) {
                if (str == args[i])
                    return args[i + 1];
            }
            return len % 2 == 0 ? undefined : args[len - 1];
        },

        listen: function (parent, model, key, el, self, param, count) {
            var fkey;

            if (el) {
                fkey = "_bind_filter" + self.prop + (typeof el === "number" ? el : '') + '_' + count;

                if (!model[fkey] && (model[fkey] = true) || !el[fkey] && (el[fkey] = true)) {
                    param = param.split('.');
                    var attr = param.pop();
                    var m = (param.length <= 0 ? parent : (parent.get(param.join('.')) || parent.set(param.join('.'), {}).get(param)));

                    m.on("change" + (attr ? ':' + attr : ''), function () {
                        model._elAttr(el, self.prop, self.filter(Filter, model, model.data[key]));
                    });
                }
            }
        }
    };

    var rfilter = /\s*\|\s*([a-zA-Z_0-9]+)((?:\s*(?:\:|;)\s*\({0,1}\s*([a-zA-Z_0-9\.-]+|'(?:\\'|[^'])*')\){0,1})*)/g;
    var rparams = /\s*\:\s*([a-zA-Z_0-9\.-]+|'(?:\\'|[^'])*')/g;
    var rvalue = /^((-)*\d+|true|false|undefined|null|'(?:\\'|[^'])*')$/;

    var createFilterFn = function (filters, listItem) {
        var code = '';
        var before = 'var S=this;';
        var count = 0;
        var argCount = 0;
        var keys, key, alias;

        filters.replace(rfilter, function (match, filter, parameters) {
            code += 'V=F.' + filter + '(V';

            parameters.replace(rparams, function (match, param) {
                var parameterStr;
                if (rvalue.test(param)) {
                    parameterStr = param;

                } else {
                    keys = param.split('.');
                    key = keys.shift();

                    if (!listItem || (key != listItem.alias && !(alias = listItem.modelAlias[key]))) {
                        parameterStr = 'M.root.data.' + param;
                        before += 'if(E)F.listen(M.root,M,K,E,S,"' + param + '",' + (count++) + ');';

                    } else if (param == listItem.alias) {
                        parameterStr = 'M.data';
                        before += 'if(E)F.listen(M.parent,M,K,E,S,M._key,' + (count++) + ');';

                    } else {
                        if (key == listItem.alias) {
                            alias = listItem.collectionName;
                        }
                        param = keys.join('.');
                        parameterStr = 'A' + (argCount++);

                        before += 'var ' + parameterStr + ';var P=M;while(P){if(P.key=="' + alias + '^child"){if(E)F.listen(P,M,K,E,S,"' + param + '",' + (count++) + ');' + parameterStr + '=P.data.' + param + ';break;}P=P.parent.parent;}';
                    }
                }

                code += ',' + parameterStr;
            });

            code += ');';
        });

        code += 'return V;';
        //Filter, model,value,key,el,parent,this
        return new Function('F', 'M', 'V', 'K', 'E', before + code);
    };

    var filter$El = function ($el, selector) {
        return $el.filter(selector).add($el.find(selector));
    };

    var getVariable = function (repeat, variable) {
        var keys = variable.split('.');
        var key = keys.shift();

        if (key == repeat.alias) {
            return { collection: repeat.collectionName, variable: keys.join('.') }

        } else {
            var alias = repeat.modelAlias[key];
            if (alias) {
                return { collection: alias, variable: keys.join('.') }
            }
        }
    }

    var getArgs = function (args) {
        var result = {
            isExp: args[0] == '=',
            args: []
        };
        if (!result.isExp)
            args.replace(rparams, function (match, param) {
                result.args.push(param);
            });
        else
            result.args.push(args.substr(1));

        return result;
    };

    var rrepeat = /([a-zA-Z_0-9]+)(?:\s*,(\s*[a-zA-Z_0-9]+)){0,1}\s+in\s+([a-zA-Z_0-9]+(?:\.[a-zA-Z_0-9]+){0,})((?:\s*\|\s*filter\s*\:\s*.+?){0,1})(?:\s*\|\s*orderBy\:(.+)){0,1}(\s|$)/g;
    var rbinding = /\b([a-zA-Z_0-9-\.]+)\s*\:\s*([a-zA-Z_0-9]+)((?:\.[a-zA-Z_0-9]+)*)((?:\s*\|\s*[a-zA-Z_0-9]+(?:\s*\:\s*\({0,1}\s*(?:[a-zA-Z_0-9\.-]+|'(?:\\'|[^'])*')\){0,1})*)*)(\s|,|$)/g;
    var revents = /\b([a-zA-Z\s]+)\s*\:\s*([a-zA-Z_0-9]+)((?:\.[a-zA-Z_0-9]+)*)((?:\s*\:\s*(?:[a-zA-Z_0-9\.]+|'(?:\\'|[^'])*'))*|\s*=\s*(?:[a-zA-Z_0-9\.]+|'(?:\\'|[^'])*'))(\s|,|$)/g;

    var Finder = function ($elem) {
        this.count = 0;
        this.repeats = {};
        this.bindings = {};
        this.events = [];
        this.eventNames = [];
        this.eventid = 0;
        this.scan($elem);
    };

    Finder.prototype.scan = function ($elem) {
        var self = this;
        var repeats = this.repeats;
        var bindings = this.bindings;
        var events = this.events;
        var eventNames = this.eventNames;
        var collection;

        var count = this.count;
        var eventid = this.eventid;

        var $repeats = filter$El($elem, '[sn-repeat]').each(function () {
            var $el = $(this);
            var el = this;
            var repeat = this.getAttribute('sn-repeat');
            var parents = $el.parents('[sn-repeat-alias]');
            var modelAlias = {};
            var loopIndexAlias = {};

            parents.each(function () {
                var repeatName = this.getAttribute('sn-repeat-name');
                modelAlias[this.getAttribute('sn-repeat-alias')] = repeatName;

                var index = this.snIndexAlias;
                if (index) {
                    loopIndexAlias[index] = repeatName;
                }
            });

            repeat.replace(rrepeat, function (match, modelName, indexAlias, collectionName, filters, orderBy) {

                var names = collectionName.split('.');
                var namesLength = names.length;
                var alia;

                if (namesLength !== 1) {
                    alia = modelAlias[names[0]];

                    if (alia) {
                        names[0] = alia + '^child';
                        collectionName = names.join('.');
                    }
                }

                el.setAttribute('sn-repeat-alias', modelName);
                el.setAttribute('sn-repeat-name', collectionName);
                if (indexAlias) {
                    el.snIndexAlias = indexAlias;
                    loopIndexAlias[indexAlias] = collectionName;
                }

                var placeHolder = document.createElement('script');
                placeHolder.setAttribute('type', 'text/placeholder');

                var placeHolderName;
                var listItem = {
                    loopIndexAlias: loopIndexAlias,
                    collectionName: collectionName,
                    alias: modelName,
                    modelAlias: modelAlias,
                    template: el
                };

                if (filters) listItem.filter = filters;
                if (orderBy) listItem.orderBy = orderBy;
                if (collectionName.indexOf('.') == -1) listItem.placeHolder = placeHolder;

                collection = repeats[collectionName];
                if (!collection) {
                    repeats[collectionName] = [listItem];
                    placeHolderName = collectionName + '_1';
                } else {
                    placeHolderName = collectionName + '_' + collection.push(listItem);
                }

                listItem.placeHolderName = placeHolderName;
                placeHolder.setAttribute('sn-placeholder', placeHolderName);

                el.parentNode.insertBefore(placeHolder, el);
            });

        }).remove();

        for (var collectionName in repeats) {
            var list = repeats[collectionName];

            for (var i = 0, len = list.length; i < len; i++) {
                var listItem = list[i];
                var $el = $(listItem.template);

                filter$El($el, '[sn-binding],[sn-model],[sn-on]').each(function () {
                    var el = this;
                    var binding = this.getAttribute('sn-binding');
                    var model = this.getAttribute('sn-model');
                    var on = this.getAttribute('sn-on');
                    var keys;
                    var key;

                    el.setAttribute("sn-id", ++count);

                    if (model) {
                        model = getVariable(listItem, model);
                        if (model) {
                            this.setAttribute('sn-collection', model.collection);
                            this.setAttribute('sn-model', model.variable);
                        }
                    }

                    if (on) {
                        this.setAttribute('sn-on', eventid);
                        var actions = events[eventid];
                        on.replace(revents, function (match, event, name, key, args) {
                            if (eventNames.indexOf(event) == -1) eventNames[eventNames.length] = event;
                            if (!actions) actions = events[eventid] = {};
                            var variable = name + key;
                            actions[event] = $.extend(getArgs(args), {
                                name: getVariable(listItem, variable) || variable,
                                repeat: listItem
                            });
                        });
                        eventid++;
                    }

                    if (binding) {
                        binding.replace(rbinding, function (match, prop, name, key, filters) {
                            var alias;
                            if (name == listItem.alias) {
                                name = listItem.collectionName + '^child' + key;

                            } else if (listItem.loopIndexAlias && listItem.loopIndexAlias[name]) {
                                name = listItem.loopIndexAlias[name] + '^child.^' + name;

                            } else if (alias = listItem.modelAlias[name]) {
                                name = alias + '^child' + key;
                            }

                            (bindings[name] || (bindings[name] = [])).push({
                                el: count,
                                prop: !filters ? prop : {
                                    prop: prop,
                                    filter: createFilterFn(filters, listItem)
                                }
                            });
                        });
                    }
                });
            }
        }

        filter$El($elem, '[sn-binding],[sn-on]').each(function () {
            var binding = this.getAttribute('sn-binding');
            var on = this.getAttribute('sn-on');
            var el = this;

            if (binding)
                binding.replace(rbinding, function (match, prop, name, key, filters) {
                    name += key;

                    (bindings[name] || (bindings[name] = [])).push({
                        el: el,
                        prop: !filters ? prop : {
                            prop: prop,
                            filter: createFilterFn(filters)
                        }
                    });
                });

            if (on) {
                this.setAttribute('sn-on', eventid);
                var actions = events[eventid];
                on.replace(revents, function (match, event, name, key, args) {
                    if (eventNames.indexOf(event) == -1) eventNames[eventNames.length] = event;
                    if (!actions) actions = events[eventid] = {};
                    actions[event] = $.extend(getArgs(args), {
                        name: name + key
                    });
                });
                eventid++;
            }
        });
    };

    var setAttribute = function (el, prop, value) {
        if (prop.indexOf('style.') == 0) {
            el.style[prop.substr(6)] = value;

        } else {
            switch (prop) {
                case 'text':
                    el.innerHTML = util.encodeHTML(value);
                    break;
                case 'html':
                    el.innerHTML = value;
                    break;
                case 'display':
                    el.style.display = util.isFalse(value) ? 'none' : value == 'block' || value == 'inline' || value == 'inline-block' || value == 'none' || value == '-webkit-box' ? value : '';
                    break;
                case 'value':
                    if (el.value != value) el.value = value;
                    break;
                case 'style':
                    $(el).css(value);
                    break;
                case 'class':
                    if (typeof el.initClassName === 'undefined') el.initClassName = el.className || '';
                    el.className = el.initClassName + ' ' + (typeof value == 'string' || !value ? value : Filter.join(value, ' '));
                    break;
                default:
                    (value === null || value === undefined) ? el.removeAttribute(prop) : el.setAttribute(prop, value);
                    break;
            }
        }
    };

    var Model = function (data, key, parent, $el) {
        if (arguments.length != 4) return;

        if (this.created) return;

        var model = {},
            value;

        this.$el = $el;
        this.model = model;
        this._key = key;
        this.data = {};

        if (parent instanceof Model) {
            this.parent = parent;
            this.key = parent.key ? parent.key + '.' + key : key;

            this.root = parent.root;

        } else if (parent instanceof Collection) {
            this.parent = parent;
            this.key = parent.key + '^child';
            this.root = parent.root;

        } else {
            throw new Error('Model\'s parent mast be Collection or Model');
        }

        if (data) this.set(data);

        parent.data[key] = this.data;

        this.created = true;
    };

    Model.prototype = Object.create(Event);

    $.extend(Model.prototype, {
        constructor: Model,

        _redraw: function () {
            var model;
            for (var key in this.model) {
                model = this.model[key];

                if (model instanceof Model || model instanceof Collection) {
                    model._redraw();
                } else {
                    this._syncView(key, model);
                }
            }
        },

        _syncView: function (attr, value, $container) {
            var bindings = this.root.finder.bindings[attr && this.key ? this.key + '.' + attr : (this.key || attr)],
                binding,
                el,
                prop,
                val;

            if (bindings) {
                for (var i = 0, len = bindings.length; i < len; i++) {
                    binding = bindings[i];
                    el = binding.el;
                    prop = binding.prop;

                    if (typeof prop !== 'string') {
                        val = prop.filter(Filter, this, value, attr, el);
                        prop = prop.prop;
                    } else
                        val = value;

                    this._elAttr(el, prop, val, $container);
                }
            }
            return this;
        },

        _syncOwnView: function () {
            if (this.root != this) {
                this._syncView('', this.data);

                if (this.created && this.parent instanceof Model)
                    this.parent.trigger('change:' + this._key, this.data);

                if (this.parent.shouldUpdateView)
                    this.parent._syncOwnView();
            }
            return this;
        },

        _elAttr: function (el, attr, val, $container) {
            if (typeof el === 'number') {
                filter$El($container || this.$el, '[sn-id="' + el + '"]').each(function () {
                    setAttribute(this, attr, val);
                });
            } else {
                setAttribute(el, attr, val);
            }
        },

        get: function (key) {
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
        },

        dirty: function () {
            var value,
                result = {};

            for (var key in this.data) {
                value = this.data[key];
                if (this.originalData[key] != value) {
                    result[key] = value;
                }
            }

            return result;
        },

        set: function (key, val) {
            var self = this,
                origin,
                changed,
                attrs,
                model = this.model;

            self.shouldUpdateView = false;

            if ($.isPlainObject(key)) {
                attrs = key;
            } else if (typeof val == 'undefined') {
                val = key, key = '';

                if (this.parent) {
                    this.parent.data[this.parent.models.indexOf(this)] = val;
                }
                this.data = val;
                this._syncOwnView();
                return;

            } else {
                (attrs = {})[key] = val;
            }

            if (!this.originalData)
                this.originalData = attrs;

            var collections = [],
                models = [],
                value,
                changed = false,
                cache = [];

            for (var attr in attrs) {
                this.data[attr] = attrs[attr];
            }

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
                                    model = prev.model[attr] = new Model(null, attr, prev, prev.$el);
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
                        models.push(model[attr] = new Model(null, attr, this, this.$el), value);

                    } else if ($.isArray(value)) {
                        model[attr] = new Collection;
                        collections.push(attr);

                    } else {
                        this.data[attr] = value;
                        model[attr] = value;
                        if (this.created) {
                            this.trigger('change:' + attr, value);

                            this.root.trigger('change:' + (this.key ? this.key + '.' + attr : attr), this, attr, value);
                        }
                    }

                    cache.push(attr, value);

                    if (!changed) changed = true;
                }
            }

            for (var i = 0, len = models.length; i < len; i += 2) {
                models[i].set(models[i + 1]);
            }

            for (var i = 0, len = collections.length; i < len; i++) {
                key = collections[i];
                model[key].constructor(this.data[key], key, this);
            }

            if (changed) {
                if (this.root != this) {
                    this._syncOwnView();
                }
                for (var i = 0, len = cache.length; i < len; i += 2) {
                    this._syncView(cache[i], cache[i + 1]);
                }
            }

            self.shouldUpdateView = true;

            return this;
        },

        clear: function () {
            var data = {};
            for (var attr in this.data) {
                data[attr] = null;
            }
            this.set(data);
        },

        toJSON: function () {
            return $.extend(true, {}, this.data);
        }
    });


    var repeatFilter = {
        contains: function (source, keywords) {
            return source.indexOf(keywords) != -1;
        }
    };

    var Repeat = function (collection, options) {
        var self = this;

        this.list = [];
        this.collection = collection;

        $.extend(this, options);

        this.selector = '[sn-placeholder="' + this.placeHolderName + '"]';

        if (!this.placeHolder && this.collection.parent.$el)
            this.placeHolder = this.collection.parent.$el.find(this.selector)[0];

        this.isInCollection = !$.contains(document.body, this.placeHolder);

        if (this.filter) {

            var strWith = '{';

            for (var key in this.modelAlias) {
                var collectionName = this.modelAlias[key];
                strWith += key + ':model.parent.parent'
                var model = collection.parent;
                while (model) {
                    if (model.key == collectionName + '^child') {
                        break;
                    }
                    model = model.parent;
                    strWith += '.parent';
                }
                strWith += '.data,'
            }

            strWith += this.alias + ':model.data}';

            var code = 'var self=this,collection=this.collection;with($.extend({},collection.root.data,' + strWith + ',filter)){';
            var filter = this.filter.replace(/^\s*\|\s*filter\s*\:/, '');
            //listItem.modelAlias[key]

            code += 'return ' + filter;
            code += '}';

            this.filter = new Function('filter', 'model', code);

            var allAlias = filter.split(/[\=\>\<\?\s\:\(\),]+/g);

            for (var i = 0, len = allAlias.length; i < len; i++) {
                if (!rvalue.test(allAlias[i])) {
                    var model;
                    var attrs = allAlias[i].split('.');
                    var alias = attrs[0];

                    if (!alias || repeatFilter[alias]) continue;

                    if (alias == this.alias) {
                        attrs[0] = collection.key + '^child';

                    } else {
                        var collectionName = this.modelAlias[alias];
                        if (collectionName) {
                            attrs[0] = collectionName + '^child';
                        }
                    }

                    collection.root.on('change:' + attrs.join('.'), function () {
                        self.update();
                    })
                }
            }

        }

        //this.filter(Filter, collection.parent, collection.data, collection.key, el);
    }


    Repeat.prototype = {

        update: function () {
            var fragment = document.createDocumentFragment();
            var index = 0;
            var list = this.list;
            var orderBy = this.orderBy;

            if (orderBy) {
                list.sort(function (a, b) {
                    a = a.model.data[orderBy];
                    b = b.model.data[orderBy];
                    return a > b ? 1 : a < b ? -1 : 0;
                });
            }

            for (var i = 0, len = list.length; i < len; i++) {
                var item = list[i];
                if (!this.filter || this.filter(repeatFilter, item.model)) {
                    fragment.appendChild(item.el);

                    var alias = this.template.snIndexAlias;
                    if (alias) {
                        item.model._syncView('^' + alias, index, $(item.el).attr('sn-index-' + alias, index));
                    }
                    index++;

                } else if (item.el.parentNode) {
                    item.el.parentNode.removeChild(item.el);
                }
            }

            this.appendChild(fragment);
        },

        get: function (model) {
            for (var i = this.list.length - 1; i >= 0; i--) {
                if (this.list[i].model == model) {
                    return this.list[i];
                }
            }
        },

        add: function (model, el) {
            this.list.push({
                model: model,
                el: el
            });
        },

        appendChild: function (el) {
            !this.isInCollection ? this.placeHolder.parentNode.insertBefore(el, this.placeHolder) : this.collection.parent.$el.find(this.selector).add(this.placeHolder).before(el);
        },

        clear: function () {
            for (var i = this.list.length - 1; i >= 0; i--) {
                this.list[i].el.parentNode.removeChild(this.list[i].el);
            }
            this.list.length = 0;
        },

        remove: function (model) {
            for (var i = this.list.length - 1; i >= 0; i--) {
                if (this.list[i].model == model) {
                    this.list[i].el.parentNode.removeChild(this.list[i].el);
                    this.list.splice(i, 1);
                    break;
                }
            }
        }
    }

    var Collection = function (data, key, parent) {
        if (arguments.length != 3) return;

        this.models = [];
        this.data = [];
        this.key = key;
        this._key = key;
        this.repeats = [];

        this.parent = parent;
        if (parent.key)
            this.key = parent.key + "." + this.key;

        this.root = parent.root;
        var repeats = this.root.finder.repeats[this.key];
        var item;

        if (repeats) {
            for (var i = 0, len = repeats.length; i < len; i++) {
                this.repeats.push(new Repeat(this, repeats[i]));
            }
        }

        if (data) this.set(data);
    };

    Collection.prototype = {
        constructor: Collection,

        model: Model,

        forEach: function (fn) {
            var model;
            var $els;

            for (var i = 0, len = this.models.length; i < len; i++) {
                model = this.models[i];

                fn.call(this, model, i);
            }
        },

        _redraw: function () {
            for (var i = 0, len = this.models.length; i < len; i++) {
                model = this.models[i];

                var repeat;

                for (var i = 0, len = this.repeats.length; i < len; i++) {
                    repeat = this.repeats[i];

                    if (!repeat.get(model)) {

                        var el = item.template.cloneNode(true);
                        var $el = $(el);

                        el.snModel = model;
                        repeat.add(model, el);

                        model.$el.push(el);

                        repeat.update();
                    }
                }
                model._redraw();
            }

        },

        add: function (data) {
            var model;
            var length;
            var repeats;

            this.shouldUpdateView = false;

            if (!$.isArray(data)) {
                data = [data];
            }

            for (var i = 0, dataLen = data.length; i < dataLen; i++) {
                var $els = null;
                var dataItem = data[i];
                model = new this.model();
                length = this.data.length;

                this.models[length] = model;
                this.data[length] = dataItem;

                for (var j = 0, len = this.repeats.length; j < len; j++) {
                    var repeat = this.repeats[j];

                    var el = repeat.template.cloneNode(true);
                    var $el = $(el);

                    el.snModel = model;
                    repeat.add(model, el);

                    $els = $els ? $els.add($el) : $el;
                }

                model.constructor(dataItem, length, this, $els);
            }

            for (var i = 0, len = this.repeats.length; i < len; i++) {
                this.repeats[i].update();
            }

            this._syncOwnView();
            this.shouldUpdateView = true;
        },

        _syncOwnView: function () {
            this.parent._syncView(this._key, this.data);
            if (this.created)
                this.parent.trigger('change:' + this._key, this.data);

            if (this.parent.shouldUpdateView) {
                this.parent._syncOwnView();
            }
            return this;
        },

        set: function (data) {
            this.data.length = 0;

            for (var i = 0, len = this.repeats.length; i < len; i++) {
                this.repeats[i].clear();
            }

            this.add(data);
            return this;
        },

        get: function (i) {
            return this.models[i];
        },

        remove: function (i) {
            var item,
                el;

            if (typeof i != 'number') {
                i = this.models.indexOf(i);
            }

            for (var j = 0, len = this.repeats.length; j < len; j++) {
                item = this.repeats[j];

                el = item.list[i].el;
                el.parentNode.removeChild(el);
                item.list.splice(i, 1);
            }
            this.models.splice(i, 1);
            this.data.splice(i, 1);
            this._syncOwnView();
        }
    };

    Collection.prototype.append = Collection.prototype.add;

    var getClosestModel = function (target, collectionName) {
        return (target.getAttribute('sn-repeat-name') == collectionName ? target : $(target).closest('[sn-repeat-name="' + collectionName + '"]')[0]).snModel;
    }

    var ViewModel = function ($el, data) {
        this.root = this;

        if (!$el) return;
        if (this.created) return;

        this.data = {};
        this.events = [];
        this.model = {};
        this.key = '';

        this.load($el);
        this.set(data);

        this.created = true;
    };

    ViewModel.prototype = Object.create(Model.prototype);

    $.extend(ViewModel.prototype, {
        constructor: ViewModel,

        load: function ($el) {
            var self = this;
            this.finder = new Finder($el);
            this.$el = $el.on('input change', '[sn-model]', $.proxy(this._inputChange, this));
            this.bindEvents();
            return this;
        },

        handleEvent: function (e) {
            var target = e.currentTarget;
            var $target = $(target);
            var event = e.type;
            var eventid = target.getAttribute('sn-on');
            var events = this.finder.events[eventid];
            var option = events[event];
            var fn;
            var ctx,
                index,
                modelName;
            var args = [e];

            if (option) {
                fn = option.name;

                for (var i = 0; i < option.args.length; i++) {
                    var arg = option.args[i];
                    var model = this;

                    if (rvalue.test(arg)) {
                        args.push(window.eval(arg));

                    } else {
                        if (option.repeat) {
                            var names = arg.split('.');
                            var name = names.shift();
                            var $closest;
                            if (option.repeat.alias == name) {
                                model = getClosestModel(target, option.repeat.collectionName);
                                arg = names;
                            } else if (option.repeat.modelAlias[name]) {
                                model = getClosestModel(target, option.repeat.modelAlias[name]);
                                arg = names;
                            } else if ($closest = $target.closest('[sn-index-' + arg + ']')) {
                                args.push($closest.attr('sn-index-' + arg));
                                continue;
                            }
                        }
                        args.push(model.get(arg));
                    }
                }

                if (typeof fn == 'string') {
                    modelName = fn;
                    ctx = this;
                } else {
                    ctx = getClosestModel(target, fn.collection);
                    modelName = fn.variable;
                }

                if (option.isExp) {
                    ctx.set(modelName, args[1]);

                } else {
                    fn = ctx.get(modelName);
                    index = modelName.lastIndexOf('.');
                    fn && fn.apply(index == -1 ? ctx : ctx.get(modelName.substr(0, index)), args);
                }
            }
        },

        bindEvents: function () {
            var self = this
            for (var i = 0, len = this.finder.eventNames.length; i < len; i++) {
                var event = this.finder.eventNames[i]
                if (this.events.indexOf(event) == -1) {
                    this.$el.on(event, '[sn-on]', $.proxy(this.handleEvent, this));
                    this.events[this.events.length] = event;
                }
            }
        },

        scan: function ($el) {
            this.finder.scan($el);
            this._redraw();
            this.bindEvents();
        },

        append: function (selector, $el) {
            if (!$el) $el = selector, selector = this.$el;
            else selector = this.$el.find(selector);

            selector.append($el);
            this.scan($el);
        },

        prepend: function (selector, $el) {
            if (!$el) $el = selector, selector = this.$el;
            else selector = this.$el.find(selector);

            selector.prepend($el);
            this.scan($el);
        },

        before: function (selector, $el) {
            this.$el.find(selector).before($el);
            this.scan($el);
        },

        after: function (selector, $el) {
            this.$el.find(selector).after($el);
            this.scan($el);
        },

        _inputChange: function (e) {
            var target = e.currentTarget;
            var modelName = target.getAttribute('sn-model');
            var collectionName = target.getAttribute('sn-collection');

            if (!collectionName) {
                this.set(modelName, target.value);
            } else {
                getClosestModel(target, collectionName).set(modelName, target.value);
            }
        },

        destory: function () {
            this.$el.off('input change', '[sn-model]', this._inputChange);
        }
    });

    ViewModel.extend = Model.extend = Collection.extend = util.extend;

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

    exports.filter = exports.Filter = Filter;
});