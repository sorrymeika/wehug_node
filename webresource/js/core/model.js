define(function (require,exports,module) {

    var $=require('$'),
        util=require('util'),
        Base=require('./base'),
        Event=require('./event');

    var slice=Array.prototype.slice;

    var Filter={
        date: util.formatDate,
        json: function (data) {
            return (data instanceof Model||data instanceof Collection)?JSON.stringify(data.data):JSON.stringify(data);
        },
        join: function (arr,split) {
            return (arr instanceof Collection)?arr.data.join(split):arr.join(split);
        },
        or: function (str,or) {
            return str||or;
        },
        lowercase: function (str) {
            return str.toLowerCase();
        },
        uppercase: function (str) {
            return str.toUpperCase();
        },
        concat: function () {
            return slice.call(arguments).join('');
        },
        round: function (number) {
            return Math.round(number)
        },
        format: function (str) {
            var args=slice.call(arguments);
            var format=args[1];
            args.splice(1,1);
            return format.replace(/\{(\d+)\}/g,function (match,index) {
                return args[index];
            });
        },
        'case': function (str) {
            var args=slice.call(arguments,1),
                i=0,
                len=args.length;

            for(;i<len;i+=2) {
                if(str==args[i])
                    return args[i+1];
            }
            return args[i-2];
        },
        _addListener: function (parent,model,key,el,self,param,count) {
            var flag=false,
                fkey;

            if(el) {
                if(typeof el=="number") {
                    fkey="_bind_filter"+self.prop+el+'_'+count;
                    if(!model[fkey]) {
                        model[fkey]=flag=true;
                    } else {
                        fkey="_bind_filter"+self.prop+'_'+count;
                        if(!el[fkey]) {
                            el[fkey]=flag=true;
                        }
                    }
                    if(flag) {
                        param=param.split('.');
                        var attr=param.pop();
                        (param.length<=0?parent:parent.get(param)).on("change"+(attr?':'+attr:''),function () {
                            model._setProp(el,self.prop,self.filter(Filter,model,model.data[key]))
                        });
                    }
                }
            }
        }
    };

    var rfilter=/\s*\|\s*([a-zA-Z_1-9]+)((?:\s*(?:\:|;)\s*([a-zA-Z_1-9\.-]+|\'[^\']+?\'))*)/g;
    var rparams=/\s*\:\s*([a-zA-Z_1-9\.-]+|\'[^\']+?\')/g;
    var listenerCode=function (parent) {
        return 'if(el)Filter._addListener('+parent+',model,key,el,self,';
    }

    var filterFn=function (filters,listItem) {
        var value;
        var code='';
        var before='var self=this;';
        var count=0;
        var keys,key,alias;

        filters.replace(rfilter,function (match,filter,parameters) {
            code+='value=Filter.'+filter+'(value';

            parameters.replace(rparams,function (match,param) {
                if(param[0]=='\''||/^((-)*\d+|true|false)$/.test(param)) {
                    code+=','+param;

                } else {
                    keys=param.split('.');
                    key=keys.shift();

                    if(!listItem||(key!=listItem.alias&&!(alias=listItem.modelAlias[key]))) {
                        code+=',model.root.data.'+param;
                        before+=listenerCode('model.root')+'"'+param+'",'+(count++)+');';

                    } else if(param==listItem.alias) {
                        code+=',model.data';
                        before+=listenerCode('model.parent')+'model._key,'+(count++)+');';

                    } else if(key==listItem.alias) {
                        code+=',model.data'+param.substr(listItem.alias.length);
                        before+=listenerCode('model')+'"'+param.substr(listItem.alias.length+1)+'",'+(count++)+');';
                    } else {
                        param=keys.join('.');
                        code+=',(function(){parent=model.parent.parent;while(parent){if( parent.key=="'+alias+'^child"){'+listenerCode('parent')+'"'+param+'",'+(count++)+'); return parent.data.'+param+'; } parent=parent.parent.parent; } })()';
                    }
                }
            });

            code+=');';
        });

        code+='return value;';

        return new Function('Filter','model','value','key','el',before+code);
    };

    var rcollection=/([a-zA-Z_1-9]+)\s+in\s+([a-zA-Z_1-9]+(?:\.[a-zA-Z_1-9]+){0,})(?:\s*\|\s*filter\s*\:\s*([a-zA-Z_1-9\.]+)(?:\s*\:\s*([a-zA-Z_1-9\.]+)){0,1}){0,1}(?:\s*\|\s*orderBy\s*\:\s*([a-zA-Z_1-9\.]+)(?:\s*\:\s*([a-zA-Z_1-9\.]+)){0,1}){0,1}/g;
    var rbinding=/\b([a-zA-Z_1-9-]+)\s*\:\s*([a-zA-Z_1-9]+)((?:\.[a-zA-Z_1-9]+)*)((?:\s*\|\s*[a-zA-Z_1-9]+(?:\s*\:\s*(?:[a-zA-Z_1-9\.-]+|'[^']+'))*)*)(\s|,|$)/g;
    var revents=/\b([a-zA-Z\s]+)\s*\:\s*([a-zA-Z_1-9]+)((?:\.[a-zA-Z_1-9]+)*)(\s|,|$)/g;

    var $filterEl=function ($el,selector) {
        return $el.filter(selector).add($el.find(selector));
    };

    var getVariable=function (repeat,variable) {
        var keys=variable.split('.');
        var key=keys.shift();

        if(key==repeat.alias) {
            return { collection: repeat.collectionName,variable: keys.join('.') }

        } else {
            var alias=repeat.modelAlias[key];
            if(alias) {
                return { collection: alias,variable: keys.join('.') }
            }
        }
    }

    var Finder=function ($elem) {
        this.count=0;
        this.repeats={};
        this.bindings={};
        this.events=[];
        this.eventNames=[];
        this.eventid=0;
        this.scan($elem);
    };

    Finder.prototype.scan=function ($elem) {
        var self=this;
        var repeats=this.repeats;
        var bindings=this.bindings;
        var events=this.events;
        var eventNames=this.eventNames;
        var collection;
        var $el;

        var count=this.count;
        var eventid=this.eventid;

        var $repeats=$filterEl($elem,'[sn-repeat]').each(function () {
            $el=$(this);
            var el=this;
            var repeat=this.getAttribute('sn-repeat');
            var parents=$el.parents('[sn-repeat-alias]');
            var modelAlias={};

            parents.each(function () {
                modelAlias[this.getAttribute('sn-repeat-alias')]=this.getAttribute('sn-repeat-name');
            });

            repeat.replace(rcollection,function (match,modelName,collectionName,filter,comparator,orderBy,reverse) {
                var names=collectionName.split('.');
                var namesLength=names.length;
                var varName;
                var alia;

                if(namesLength!==1) {
                    varName=names[0];
                    alia=modelAlias[varName];

                    if(alia) {
                        names[0]=alia+'^child';
                        collectionName=names.join('.');
                    }
                }

                el.setAttribute('sn-repeat-alias',modelName);
                el.setAttribute('sn-repeat-name',collectionName);

                var placeHolder=document.createElement('script');
                placeHolder.setAttribute('type','text/placeholder');

                var placeHolderName;
                var listItem={
                    orderBy: orderBy,
                    reverse: reverse,
                    filterName: filter,
                    comparator: comparator,
                    collectionName: collectionName,
                    alias: modelName,
                    modelAlias: modelAlias,
                    template: el
                };

                if(namesLength==1) listItem.placeHolder=placeHolder;

                collection=repeats[collectionName];
                if(!collection) {
                    repeats[collectionName]=[listItem];
                    placeHolderName=collectionName+'_1';
                } else {
                    placeHolderName=collectionName+'_'+collection.push(listItem);
                }

                listItem.placeHolderName=placeHolderName;
                placeHolder.setAttribute('sn-placeholder',placeHolderName);

                el.parentNode.insertBefore(placeHolder,el);
            });

        }).remove();


        for(var collectionName in repeats) {
            var list=repeats[collectionName];
            var listItem;

            for(var i=0,len=list.length;i<len;i++) {
                listItem=list[i];
                $el=$(listItem.template);

                $filterEl($el,'[sn-binding],[sn-model],[sn-on]').each(function () {
                    var el=this;
                    var binding=this.getAttribute('sn-binding');
                    var model=this.getAttribute('sn-model');
                    var on=this.getAttribute('sn-on');
                    var keys;
                    var key;

                    el.setAttribute("sn-id",++count);

                    if(model) {
                        model=getVariable(listItem,model);
                        if(model) {
                            this.setAttribute('sn-collection',model.collection);
                            this.setAttribute('sn-model',model.variable);
                        }
                    }

                    if(on) {
                        this.setAttribute('sn-on',eventid);
                        var actions=events[eventid];
                        on.replace(revents,function (match,event,name,key) {
                            if(eventNames.indexOf(event)== -1) eventNames[eventNames.length]=event;
                            if(!actions) actions=events[eventid]={};
                            var variable=name+key;
                            actions[event]=getVariable(listItem,variable)||variable;
                        });
                        eventid++;
                    }

                    if(binding) {
                        binding.replace(rbinding,function (match,prop,name,key,filters) {

                            if(name==listItem.alias) {
                                name=collectionName+'^child'+key;

                            } else {
                                alias=listItem.modelAlias[name];
                                if(alias) {
                                    name=alias+'^child'+key;
                                }
                            }

                            if(filters) {
                                prop={
                                    prop: prop,
                                    filter: filterFn(filters,listItem)
                                };
                            }
                            var bounds=bindings[name];

                            if(!bounds) {
                                bounds=bindings[name]=[];
                            }

                            bounds.push({
                                el: count,
                                prop: prop
                            });
                        });
                    }

                });
            }
        }

        $filterEl($elem,'[sn-binding],[sn-on]').each(function () {
            var binding=this.getAttribute('sn-binding');
            var on=this.getAttribute('sn-on');
            var el=this;
            var bounds;

            if(binding)
                binding.replace(rbinding,function (match,prop,name,key,filters) {
                    name+=key;
                    if(filters) {
                        prop={
                            prop: prop,
                            filter: filterFn(filters)
                        };
                    }
                    bounds=bindings[name];

                    if(!bounds) {
                        bounds=bindings[name]=[];
                    }
                    bounds.push({
                        el: el,
                        prop: prop
                    });
                });

            if(on) {
                this.setAttribute('sn-on',eventid);
                var actions=events[eventid];
                on.replace(revents,function (match,event,name,key) {
                    if(eventNames.indexOf(event)== -1) eventNames[eventNames.length]=event;
                    if(!actions) actions=events[eventid]={};
                    actions[event]=name+key;
                });
                eventid++;
            }
        });

    };

    var setElement=function (el,prop,value) {

        switch(prop) {
            case 'text':
                el.innerHTML=util.encodeHTML(value);
                break;
            case 'html':
                el.innerHTML=value;
                break;
            case 'display':
                el.style.display=!value?'none':value=='block'||value=='inline'||value=='inline-block'?value:'';
                break;
            case 'value':
                el.value=value;
                break;
            case 'style':
                $(el).css(value);
                break;
            case 'class':
                el.className=typeof value=='string'||!value?value:Filter.join(value,' ');
                break;
            default:
                (value===null||value===undefined)?el.removeAttribute(prop):el.setAttribute(prop,value);
                break;
        }
    };

    var Model=function (data,key,parent,$el) {
        if(!data) return;

        if(this.created) return;

        var model={},
            value;

        this.$el=$el;
        this.model=model;
        this._key=key;
        this.key=key;
        this.root=this;
        this.data=$.isArray(data)?{ $data: data}:data;

        if(parent instanceof Model) {
            this.parent=parent;
            if(parent.key)
                this.key=parent.key+'.'+this.key;

            this.root=parent.root;

        } else if(parent instanceof Collection) {
            this.parent=parent;
            this.key=parent.key+'^child';
            this.root=parent.root;
        }

        this.set(data);
        this.created=true;
    };

    Model.prototype={
        constructor: Model,
        one: Event.one,
        on: Event.on,
        off: Event.off,
        trigger: Event.trigger,

        _redraw: function () {
            var model;
            for(var key in this.model) {
                model=this.model[key];

                if(model instanceof Model||model instanceof Collection) {
                    model._redraw();
                } else {
                    this._syncView(key,model);
                }
            }
        },

        _syncView: function (key,value) {
            var bindings=this.root.finder.bindings[key&&this.key?this.key+'.'+key:(this.key||key)],
                binding,
                el,
                prop,
                key,
                val;

            if(bindings) {
                for(var i=0,len=bindings.length;i<len;i++) {
                    binding=bindings[i];
                    el=binding.el;
                    prop=binding.prop;

                    if(typeof prop!=='string') {
                        val=prop.filter(Filter,this,value,key,el);
                        prop=prop.prop;
                    } else
                        val=value;

                    this._setProp(el,prop,val);
                }
            }
            return this;
        },

        _syncOwnView: function () {
            if(this.root!=this) {
                this._syncView('',this.data);
                if(this.created&&this.parent instanceof Model)
                    this.parent.trigger('change:'+this._key,this.data);

                if(this.parent.needUpdateView)
                    this.parent._syncOwnView();
            }
            return this;
        },

        _setProp: function (el,prop,val) {
            if(typeof el==='number') {
                $filterEl(this.$el,'[sn-id="'+el+'"]').each(function () {
                    setElement(this,prop,val);
                });
            } else {
                setElement(el,prop,val);
            }
        },

        get: function (key) {
            if(typeof key=='string'&&key.indexOf('.')!= -1) {
                key=key.split('.');
            }
            if($.isArray(key)) {
                var model=this;
                for(var i=0,len=key.length;i<len;i++) {
                    if(model instanceof Model)
                        model=model.model[key[i]];
                    else if(model instanceof Collection)
                        model=model.models[key[i]];
                    else
                        return null;
                }
                return model;
            }
            return this.model[key];
        },

        set: function (key,val) {
            var self=this,
                origin,
                changed,
                attrs,
                model=this.model;

            self.needUpdateView=false;

            if($.isPlainObject(key)) {
                attrs=key;
            } else if(typeof val=='undefined') {
                val=key,key='';

                if(this.parent) {
                    this.parent.data[this.parent.models.indexOf(this)]=val;
                }
                this.data=val;
                this._syncOwnView();
                return;

            } else {
                (attrs={})[key]=val;
            }

            var collections=[],
                collection,
                value,
                changed=false;

            for(var attr in attrs) {
                origin=model[attr];
                value=attrs[attr];

                if(origin!==value) {
                    var keys=attr.split('.');
                    if(keys.length>1) {
                        key=keys.pop();
                        model=this;
                        for(var i=0,len=keys.length;i<len;i++) {
                            attr=keys[i];
                            if(model instanceof Model)
                                model=model.model[attr];
                            else if(model instanceof Collection)
                                model=model.models[attr];
                            else
                                model=model[attr]=new Model({},attr,model,model.$el);
                        }
                        model.set(key,value);
                    } else if(origin instanceof Model) {
                        origin.set(value);

                    } else if(origin instanceof Collection) {
                        if(!$.isArray(value)) {
                            throw new Error('[Array to '+(typeof value)+' error]不可改变'+attr+'的数据类型');
                        }
                        origin.set(value);

                    } else {
                        this.data[attr]=value;

                        if($.isPlainObject(value)) {
                            model[attr]=new Model(value,attr,this,this.$el);

                        } else if($.isArray(value)) {
                            model[attr]=new Collection;
                            collections.push(attr);

                        } else {
                            model[attr]=value;
                            this._syncView(attr,value);
                            if(this.created) this.trigger('change:'+attr,value);
                        }
                    }

                    if(!changed) changed=true;
                }
            }

            for(var i=0,len=collections.length;i<len;i++) {
                key=collections[i];
                collection=model[key];

                model[key].constructor(this.data[key],key,this);
            }

            if(changed) {
                if(this.root!=this) {
                    this._syncOwnView();
                }
            }

            self.needUpdateView=true;

            return this;
        },

        toJSON: function () {
            return $.extend(true,{},this.data);
        }
    };

    var getValue=function (data,names) {
        if(typeof names==='string') names=names.split('.');
        for(var i=0,len=names.length;i<len;i++) {
            data=data[names[i]];
        }
        return data;
    };

    var Repeat=function (options,collection) {
        this.list=[];
        this.collection=collection;

        $.extend(this,options);

        if(!this.placeHolder&&collection.parent.$el)
            this.placeHolder=collection.parent.$el.find('[sn-placeholder="'+this.placeHolderName+'"]')[0];
    }

    Repeat.prototype={
        filter: function (data) {
            var filter=this.filterName;
            var comparator=this.comparator;

            var flag=true;

            if(filter) {
                filter=this.getValue(filter);

                if(!filter) return true;

                if(comparator=='true') {
                    comparator=true;
                }

                switch(typeof filter) {
                    case 'function':
                        flag=filter(data);
                        break;
                    case 'object':
                        var val;
                        for(var key in data) {
                            val=data[key];

                            if(typeof val=='string') {
                            }
                        }
                        break;
                    case 'string':
                        break;
                    default:
                        flag=data;
                        break;
                }
            }

            return flag;
        },

        sort: function (orderBy,reverse) {
            if(reverse!=this.reverse) {
            }
        },

        getValue: function (name) {
            var names=name.split('.');
            var alias=this.modelAlias[names[0]];

            if(alias) {

            } else {
                return getValue(this.collection.root.data,name);
            }
        },

        get: function (model) {
            for(var i=this.list.length-1;i>=0;i--) {
                if(this.list[i].model==model) {
                    return this.list[i];
                }
            }
        },

        add: function (model,el,useFragment) {

            var list=this.list;
            var orderBy=this.orderBy;
            var reverse=this.reverse;
            var item={
                model: model,
                el: el
            };

            this.list.push(item);

            if(orderBy) {
            }

            if(this.filter(model.data)) {
                if(this.fragment) {
                    this.fragment.appendChild(el);

                } else {
                    this.placeHolder.parentNode.insertBefore(el,this.placeHolder);
                }
            }

        },

        remove: function (model) {
            for(var i=this.list.length-1;i>=0;i--) {
                if(this.list[i].model==model) {
                    this.list.splice(i,1);
                    break;
                }
            }
        }
    }

    var Collection=function (data,key,parent) {
        if(!data) return;

        this.models=[];
        this.data=[];
        this.key=key;
        this._key=key;
        this.repeats=[];

        this.parent=parent;
        if(parent.key)
            this.key=parent.key+"."+this.key;

        this.root=parent.root;
        var repeats=this.root.finder.repeats[this.key];

        var item,
            repeat;

        if(repeats) {
            for(var i=0,len=repeats.length;i<len;i++) {
                repeat=new Repeat(repeats[i],this);

                this.repeats.push(repeat);
            }
        }

        parent.data[key]=this.data;

        this.set(data);
    };

    Collection.prototype={
        constructor: Collection,

        model: Model,

        forEach: function (fn) {
            var model;
            var $els;

            for(var i=0,len=this.models.length;i<len;i++) {
                model=this.models[i];

                fn.call(this,model,i);
            }
        },

        _redraw: function () {
            for(var i=0,len=this.models.length;i<len;i++) {
                model=this.models[i];

                if(this.repeats) {
                    var repeat;

                    for(var i=0,len=this.repeats.length;i<len;i++) {
                        repeat=this.repeats[i];

                        if(!repeat.get(model)) {

                            var el=item.template.cloneNode(true);
                            var $el=$(el);

                            el.snModel=model;
                            repeat.add(model,el);

                            model.$el.push(el);
                        }
                    }
                }
                model._redraw();
            }

        },

        append: function (collection) {
            this.fragment(function () {
                for(var i=0,len=collection.length;i<len;i++) {
                    this.add(collection[i],true);
                }
            });
        },

        add: function (data,useFragment) {
            this.needUpdateView=false;
            var $els;
            var model=new this.model();

            this.models.push(model);
            this.data.push(data);

            if(this.repeats) {
                var item;

                for(var i=0,len=this.repeats.length;i<len;i++) {
                    item=this.repeats[i];

                    var el=item.template.cloneNode(true);
                    var $el=$(el);

                    el.snModel=model;
                    item.add(model,el);

                    if(!$els) $els=$el;
                    else $els=$els.add($el);
                }
            }
            model.constructor(data,this.key,this,$els);

            if(!useFragment) {
                this._syncOwnView();
            }
            this.needUpdateView=true;
            return model;
        },

        _syncOwnView: function () {
            this.parent._syncView(this._key,this.data);
            if(this.created)
                this.parent.trigger('change:'+this._key,this.data);

            if(this.parent.needUpdateView) {
                this.parent._syncOwnView();
            }
            return this;
        },

        fragment: function (fn) {
            for(var i=0,n=this.repeats.length;i<n;i++) {
                this.repeats[i].fragment=document.createDocumentFragment();
            }

            fn.call(this);

            var item;
            for(var i=0,n=this.repeats.length;i<n;i++) {
                item=this.repeats[i];
                item.placeHolder.parentNode.insertBefore(item.fragment,item.placeHolder);
                item.fragment=null;
            }
        },

        set: function (data) {
            this.needUpdateView=false;
            this.fragment(function () {

                var item,
                    len=data.length,
                    length=this.models.length;

                if(length>len) {
                    for(var i=length-1;i>=len;i--) {
                        this.remove(i,true);
                    }
                }

                for(var i=0;i<len;i++) {
                    item=data[i];

                    if(i<length) {
                        this.models[i].set(item);
                    }
                    else {
                        this.add(item,true);
                    }
                }
            });
            this.needUpdateView=true;
        },

        get: function (i) {
            return this.models[i];
        },

        remove: function (i,useFragment) {
            var item,
                el;

            if(typeof i!='number') {
                i=this.models.indexOf(i);
            }

            if(this.repeats) {
                for(var j=0,len=this.repeats.length;j<len;j++) {
                    item=this.repeats[j];

                    el=item.list[i].el;
                    el.parentNode.removeChild(el);
                    item.list.splice(i,1);
                }
                this.models.splice(i,1);
                this.data.splice(i,1);
                if(!useFragment) {
                    this._syncOwnView();
                }
            }
        }
    };

    var ViewModel=function ($el,data) {
        if(!$el) return;
        if(this.created) return;

        this.data={};
        this.events=[];
        this.root=this;
        this.model={};
        this.key='';

        this.load($el);
        this.set(data);

        this.created=true;
    };

    ViewModel.prototype=Object.create(Model.prototype);

    $.extend(ViewModel.prototype,{
        constructor: ViewModel,

        load: function ($el) {
            var self=this;
            this.finder=new Finder($el);
            this.$el=$el.on('input change','[sn-model]',$.proxy(this._inputChange,this));
            this.bindEvents();
            return this;
        },

        handleEvent: function (e) {
            var target=e.currentTarget;
            var event=e.type;
            var eventid=target.getAttribute('sn-on');
            var events=this.finder.events[eventid];
            var fn;

            if(events) {
                fn=events[event];
                var ctx,
                    index,
                    model;
                if(typeof fn=='string') {
                    model=fn;
                    fn=this.get(fn);
                    ctx=this;
                } else {
                    ctx=$(target).closest('[sn-repeat-name="'+fn.collection+'"]')[0].snModel;
                    model=fn.variable;
                    fn=ctx.get(model);
                }
                index=model.lastIndexOf('.');
                fn&&fn.call((index== -1?ctx:ctx.get(model.substr(0,index))).data,e);
            }
        },

        bindEvents: function () {
            var self=this
            for(var i=0,len=this.finder.eventNames.length;i<len;i++) {
                var event=this.finder.eventNames[i]
                if(this.events.indexOf(event)== -1) {
                    this.$el.on(event,'[sn-on]',$.proxy(this.handleEvent,this));
                    this.events[this.events.length]=event;
                }
            }
        },

        scan: function ($el) {
            this.finder.scan($el);
            this._redraw();
            this.bindEvents();
        },

        append: function (selector,$el) {
            if(!$el) $el=selector,selector=this.$el;
            else selector=this.$el.find(selector);

            selector.append($el);
            this.scan($el);
        },

        preppend: function (selector,$el) {
            if(!$el) $el=selector,selector=this.$el;
            else selector=this.$el.find(selector);

            selector.preppend($el);
            this.scan($el);
        },

        before: function (selector,$el) {
            this.$el.find(selector).before($el);
            this.scan($el);
        },

        after: function (selector,$el) {
            this.$el.find(selector).after($el);
            this.scan($el);
        },

        _inputChange: function (e) {
            var target=e.currentTarget;
            var modelName=target.getAttribute('sn-model');
            var collectionName=target.getAttribute('sn-collection');

            if(!collectionName) {
                this.set(modelName,target.value);
            } else {
                $(target).closest('[sn-repeat-name="'+collectionName+'"]')[0].snModel.set(modelName,target.value);
            }
        },

        destory: function () {
            this.$el.off('input change','[sn-model]',this._inputChange);
        }
    });

    ViewModel.extend=Model.extend=Collection.extend=util.extend;

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
    exports.ViewModel=ViewModel;

    exports.filter=exports.Filter=Filter;
});