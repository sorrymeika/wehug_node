define(function(require,exports,module) {

    var $=require('$'),
        util=require('util'),
        Base=require('./base'),
        Event=require('./event'),
        slice=Array.prototype.slice;



    var http=function(url,method,data,success,error,ctx) {
        if(typeof data==='function') ctx=error,error=success,success=data,data=null;

        $.ajax({
            url: url,
            type: method,
            data: data,
            dataType: 'json',
            success: function(res) {
                success.call(ctx,res);
            },
            error: function(res) {
                error.call(ctx,res);
            }
        });
    };

    $.extend(http,{

        get: function(success,error) {
            http(this.url,'GET',function(res) {
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

        post: function(success,error) {
            var data=this.toJSON();

            http(this.url,'POST',data,function(res) {

                if(this.parent&&this.parent instanceof Collection) {
                    this.parent.add(data);
                }

                success.call(this,res,data);
            },error,this);
        },

        put: function(success,error) {
            http(this.url,'PUT',this.toJSON(),success,error,this);
        },

        'delete': function(success,error) {
            var self=this;

            http(this.url,'DELETE',data,function(res) {

                if(this.parent&&this.parent instanceof Collection) {
                    this.parent.remove(data);
                }

                success.call(this,res,data);
            },error,this);
        }
    });


    var Filter={
        date: util.formatDate,
        json: function(data) {
            return (data instanceof Model||data instanceof Collection)?JSON.stringify(data.data):JSON.stringify(json);
        },
        join: function(arr,split) {
            return arr.join(split);
        },
        lowercase: function(str) {
            return str.toLowerCase();
        },
        uppercase: function(str) {
            return str.toUpperCase();
        }
    };

    var rfilter=/\s*\|\s*([a-zA-Z_1-9]+)((?:\s*\:\s*([a-zA-Z_1-9\.]+|\'[^\']+?\'))*)/g;
    var rparams=/\s*\:\s*([a-zA-Z_1-9\.]+|\'[^\']+?\')/g;
    var rdatakey=/([a-zA-Z_1-9]+)(?=\.|$)/g

    var filterValue=function(model,key,filters,alias,bindEvent) {
        var value=bindEvent?model.data[key]:key;

        filters.replace(rfilter,function(match,filter,parameters) {
            var args=[value];
            parameters.replace(rparams,function(match,param) {
                if(param[0]=='\'')
                    args.push(eval(param));

                else if(param==alias) {
                    args.push(model.data);

                } else {
                    var eventBind,
                        prev,
                        arg,
                        start=1;

                    if(param.indexOf(alias+'.')==0) {
                        start=0;
                        eventBind=model;
                    } else {
                        eventBind=model.root;
                    }
                    arg=eventBind.data;

                    param.replace(rdatakey,function(match,proto) {
                        if(start>=1) {
                            if(prev) {
                                eventBind=eventBind.get(proto);
                            }
                            prev=proto;
                            arg=arg?arg[proto]:undefined;
                        }
                        start++;
                    });

                    if(bindEvent&&eventBind) {
                        eventBind.on('change:'+prev,function(e,val) {
                            filterValue(model,val,filters,alias);
                        });
                    }

                    args.push(arg);
                }
            });
            value=Filter[filter].apply(Filter,args);
        });

        return value;
    };

    var rcollection=/([a-zA-Z_1-9-]+)\s+in\s+([a-zA-Z_1-9-]+(\.[a-zA-Z_1-9-]+){0,})/g;
    var rbinding=/\b([a-zA-Z_1-9-]+)\s*\:\s*([a-zA-Z_1-9]+)((?:\.[a-zA-Z_1-9]+)*)((?:\s*\|\s*[a-zA-Z_1-9]+(?:\s*\:\s*(?:[a-zA-Z_1-9\.]+|'[^']+'))*)*)(\s|,|$)/g;

    var Finder=function($elem) {
        var self=this;
        var repeats=this.repeats={};
        var bindings=this.bindings={};
        var collection;
        var $el;

        var $repeats=$elem.filter('[data-repeat]').add($elem.find('[data-repeat]')).each(function() {
            $el=$(this);
            var el=this;
            var repeat=this.getAttribute('data-repeat');
            var parents=$el.parents('[data-repeat-model]');
            var modelAlias={};

            parents.each(function() {
                modelAlias[this.getAttribute('data-repeat-model')]=this.getAttribute('data-repeat-name');
            });

            repeat.replace(rcollection,function(match,modelName,collectionName) {
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

                el.setAttribute('data-repeat-model',modelName);
                el.setAttribute('data-repeat-name',collectionName);

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
                placeHolder.setAttribute('data-placeholder',placeHolderName);

                el.parentNode.insertBefore(placeHolder,el);
            });

        }).remove();

        for(var collectionName in repeats) {
            var list=repeats[collectionName];
            var listItem;

            for(var i=0,len=list.length;i<len;i++) {
                listItem=list[i];
                $el=$(listItem.template);
                console.log(listItem);

                var alias;

                $el.filter('[data-binding]').add($el.find('[data-binding]')).each(function() {
                    var el=this;
                    var binding=this.getAttribute('data-binding');
                    console.log(binding);

                    binding.replace(rbinding,function(match,prop,name,key,filters) {
                        console.log(collectionName,name,listItem.modelName);

                        if(name==listItem.modelName) {
                            name=collectionName+key;

                        } else {
                            alias=listItem.modelAlias[name];
                            if(alias) {
                                name=alias+key;
                            }
                        }
                        console.log(name,alias);

                        if(filters) {
                            prop={
                                prop: prop,
                                filters: filters,
                                alias: alias
                            };
                        }
                        var bounds=bindings[name];

                        if(!bounds) {
                            bounds=bindings[name]=[];
                        }

                        bounds.push({
                            el: listItem,
                            prop: prop
                        });
                    });

                });
            }
        }

        $elem.filter('[data-binding]').add($elem.find('[data-binding]')).each(function() {
            var binding=this.getAttribute('data-binding');
            var el=this;

            binding.replace(rbinding,function(match,prop,name,key,filters) {
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

        console.log(this.bindings);
    };

    var setElement=function(el,prop,value) {

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


    var Model=function(data,key,parent,$el) {
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

        _asyncView: function(key,val) {

            var bindings=this.bindings[key],
                binding,
                el,
                prop,
                key;

            if(bindings) {
                for(var i=0,len=bindings.length;i<len;i++) {
                    binding=bindings[i];
                    el=binding[0];

                    for(var j=1,n=binding.length;j<n;j++) {
                        prop=binding[j];

                        if(typeof prop!=='string') {
                            val=filterValue(this,val,prop.filters,prop.alias);
                            prop=prop.prop;
                        }

                        setElement(el,prop,val);
                    }
                }
            }
        },

        get: function(key) {
            return this.model[key];
        },

        set: function(key,val) {
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
                this._asyncView('$self',val);
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

        toJSON: function() {
            return $.extend(true,{},this.data);
        }
    };

    var Collection=function(data,key,parent) {
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
            listItem.placeHolder=this.parent.$el.find('[data-placeholder="'+listItem.placeHolderName+'"]')[0];
        }

        parent.data[key]=this.data;

        this.set(data);
    };

    Collection.prototype={
        constructor: Collection,

        model: Model,

        forEach: function(fn) {
            var model;

            for(var i=0,len=this.models.length;i<len;i++) {
                model=this.models[i];

                fn(model,i);
            }
        },

        add: function(data,autoAppend) {
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

            if($els) {
                var $bindings=$els.find('[data-binding]');
            }

            var model=new Model(data,this.key,this,$els);
            this.models.push(model);
            this.data.push(data);

            return model;
        },

        fragment: function(fn) {
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

        set: function(data) {
            this.fragment(function() {

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

                    if(i<length)
                        this.models[i].set(item);
                    else {
                        this.add(item,false);
                    }
                }

            });
        },

        get: function(i) {
            return this.models[i];
        },

        remove: function(i) {
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

    var ViewModel=function($el,data) {
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

        load: function($el) {
            this.finder=new Finder($el);
            this.$el=$el;
            return this;
        }
    });

    ViewModel.extend=Model.extend=Collection.extend=util.extend;

    var $el=$('<div data-binding="test:name,title:node.test,tt:node.deep.end">\
            <div data-repeat="item in data" class="item">\
                <img data-binding="src:item.picture|lowercase:asdf.cc:\'asdf\'|uppercase,alt:item.alt|uppercase"/>\
                <div data-binding="data:item.content">测试<text data-binding="html:item.content"></text>一下</div>\
                <div data-repeat="item1 in item.children" class="item1">\
                    <img data-binding="src:item.picture,alt:item1.title|uppercase"/>\
                    <div data-binding="data:item1.content">测试1<text data-binding="html:item1.title"></text>一下1</div>\
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