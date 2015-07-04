define(function (require,exports,module) {

    var $=require('$'),
        util=require('util'),
        Base=require('./base'),
        Event=require('./event'),
        slice=Array.prototype.slice;

    var setElementProp=function (el,prop,value) {
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

    var creator=document.createElement("DIV");
    var createElement=function (html) {
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
        el.cloneNode();
    }
    console.log(Date.now()-now);

    var rcollection=/([a-zA-Z_1-9-]+)\s+in\s+([a-zA-Z_1-9-]+(\.[a-zA-Z_1-9-]+){0,})/g;

    var Generator=function ($el) {
        var repeats={};
        var collection;

        $el.find('[data-repeat]').each(function () {
            var el=this;
            var repeat=this.getAttribute('data-repeat');

            repeat.replace(rcollection,function (match,modelName,collectionName) {
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
                el.parentNode.insertBefore(placeHolder,el);
                el.parentNode.removeChild(el);

                var listItem={
                    sort: '',
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

    var Model=function (data,hash,parent) {
        if(!data) return;

        var model={},
            value,
            map,
            mapping=this.mapping;

        if(typeof hash==='object') parent=hash,hash=undefined;

        this.model=model;
        this.data=data;
        this.key=hash||'';

        if(parent) {
            if(parent instanceof Model) {
                this.parent=parent;
                this.key=parent.key+'.'+this.key;
            } else if(parent instanceof Collection) {
                this.parent=parent;
                this.key=parent.key;

            } else {
                this.generator=parent;
            }
        }

        var collection;

        for(var key in data) {
            map=mapping[key];
            value=data[key];

            if((map&&map.prototype instanceof Model)||(!map&&$.isPlainObject(value))) {
                model[key]=new (map||Model)(value,key,this);

            } else if((map&&map.prototype instanceof Collection)||(!map&&$.isArray(value))) {
                model[key]=collection=new (map||Collection)(value,key,this);

                this.generator&&(collection.list=this.generator[collection.key]);

            } else
                model[key]=data[key];
        }
    };

    Model.prototype={
        constructor: Model,
        one: Event.one,
        on: Event.on,
        off: Event.off,
        trigger: Event.trigger,

        generate: function ($el) {
            this.generator=Generator($el);
        },

        bind: function ($el,variableName) {
            var self=this;

            $el.find('[data-binding]').each(function () {
                var el=this;
                var binding=this.getAttribute('data-binding');
                var rbinding=new RegExp('\\b([a-zA-Z_1-9-]+)\\s*\\:\\s*'+(variableName?variableName+'\\.':'')+'([a-zA-Z_1-9]+)(\s|,|$)','g');
                var bindings;

                binding.replace(rbinding,function (match,prop,key) {
                    if(!bindings) {
                        bindings=[el];
                        if(!self.bindings[key]) self.bindings[key]=[];
                        self.bindings[key].push(bindings);
                    }
                    bindings.push(prop);

                    setElementProp(el,prop,self.data[key]);
                });
            });

            for(var key in this.model) {
                var value=this.model[key];
                if(value instanceof Model) {
                    value.bind($el);

                } else if(value instanceof Collection) {

                    for(var i=0,len=value.list.length;i<len;i++) {
                        var listItem=value.list[i];

                        if(!listItem.placeHolder)
                            listItem.placeHolder=$el.find('[data-placeholder="'+listItem.placeHolderName+'"]')[0];
                    }

                }
            }

            return self;
        },

        get: function (key) {
            return this.model[key];
        },

        bindings: {},

        _asyncView: function (key,val) {

            var bindings=this.bindings[key],
                binding,
                el,
                prop;

            if(bindings) {
                for(var i=0,len=bindings.length;i<len;i++) {
                    binding=bindings[i];
                    el=binding[0];

                    for(var j=1,n=binding.length;j<n;j++) {
                        prop=binding[j];

                        setElementProp(el,prop,val);
                    }

                }
            }
        },

        set: function (key,val) {
            var self=this,
                origin,
                changed,
                attrs;

            if(typeof key==='object') {
                attrs=key;
            } else {
                (attrs={})[key]=val;
            }

            for(var attr in attrs) {
                origin=this.model[key];
                value=attrs[attr];

                if(origin!==value) {
                    this.model[attr]=value;

                    this.trigger('change:'+attr,value);
                    this._asyncView(attr,value);
                }
            }

        },

        render: function () {
        },

        remove: function () {
        },

        save: function () {
        }
    };

    Model.extend=util.extend;

    var Collection=function (collection,key,parent) {

        if(!collection) return;
        if(typeof key==='object') parent=key,key=undefined;

        this.models=[];
        this.data=collection;

        if(parent) {
            this.parent=parent;
            this.key=parent.key+'.'+(hash||'');
        } else {
            this.key=hash||'';
        }

        for(var i=0,len=collection.length;i<len;i++) {
            this.add(collection[i]);
        }
        if(parent) this.parent=parent;
    };

    Collection.prototype={

        model: Model,
        url: null,

        forEach: function (fn) {
            var model;

            for(var i=0,len=this.models.length;i<len;i++) {
                model=this.models[i];

                fn(model,i);
            }
        },

        add: function (data,autoAppend) {
            var model=new Model(data,this);
            this.models.push(model);

            for(var i=0,len=this.list.length;i<len;i++) {
                item=this.list[i];

                var el=item.template.cloneNode();
                var $el=$(el);

                this.parent&&this.parent.bind($el);
                model.bind($el,item.modelName);

                item.elements.push(el);

                if(autoAppend===false) {
                    item.fragment.appendChild(el);

                } else {
                    item.placeHolder.parentNode.insertBefore(el,item.placeHolder);
                }
            }
        },

        get: function (i) {
            return this.models[i];
        },

        remove: function () {
        },

        sort: function () {
        },

        fetch: function () {
        },

        render: function () {
        },

        save: function () {
        }
    };

    Collection.extend=util.extend;

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

    var indexModel=new Index({
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
        picture: 'asdf'
    })


    var $el=$('<div data-repeat="$data"><div data-collection="data" class="list">\
            <div data-repeat="data[0]" class="item">\
                <img data-binding="src:picture,alt:alt"/>\
                <div data-binding="innerHTML:data[0].content">asdf</div>\
            </div>\
            <div data-repeat="item in data" class="item">\
                <img data-binding="src:item.picture,alt:item.alt"/>\
                <div data-binding="data:item.content">测试<text data-binding="html:item.content"></text>一下</div>\
            </div>\
        </div></div>').appendTo('body');

    indexModel.bind($el,'item');

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

    /*

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