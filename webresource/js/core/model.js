define(function(require,exports,module) {

    var $=require('$'),
        util=require('util'),
        Base=require('./base'),
        Event=require('./event'),
        slice=Array.prototype.slice;

    var Collection=function(collection,binding,parent) {
        this.initialize.apply(this,arguments);
    };

    Collection.prototype={
        initialize: function(collection,binding,parent) {
            if(!collection) return;

            this.models=[];
            this.data=collection;

            this.binding=binding;
            if(parent) {
                this.parent=parent;
                if(parent.binding) this.binding=parent.binding+'.'+this.binding;
            }

            for(var i=0,len=collection.length;i<len;i++) {
                this.models.push(new this.model(collection[i],i,this));
            }
            if(parent) this.parent=parent;
        },

        model: null,
        url: null,

        bind: function($el) {
            var model;

            if($el.data('model')==this.binding)
                this.$el=$el;

            else {
                this.$el=$el.find('[data-model="'+(this.binding||'$data')+'"]');
                if(!this.$el.length)
                    this.$el=$el;
            }

            for(var i=0,len=this.models.length;i<len;i++) {
                model=this.models[i];
                model.bind(this.$el.find('[data-model="'+model.binding+'"]'));
            }
        },

        add: function() {
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

    var Model=function() {
        this.initialize.apply(this,arguments);

    };

    Model.prototype={
        initialize: function(data,binding,parent) {
            if(!data) return;

            var model={},
                map,
                mapping=this.mapping;

            this.binding=binding;
            if(parent) {
                this.parent=parent;
                if(parent.binding) this.binding=parent.binding+(typeof this.binding=='number'?'['+this.binding+']':('.'+this.binding));
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
        },

        bind: function($el) {
            var mod,
                model=this.model;

            if($el.data('model')==this.binding)
                this.$el=$el;

            else {
                this.$el=$el.find('[data-model="'+(this.binding||'$data')+'"]');
                if(!this.$el.length)
                    this.$el=$el;
            }
            this.$bindings=this.$el.find('[data-binding]');

            for(var key in model) {
                mod=model[key];

                if(mod instanceof Model||mod instanceof Collection) {
                    mod.bind(this.$el.find('[data-model="'+mod.binding+'"]'));
                }
            }
        },

        get: function(key) {
            return this.model[key];
        },

        set: function(key,value) {
            var self=this,
                origin=this.model[key];

            if(origin!==value) {
                this.model[key]=value;

                this.$bindings.each(function() {
                    var el=this;
                    var binding=this.getAttribute('data-binding');
                    var rbinding=new RegExp('\\b([a-zA-Z_1-9-]+)\\s*\\:\\s*('+self.binding.replace(/(\$|\[|\]|\(|\)|\.)/g,'\\$1')+'\\.'+key+')','g')
                    binding.replace(rbinding,function(match,attr,data) {
                        el[attr]=value;
                    });
                });
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
        }]
    })

    var $el=$('<div data-model="$data"><div data-model="data" class="list">\
            <div data-model="data[0]" class="item">\
                <img data-binding="src:data[0].picture,alt:data[0].alt"/>\
                <div data-binding="innerHTML:data[0].content">asdf</div>\
            </div>\
            <div data-model="data[1]" class="item">\
                <img data-binding="src:data[1].picture,alt:data[1].alt"/>\
                <div data-binding="innerHTML:data[1].content">asdf</div>\
            </div>\
        </div></div>').appendTo('body');

    indexModel.bind($el);

    indexModel.get('data').get(0).set('picture','tttt')

    console.log(indexModel.get('data').get(0))

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