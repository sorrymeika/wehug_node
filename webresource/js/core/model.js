define(function(require,exports,module) {

    var $=require('$'),
        util=require('util'),
        Base=require('./base'),
        Event=require('./event'),
        slice=Array.prototype.slice;


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
                        start=1,
                        rdatakey=/([a-zA-Z_1-9]+)(?=\.|$)/g;

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


    var creator=document.createElement("DIV");
    var createElement=function(html) {
        creator.innerHTML=html;
        return creator.childNodes[0].nodeType==3?creator.childNodes[1]:creator.childNodes[0]
    }

    var template='<div data-repeat="item in data" class="item">\
                <img data-binding="src:item.picture,alt:item.alt"/>\
                <a data-binding="href:item.href">测试<text data-binding="html:item.content"></text>一下</a>\
            </div>';
    var el=createElement(template);
    var now=Date.now();

    console.log(now);

    for(var i=0;i<10000;i++) {
        createElement(template)
    }
    console.log(Date.now()-now);

    for(var i=0;i<10000;i++) {
        el.cloneNode(true);
    }
    console.log(Date.now()-now);

    var rcollection=/([a-zA-Z_1-9-]+)\s+in\s+([a-zA-Z_1-9-]+(\.[a-zA-Z_1-9-]+){0,})/g;
    var rfilter=/\s*\|\s*([a-zA-Z_1-9-]+)\s*\:\s*([a-zA-Z_1-9-]+|'[^'+]')/g;

    var Finder=function($el) {
        var repeats={};
        var collection;

        $el.filter('[data-repeat]').add($el.find('[data-repeat]')).each(function() {
            var el=this;
            var repeat=this.getAttribute('data-repeat');

            repeat.replace(rcollection,function(match,modelName,collectionName) {
                var names=collectionName.split('.');
                var namesLength=names.length;

                if(namesLength!==1) {
                    var varName=names[0];
                    var closest=$(el).closest('[data-repeat-model="'+varName+'"]');

                    if(closest.length) {
                        names[0]=closest.attr('data-repeat-name');
                        collectionName=names.join('.');
                    }
                }

                el.setAttribute('data-repeat-model',modelName);
                el.setAttribute('data-repeat-name',collectionName);

                var placeHolder=createElement('<script type="text/placeholder"></script>');
                var placeHolderName;

                if(el.parentNode) {
                    el.parentNode.insertBefore(placeHolder,el);
                    el.parentNode.removeChild(el);
                }

                var listItem={
                    orderBy: '',
                    modelName: modelName,
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
            });
        });

        return repeats;
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

    var Model=function(data,hash,parent) {
        if(!data) return;

        var model={},
            value,
            map,
            mapping=this.mapping;

        if(typeof hash==='object') parent=hash,hash=undefined;

        this.model=model;
        this.data=data;
        this.key=hash||'';
        this.root=this;

        if(parent) {
            if(parent instanceof Model) {
                this.parent=parent;
                if(parent.key)
                    this.key=parent.key+'.'+this.key;

                this.root=parent.root;

            } else if(parent instanceof Collection) {
                this.parent=parent;
                this.key=parent.key;
                this.root=parent.root;

            } else {
                this.finder=parent;
            }
        }

        for(var key in data) {
            map=mapping?mapping[key]:null;
            value=data[key];

            if((map&&map.prototype instanceof Model)||(!map&&$.isPlainObject(value))) {
                model[key]=new (map||Model)(value,key,this);

            } else if((map&&map.prototype instanceof Collection)||(!map&&$.isArray(value))) {
                model[key]=new (map||Collection)();

            } else
                model[key]=value;
        }

        var collection;

        for(var key in model) {
            collection=model[key];

            if(collection instanceof Collection) {
                collection.constructor(data[key],key,this);
            }
        }
    };

    Model.prototype={
        constructor: Model,
        one: Event.one,
        on: Event.on,
        off: Event.off,
        trigger: Event.trigger,

        template: null,

        fetch: function(url,data,success,error) {
            var self=this;

            if(typeof url==='function') error=postData,success=url,postData=null,url=this.url;
            if(typeof postData==='function') error=success,success=postData,postData=null;

            $.ajax({
                url: url,
                type: data?'POST':'GET',
                data: data,
                dataType: 'json',
                success: function(res) {
                    var $el;
                    if(self.model) {
                        self.set(res);

                    } else {
                        $el=$(self.template.html(res));

                        self.generate($el,res);
                    }

                    success.call(self,res,$el);
                },
                error: error
            });
        },

        bind: function($el,data) {
            this.finder=Finder($el);
            this.constructor(data);
        },

        scan: function($el) {
            this.finder=Finder($el);
            return this;
        },

        _scanBinding: function($el,alias) {
            var self=this;

            $el.find('[data-binding]').each(function() {
                var el=this;
                var binding=this.getAttribute('data-binding');
                var rbinding=new RegExp("\\b([a-zA-Z_1-9-]+)\\s*\\:\\s*"+(alias||'')+"((?:\\.[a-zA-Z_1-9]+)*)((?:\\s*\\|\\s*[a-zA-Z_1-9]+(?:\\s*\\:\\s*(?:[a-zA-Z_1-9\.]+|'[^']+'))*)*)(\s|,|$)",'g');
                var bindings={},
                    bounds;

                binding.replace(rbinding,function(match,prop,key,filters) {

                    bounds=bindings[key];
                    key=(key?key.replace(/^\./,''):'')||'$self';
                    if(!bounds) {
                        bindings[key]=bounds=[el];
                        if(!self.bindings[key]) self.bindings[key]=[];
                        self.bindings[key].push(bounds);
                    }

                    var value=self.data[key];

                    if(filters) {
                        prop={
                            prop: prop,
                            filters: filters,
                            alias: alias
                        };
                        value=filterValue(self,key,filters,alias,true);
                    }
                    bounds.push(prop);

                    setElement(el,typeof prop==='string'?prop:prop.prop,value);
                });
            });

            for(var key in this.model) {
                var value=this.model[key];
                if(value instanceof Model) {
                    value._scanBinding($el);

                } else if(value instanceof Collection) {

                    if(value.list) {
                        for(var i=0,len=value.list.length;i<len;i++) {
                            var listItem=value.list[i];

                            if(!listItem.placeHolder)
                                listItem.placeHolder=$el.find('[data-placeholder="'+listItem.placeHolderName+'"]')[0];
                        }
                    }
                }
            }

            return self;
        },

        get: function(key) {
            return this.model[key];
        },

        bindings: {},

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

                        console.log(prop)

                        if(typeof prop!=='string') {
                            val=filterValue(this,val,prop.filters,prop.alias);
                            prop=prop.prop;
                        }

                        setElement(el,prop,val);
                    }
                }
            }
        },

        set: function(key,val) {
            var self=this,
                origin,
                changed,
                attrs;

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

            for(var attr in attrs) {
                origin=this.model[key];
                value=attrs[attr];

                if(origin!==value) {
                    if(origin instanceof Model||origin instanceof Collection) {
                        origin.set(value)
                    } else {
                        this.model[attr]=value;
                        this.data[attr]=value;
                    }
                    this._asyncView(attr,value);

                    this.trigger('change:'+attr,value);
                }
            }

        },

        remove: function() {
            if(this.parent&&this.parent instanceof Collection) {
                this.parent.remove(this);
            }
        },

        save: function() {
        }
    };

    Model.extend=util.extend;

    var Collection=function(data,key,parent) {

        if(!data) return;
        if(typeof key==='object') parent=key,key=undefined;

        this.models=[];
        this.data=data;
        this.key=key||'';

        if(parent) {
            this.parent=parent;
            if(parent.key)
                this.key=parent.key+"."+this.key;

            this.root=parent.root;
        }

        this.root&&this.root.finder&&(this.list=this.root.finder[this.key]);

        for(var i=0,len=this.list.length;i<len;i++) {
            this.list[i].fragment=document.createDocumentFragment();
        }
        for(var i=0,len=data.length;i<len;i++) {
            this.add(data[i],false);
        }

        var item;

        for(var i=0,len=this.list.length;i<len;i++) {
            item=this.list[i];
            item.placeHolder.parentNode.insertBefore(item.fragment,item.placeHolder);
        }
        if(parent) this.parent=parent;
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
            var model=new Model(data,this);
            this.models.push(model);

            if(this.list) {
                for(var i=0,len=this.list.length;i<len;i++) {
                    item=this.list[i];

                    var el=item.template.cloneNode(true);
                    var $el=$(el);

                    this.parent&&this.parent._scanBinding($el);
                    model._scanBinding($el,item.modelName);

                    item.elements.push(el);

                    if(autoAppend===false) {
                        item.fragment.appendChild(el);

                    } else {
                        item.placeHolder.parentNode.insertBefore(el,item.placeHolder);
                    }
                }
            }
        },

        set: function(list) {
            var data,
                len=list.length,
                length=this.models.length;

            if(len>length) {
                for(var i=length-1;i>=0;i--) {
                    this.remove(i);
                }
            }

            for(var i=0;i<len;i++) {
                data=list[i];

                if(i<length)
                    this.models[i].set(data);
                else
                    this.add(data);
            }
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
        },

        fetch: function() {
        },

        render: function() {
        },

        save: function() {
        }
    };

    Collection.extend=util.extend;

    var vm=new Model();


    var $el=$('<div>\
            <div data-repeat="item in data" class="item">\
                <img data-binding="src:item.picture|lowercase:asdf.cc:\'asdf\'|uppercase,alt:item.alt|uppercase"/>\
                <div data-binding="data:item.content">测试<text data-binding="html:item.content"></text>一下</div>\
            </div>\
        </div>').appendTo('body');

    vm.bind($el,{
        success: true,
        data: [{
            picture: 'xxx',
            alt: 'zzzz',
            content: 'asdf'
        },{
            picture: 'xxx1',
            alt: 'zzzz1',
            content: 'asdf1'
        }],
        picture: 'asdf',
        asdf: {
            cc: "asdf"
        }
    });

    //vm.get('data').get(0).set('picture','a');

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

    module.exports=Model;
});