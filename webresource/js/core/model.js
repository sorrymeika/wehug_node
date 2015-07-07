define(function (require,exports,module) {

    var $=require('$'),
        util=require('util'),
        Base=require('./base'),
        Event=require('./event'),
        slice=Array.prototype.slice;



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
            return (data instanceof Model||data instanceof Collection)?JSON.stringify(data.data):JSON.stringify(json);
        },
        join: function (arr,split) {
            return arr.join(split);
        },
        lowercase: function (str) {
            return str.toLowerCase();
        },
        uppercase: function (str) {
            return str.toUpperCase();
        }
    };

    var rfilter=/\s*\|\s*([a-zA-Z_1-9]+)((?:\s*\:\s*([a-zA-Z_1-9\.]+|\'[^\']+?\'))*)/g;
    var rparams=/\s*\:\s*([a-zA-Z_1-9\.]+|\'[^\']+?\')/g;
    var rdatakey=/([a-zA-Z_1-9]+)(?=\.|$)/g

    var filterFn=function (filters,listItem) {
        var value;
        var code='';
        var before='';

        filters.replace(rfilter,function (match,filter,parameters) {
            code+='value=Filter.'+filter+'(value';

            parameters.replace(rparams,function (match,param) {
                if(param[0]=='\'')
                    code+=','+param;

                else if(param==listItem.modelName) {
                    code+=',model.data';

                } else {
                    var alias=listItem.modelName;
                    if(param.indexOf(alias+'.')==0) {
                        code+=',model.data'+param.substr(alias.length);

                    } else {
                        var arrParam=param.split('.');
                        alias=listItem.modelAlias[arrParam[0]];
                        if(alias) {
                            arrParam.shift();
                            param=arrParam.join('.');
                            code+=',(function(){var parent=model.parent.parent;while(parent){if(parent.key=="'+alias+'"){ return parent.data.'+param+'; } parent=parent.parent.parent; } })()';

                        } else {
                            code+=',model.root.data.'+param;
                        }
                    }
                }
            });

            code+=');';
        });

        code+='return value;';

        return new Function('Filter','model','value',code);
    };

    var PropFilter=function () {
    }

    var rcollection=/([a-zA-Z_1-9-]+)\s+in\s+([a-zA-Z_1-9-]+(\.[a-zA-Z_1-9-]+){0,})/g;
    var rbinding=/\b([a-zA-Z_1-9-]+)\s*\:\s*([a-zA-Z_1-9]+)((?:\.[a-zA-Z_1-9]+)*)((?:\s*\|\s*[a-zA-Z_1-9]+(?:\s*\:\s*(?:[a-zA-Z_1-9\.]+|'[^']+'))*)*)(\s|,|$)/g;

    var filterBindings=function ($el) {
        return $el.filter('[sn-binding],[sn-model]').add($el.find('[sn-binding],[sn-model]'));
    };

    var Finder=function ($elem) {
        var self=this;
        var repeats=this.repeats={};
        var bindings=this.bindings={};
        var collection;
        var $el;

        var count=0;

        var $repeats=$elem.filter('[sn-repeat]').add($elem.find('[sn-repeat]')).each(function () {
            $el=$(this);
            var el=this;
            var repeat=this.getAttribute('sn-repeat');
            var parents=$el.parents('[sn-repeat-model]');
            var modelAlias={};

            parents.each(function () {
                modelAlias[this.getAttribute('sn-repeat-model')]=this.getAttribute('sn-repeat-name');
            });

            repeat.replace(rcollection,function (match,modelName,collectionName) {
                var names=collectionName.split('.');
                var namesLength=names.length;
                var varName;
                var alia;

                if(namesLength!==1) {
                    varName=names[0];
                    alia=modelAlias[varName];

                    if(alia) {
                        names[0]=alia;
                        collectionName=names.join('.');
                    }
                }

                el.setAttribute('sn-repeat-model',modelName);
                el.setAttribute('sn-repeat-name',collectionName);

                var placeHolder=document.createElement('script');
                placeHolder.setAttribute('type','text/placeholder');

                var placeHolderName;
                var listItem={
                    orderBy: '',
                    modelName: modelName,
                    modelAlias: modelAlias,
                    template: el,
                    elements: []
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

                filterBindings($el).each(function () {
                    var el=this;
                    var binding=this.getAttribute('sn-binding');
                    var model=this.getAttribute('sn-model');

                    el.setAttribute("sn-id",++count);

                    binding.replace(rbinding,function (match,prop,name,key,filters) {

                        if(name==listItem.modelName) {
                            name=collectionName+key;

                        } else {
                            alias=listItem.modelAlias[name];
                            if(alias) {
                                name=alias+key;
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

                });
            }
        }

        filterBindings($elem).each(function () {
            var binding=this.getAttribute('sn-binding');
            var model=this.getAttribute('sn-model');
            var el=this;

            binding.replace(rbinding,function (match,prop,name,key,filters) {
                name+=key;
                if(filters) {
                    prop={
                        prop: prop,
                        filters: filters,
                        alias: ''
                    };
                }
                var bounds=bindings[name];

                if(!bounds) {
                    bounds=bindings[name]=[];
                }
                bounds.push({
                    el: el,
                    prop: prop
                });
            });
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
        this.bindings={};

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
            this.key=parent.key;
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

        _asyncView: function (key,val) {
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
                        val=prop.filter(Filter,this,val);
                        prop=prop.prop;
                    }
                    if(typeof el==='number') {
                        this.$el.find('[sn-id="'+el+'"]').each(function () {
                            setElement(this,prop,val);
                        });
                    } else {
                        setElement(el,prop,val);
                    }
                }
            }
        },

        get: function (key) {
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
                this._asyncView('',val);
                return;

            } else {
                (attrs={})[key]=val;
            }

            var collections=[],
                collection,
                value;

            for(var attr in attrs) {
                origin=model[attr];
                value=attrs[attr];

                if(origin!==value) {
                    if(origin==undefined) {
                        if($.isPlainObject(value)) {
                            model[attr]=new Model(value,attr,this,this.$el);

                        } else if($.isArray(value)) {
                            model[attr]=new Collection;
                            collections.push(attr);

                        } else
                            model[attr]=value;

                        this.data[attr]=value;

                    } else if(origin instanceof Model||origin instanceof Collection) {
                        origin.set(value);

                    } else {
                        model[attr]=value;
                        this.data[attr]=value;
                    }
                    this._asyncView(attr,value);

                    this.trigger('change:'+attr,value);
                }
            }

            for(var i=0,len=collections.length;i<len;i++) {
                key=collections[i];
                collection=model[key];

                model[key].constructor(this.data[key],key,this);
            }

            return this;
        },

        toJSON: function () {
            return $.extend(true,{},this.data);
        }
    };

    var Collection=function (data,key,parent) {
        if(!data) return;

        this.models=[];
        this.data=[];
        this.key=key;

        this.parent=parent;
        if(parent.key)
            this.key=parent.key+"."+this.key;

        this.root=parent.root;
        this.root.finder&&(this.list=$.extend(true,[],this.root.finder.repeats[this.key]));

        var listItem;
        for(var j=0,len=this.list.length;j<len;j++) {
            listItem=this.list[j];
            listItem.placeHolder=this.parent.$el.find('[sn-placeholder="'+listItem.placeHolderName+'"]')[0];
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

        add: function (data,autoAppend) {
            var $els;

            if(this.list) {
                var item;

                for(var i=0,len=this.list.length;i<len;i++) {
                    item=this.list[i];

                    var el=item.template.cloneNode(true);
                    var $el=$(el);

                    item.elements.push(el);

                    if(autoAppend===false) {
                        item.fragment.appendChild(el);

                    } else {
                        item.placeHolder.parentNode.insertBefore(el,item.placeHolder);
                    }

                    if(!$els) $els=$el;
                    else $els=$els.add($el);
                }
            }
            var model=new Model(data,this.key,this,$els);
            this.models.push(model);
            this.data.push(data);
            return model;
        },

        fragment: function (fn) {
            for(var i=0,n=this.list.length;i<n;i++) {
                this.list[i].fragment=document.createDocumentFragment();
            }

            fn.call(this);

            var item;
            for(var i=0,n=this.list.length;i<n;i++) {
                item=this.list[i];
                item.placeHolder.parentNode.insertBefore(item.fragment,item.placeHolder);
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

            if(this.list) {
                for(var j=0,len=this.list.length;j<len;j++) {
                    item=this.list[j];

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
        this.bindings={};
        this.key='';

        this.load($el);
        if(data)
            this.set(data);
    };

    ViewModel.prototype=Object.create(Model.prototype);

    $.extend(ViewModel.prototype,{
        constructor: ViewModel,

        load: function ($el) {
            this.finder=new Finder($el);
            this.$el=$el;
            return this;
        }
    });

    ViewModel.extend=Model.extend=Collection.extend=util.extend;

    var $el=$('<div sn-binding="test:name,title:node.test,tt:node.deep.end">\
            <div sn-repeat="item in data" class="item">\
                <img sn-binding="src:item.picture|lowercase:asdf.cc:\'asdf\'|uppercase,alt:item.alt|uppercase"/>\
                <div sn-binding="data:item.content">测试<text sn-binding="html:item.content"></text>一下</div>\
                <div sn-repeat="item1 in item.children" class="item1">\
                    <img sn-binding="src:item.picture,alt:item1.title|uppercase:item.id"/>\
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
            alt: 'zzzz',
            content: 'asdf',
            children: [{
                title: 'asdf',
                date: '2000'
            }]
        });
    }

    vm.set({
        name: 'asdf',
        data: data,
        asdf: {
            cc: 'as'
        },
        node: {
            test: 'ccc',
            deep: {
                end: 1
            }
        }
    });
    console.log(Date.now()-now);

    return;

    vm.get('data').get(0).set({
        picture: 'a',
        alt: 'b'
    });

    console.log(vm.get('data').get(0))

    /*

    var Item=Model.extend({

    mapping: {
    picture: 'xxx',
    alt: 'zzzz',
    content: 'asdf'
    }
    })

    var List=Collection.extend({

    model: Item
    })

    var Index=Model.extend({

    mapping: {
    success: false,
    msg: ''
    }
    })


    var Book=Model.extend({
    id: 'id',

    url: '/api/book/{id}',

    mapping: {
    id: 0,
    title: '',
    author: ''
    }
    });

    var Order=Model.extend({
    id: 'orderid',

    url: '/api/order/{id}',

    mapping: {
    orderid: 0,
    code: '',
    book: Book
    }
    });

    var book=new Book({
    title: 'title1',
    author: "sl1"
    });

    var books=new Book([{
    title: 'title',
    author: "sl"
    },{
    title: 'title1',
    author: "sl1"
    }]);

    new Order({
    code: '123ssdsf',
    book: {
    title: 'title1',
    author: "sl1"
    }
    });


    */

    exports.Model=ViewModel;
});