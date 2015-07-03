define(function(require,exports,module) {

    var $=require('$'),
        util=require('util'),
        Base=require('./base'),
        Event=require('./event'),
        slice=Array.prototype.slice;

    var setElementProp=function(el,prop,value) {
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


    var Model=function(data,parent) {
        if(!data) return;

        var model={},
            map,
            mapping=this.mapping;

        if(parent) {
            this.parent=parent;
        }

        for(var key in data) {
            map=mapping[key];

            if(typeof map=='function'&&(map.prototype instanceof Model||map.prototype instanceof Collection)) {
                model[key]=new map(data[key],key,this);
            } else
                model[key]=data[key];
        }

        this.model=model;
        this.data=data;
    };

    Model.prototype={
        one: Event.one,
        on: Event.on,
        off: Event.off,
        trigger: Event.trigger,

        bind: function($el,modelName) {
            var self=this;
            $el.find('[data-binding]').each(function() {
                var el=this;
                var binding=this.getAttribute('data-binding');
                var rbinding=new RegExp('\\b([a-zA-Z_1-9-]+)\\s*\\:\\s*'+(modelName?modelName+'\\.':'')+'([a-zA-Z_1-9]+)(\s|,|$)','g');
                var bindings;

                binding.replace(rbinding,function(match,prop,key) {
                    if(!bindings) {
                        bindings=[el];
                        if(!self.bindings[key]) self.bindings[key]=[];
                        self.bindings[key].push(bindings);
                    }
                    bindings.push(prop);

                    setElementProp(el,prop,self.data[key]);
                });
            });
            //this.$bindings.push.apply(this.$bindings,els);
        },

        get: function(key) {
            return this.model[key];
        },

        bindings: {/*
            title: [[el,'src','alt'],[el2,'html']]
        */
        },

        _asyncView: function(key,val) {

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

        set: function(key,val) {
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

        render: function() {
        },

        remove: function() {
        },

        save: function() {
        }
    };

    Model.extend=util.extend;

    var rcollection=/([a-zA-Z_1-9-]+)\s+in\s+([a-zA-Z_1-9-]+(\.[a-zA-Z_1-9-]+){0,})/g;

    var Finder=function($el,data) {
        $el.find('[data-model]').each(function() {
            var el=this;
            var model=this.getAttribute('data-model');

            model.replace(rcollection,function() {

            });
        });
    };

    var Collection=function(collection,templates,parent) {

        if(!collection) return;

        this.models=[];
        this.data=collection;
        this.list=[{
            modelName: 'item',
            sort: '',
            $placeHolder: $('<script type="text/placeholder" data-collection="data"></script>'),
            template: '<div data-model="item in data" class="item">\
                <img data-binding="src:item.picture,alt:item.alt"/>\
                <a data-binding="href:item.href">测试<text data-binding="html:item.content"></text>一下</a>\
            </div>',
            elements: []
        }];

        if(parent) {
            this.parent=parent;
        }

        for(var i=0,len=collection.length;i<len;i++) {
            this.add.push(collection[i]);
        }
        if(parent) this.parent=parent;
    };

    Collection.prototype={

        model: Model,
        url: null,

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

            for(var i=0,len=this.list.length;i<len;i++) {
                item=this.list[i];

                creator.innerHTML=item.template;

                var el=creator.childNodes[0].nodeType==3?creator.childNodes[1]:creator.childNodes[0];
                var $el=$(el);

                this.parent&&this.parent.bind($el);
                model.bind($el,item.modelName);

                item.elements.push(el);

                if(autoAppend===false) {
                    item.fragment.appendChild(el);

                } else {
                    item.$placeHolder.before($model);
                }
            }
        },

        get: function(i) {
            return this.models[i];
        },

        remove: function() {
        },

        sort: function() {
        },

        fetch: function() {
        },

        render: function() {
        },

        save: function() {
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
            data: List,
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


    var $el=$('<div data-model="$data"><div data-collection="data" class="list">\
            <div data-model="data[0]" class="item">\
                <img data-binding="src:picture,alt:alt"/>\
                <div data-binding="innerHTML:data[0].content">asdf</div>\
            </div>\
            <div data-model="item in data" class="item">\
                <img data-binding="src:item.picture,alt:item.alt"/>\
                <div data-binding="data:item.content">测试<text data-binding="html:item.content"></text>一下</div>\
            </div>\
        </div></div>').appendTo('body');

    console.log($el.find('[data-binding="data:item.content"]'))

    indexModel.bind($el,'item');

    console.log(indexModel.bindings)

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