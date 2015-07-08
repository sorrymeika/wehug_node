define(function (require,exports,module) {

    var $=require('$'),
        util=require('util'),
        Base=require('./base'),
        Event=require('./event')


    var http=function (url,method,data,success,error,ctx) {
        if(typeof data==='function') ctx=error,error=success,success=data,data=null;

        $.ajax({
            url: url,
            type: method,
            data: data,
            dataType: 'json',
            success: function (res) {
                success.call(ctx,res);
            },
            error: function (res) {
                error.call(ctx,res);
            }
        });
    };

    $.extend(http,{

        get: function (success,error) {
            http(this.url,'GET',function (res) {
                var $el;
                if(this.model) {
                    this.set(res);

                } else {
                    $el=$(this.template.html(res));

                    this.generate($el,res);
                }

                success.call(this,res,$el);
            },error,this);
        },

        post: function (success,error) {
            var data=this.toJSON();

            http(this.url,'POST',data,function (res) {

                if(this.parent&&this.parent instanceof Collection) {
                    this.parent.add(data);
                }

                success.call(this,res,data);
            },error,this);
        },

        put: function (success,error) {
            http(this.url,'PUT',this.toJSON(),success,error,this);
        },

        'delete': function (success,error) {
            var self=this;

            http(this.url,'DELETE',data,function (res) {

                if(this.parent&&this.parent instanceof Collection) {
                    this.parent.remove(data);
                }

                success.call(this,res,data);
            },error,this);
        }
    });

    var Filter={
        date: util.formatDate,
        json: function (data) {
            return (data instanceof Model||data instanceof Collection)?JSON.stringify(data.data):JSON.stringify(data);
        },
        join: function (arr,split) {
            return (arr instanceof Collection)?arr.data.join(split):arr.join(split);
        },
        lowercase: function (str) {
            return str.toLowerCase();
        },
        uppercase: function (str,a,b) {
            return str.toUpperCase()+a+b;
        },
        _listenEvent: function (parent,model,key,el,self,param,count) {
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

    var rfilter=/\s*\|\s*([a-zA-Z_1-9]+)((?:\s*\:\s*([a-zA-Z_1-9\.]+|\'[^\']+?\'))*)/g;
    var rparams=/\s*\:\s*([a-zA-Z_1-9\.]+|\'[^\']+?\')/g;


    var filterFn=function (filters,listItem) {
        var value;
        var code='var self=this;';
        var before='';
        var count=0;

        filters.replace(rfilter,function (match,filter,parameters) {
            code+='value=Filter.'+filter+'(value';

            parameters.replace(rparams,function (match,param) {
                if(param[0]=='\'') {
                    code+=','+param;

                } else if(!listItem) {
                    code+=',model.root.data.'+param;
                    before+='Filter._listenEvent(model.root,model,key,el,this,"'+param+'",'+(count++)+');';

                } else if(param==listItem.alias) {
                    code+=',model.data';
                    before+='Filter._listenEvent(model,model,key,el,this,"",'+(count++)+');';

                } else {
                    var alias=listItem.alias;
                    if(param.indexOf(alias+'.')==0) {
                        code+=',model.data'+param.substr(alias.length);
                        before+='Filter._listenEvent(model,model,key,el,this,"'+param.substr(alias.length+1)+'",'+(count++)+');';

                    } else {
                        var arrParam=param.split('.');
                        alias=listItem.modelAlias[arrParam[0]];
                        if(alias) {
                            arrParam.shift();
                            param=arrParam.join('.');
                            code+=',(function(){parent=model.parent.parent;while(parent){if( parent.key=="'+alias+'"){ Filter._listenEvent(parent,model,key,el,self,"'+param+'",'+(count++)+'); return parent.data.'+param+'; } parent=parent.parent.parent; } })()';

                        } else {
                            code+=',model.root.data.'+param;
                            before+='Filter._listenEvent(model.root,model,key,el,this,"'+param+'",'+(count++)+');';
                        }
                    }
                }
            });

            code+=');';
        });

        code+='return value;';

        return new Function('Filter','model','value','key','el',before+code);
    };

    var rcollection=/([a-zA-Z_1-9]+)\s+in\s+([a-zA-Z_1-9]+(?:\.[a-zA-Z_1-9]+){0,})(?:\s*\|\s*filter\s*\:\s*([a-zA-Z_1-9\.]+)(?:\s*\:\s*([a-zA-Z_1-9\.]+)){0,1}){0,1}(?:\s*\|\s*orderBy\s*\:\s*([a-zA-Z_1-9\.]+)(?:\s*\:\s*([a-zA-Z_1-9\.]+)){0,1}){0,1}/g;
    var rbinding=/\b([a-zA-Z_1-9-]+)\s*\:\s*([a-zA-Z_1-9]+)((?:\.[a-zA-Z_1-9]+)*)((?:\s*\|\s*[a-zA-Z_1-9]+(?:\s*\:\s*(?:[a-zA-Z_1-9\.]+|'[^']+'))*)*)(\s|,|$)/g;

    var filterBindings=function ($el,withModel) {
        var selector=withModel===true?'[sn-binding],[sn-model]':'[sn-binding]';
        return $el.filter(selector).add($el.find(selector));
    };

    var Finder=function ($elem) {
        var self=this;
        var repeats=this.repeats={};
        var bindings=this.bindings={};
        var models=this.models={};
        var collection;
        var $el;

        var count=0;

        var $repeats=$elem.filter('[sn-repeat]').add($elem.find('[sn-repeat]')).each(function () {
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

                var alias;

                filterBindings($el,true).each(function () {
                    var el=this;
                    var binding=this.getAttribute('sn-binding');
                    var model=this.getAttribute('sn-model');
                    var keys;
                    var key;

                    el.setAttribute("sn-id",++count);

                    if(model) {
                        keys=model.split('.');
                        key=keys.shift();

                        if(key==listItem.alias) {
                            this.setAttribute('sn-collection',collectionName);
                            this.setAttribute('sn-model',keys.join('.'));

                        } else {
                            alias=listItem.modelAlias[key];
                            if(alias) {
                                this.setAttribute('sn-collection',alias);
                                this.setAttribute('sn-model',keys.join('.'));
                            }
                        }
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

        filterBindings($elem).each(function () {
            var binding=this.getAttribute('sn-binding');
            var el=this;
            var bounds;

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
        });

        console.log(bindings)
    };

    var setElement=function (el,prop,value) {

        switch(prop) {
            case 'text':
                el.innerHTML=util.encodeHTML(value);
                break;
            case 'html':
                el.innerHTML=value;
                break;
            default:
                el[prop]=value;
                break;
        }
    };


    var Model=function (data,key,parent,$el) {
        if(!data) return;

        var model={},
            value;

        this.$el=$el;
        this.model=model;

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
    };

    Model.prototype={
        constructor: Model,
        one: Event.one,
        on: Event.on,
        off: Event.off,
        trigger: Event.trigger,

        _syncView: function (key,val) {
            var bindings=this.root.finder.bindings[key&&this.key?this.key+'.'+key:(this.key||key)],
                binding,
                el,
                prop,
                key;

            if(bindings) {
                for(var i=0,len=bindings.length;i<len;i++) {
                    binding=bindings[i];
                    el=binding.el;
                    prop=binding.prop;

                    if(typeof prop!=='string') {
                        val=prop.filter(Filter,this,val,key,el);
                        prop=prop.prop;
                    }

                    this._setProp(el,prop,val);
                }
            }
            return this;
        },

        _syncOwnView: function () {
            if(this.root!=this) {
                this._syncView('',this.data).parent._syncOwnView();
            }
            return this;
        },

        _setProp: function (el,prop,val) {
            if(typeof el==='number') {
                this.$el.find('[sn-id="'+el+'"]').each(function () {
                    setElement(this,prop,val);
                });
            } else {
                setElement(el,prop,val);
            }
        },

        get: function (key) {
            if(typeof key!='string') {
                var model=this.model[key[0]];
                for(var i=1,len=key.length;i<len;i++) {
                    model=(model.models||model.model)[key[i]];
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

            if($.isPlainObject(key)) {
                attrs=key;
            } else if(typeof val=='undefined') {
                val=key,key='';

                if(this.parent) {
                    this.parent.data[this.parent.models.indexOf(this)]=val;
                }
                this.data=val;
                this.trigger('change',val);
                this._syncOwnView();
                return;

            } else {
                var keys=key.split('.');
                if(keys.length>1) {
                    key=keys.pop();
                    this.get(keys).set(key,val);
                    return;
                }

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
                    if(origin instanceof Model) {
                        origin.set(value);

                    } else if(origin instanceof Collection) {
                        if(!$.isArray(value)) {
                            throw new Error('[Array to '+(typeof value)+' error]不可改变'+attr+'的数据类型');
                        }
                        origin.set(value);

                    } else {
                        if($.isPlainObject(value)) {
                            model[attr]=new Model(value,attr,this,this.$el);

                        } else if($.isArray(value)) {
                            model[attr]=new Collection;
                            collections.push(attr);

                        } else
                            model[attr]=value;

                        this.data[attr]=value;
                    }
                    this._syncView(attr,value);

                    this.trigger('change:'+attr,value);

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

            for(var i=0,len=this.models.length;i<len;i++) {
                model=this.models[i];

                fn(model,i);
            }
        },

        add: function (data,useFragment) {
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
            return model;
        },

        _syncOwnView: function () {
            this.parent._syncView(this._key,this.data)._syncOwnView();
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
            this.fragment(function () {

                var item,
                    len=data.length,
                    length=this.models.length;

                if(len>length) {
                    for(var i=length-1;i>=0;i--) {
                        this.remove(i);
                    }
                }

                for(var i=0;i<len;i++) {
                    item=data[i];

                    if(i<length) {
                        this.models[i].set(item);
                    }
                    else {
                        this.add(item,false);
                    }
                }
                this._syncOwnView();
            });
        },

        get: function (i) {
            return this.models[i];
        },

        remove: function (i) {
            var item,
                el;

            if(typeof i!='number') {
                i=this.models.indexOf(i);
            }

            if(this.repeats) {
                for(var j=0,len=this.repeats.length;j<len;j++) {
                    item=this.repeats[j];

                    el=item.elements[i];
                    el.prentNode.removeChild(el);
                    item.elements.splice(i,1);
                }
                this.models.splice(i,1);
                this.data.splice(i,1);
            }
        }
    };

    var ViewModel=function ($el,data) {
        this.root=this;
        this.data={};
        this.model={};
        this.key='';

        this.load($el);
        if(data)
            this.set(data);
    };

    ViewModel.prototype=Object.create(Model.prototype);

    $.extend(ViewModel.prototype,{
        constructor: ViewModel,

        load: function ($el) {
            var self=this;
            this.finder=new Finder($el);
            this.$el=$el.on('input change','[sn-model]',function (e) {
                var target=e.currentTarget;
                var modelName=target.getAttribute('sn-model');
                var collectionName=target.getAttribute('sn-collection');

                if(!collectionName) {
                    self.set(modelName,target.value);
                } else {
                    $(target).closest('[sn-repeat-name="'+collectionName+'"]')[0].snModel.set(modelName,target.value);
                }
            });
            return this;
        }
    });

    ViewModel.extend=Model.extend=Collection.extend=util.extend;

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

        for(var i=0;i<1;i++) {
            data.push({
                test: "item"+i
            });
        }

        vm.set({
            name: 'asdf',
            data: data
        });

        vm.get('data').get(0).set({
            children: [{
                asdf: 1
            }]
        })

        console.log(Date.now()-now);
    }

    testCollectionItem();

    function testDeepCollection() {

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

        for(var i=0;i<1;i++) {
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

        vm.get('data.0.children.0'.split('.')).set({
            picture: 'a',
            alt: 'b',
            title: 'cctv'
        });

        console.log(vm.get('data').get(0))
    }


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

    exports.Model=ViewModel;

    exports.filter=exports.Filter=Filter;

    exports.http=http;
});