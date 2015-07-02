define(function(require,exports,module) {

    var $=require('$'),
        util=require('util'),
        Base=require('./base'),
        Event=require('./event'),
        slice=Array.prototype.slice;

    var Collection=function(collection,binding,parentModel) {
        this.models=[];
        this.data=collection;
        this.binding=binding||'$data';

        for(var i=0,len=collection;i<len;i++) {
            this.models.push(new this.model(collection[i],binding+'['+i+']',this));
        }
        if(parentModel) this.parentModel=parentModel;
    };

    Collection.prototype={
        model: null,
        url: null,

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
        }
    };

    Collection.extend=util.extend;

    var Model=function(data,binding,parentModel) {

        var model={},
            map,
            mapping=this.mapping;

        this.binding=binding||'$data';

        for(var key in item) {
            map=mapping[key];

            if(typeof map=='function'&&(map.prototype instanceof Model||map.prototype instanceof Collection)) {
                model[key]=new map(item[key],key,this);
            } else
                model[key]=item[key];
        }

        if(parentModel) this.parentModel=parentModel;
        this.model=model;
        this.data=data;
    };

    Model.prototype={
    /*
        {
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
        }
        */
        /*
        <div data-model="data" class="list">
            <div data-model="data[0]" class="item">
                <img data-binding="src:data[0].picture,alt:data[0].alt"/>
                <div data-binding="innerHTML:data[0].content"></div>
            </div>
            <div data-model="data[1]" class="item">
                <img data-binding="src:data[1].picture,alt:data[1].alt"/>
                <div data-binding="innerHTML:data[1].content"></div>
            </div>
        </div>
        */
        bind: function($el) {
            if($el.data('model')==this.binding)
                this.$el=$el;

            else {
                this.$el=$el.find('[data-model="'+this.binding+'"]');
                if(!this.$el.length)
                    this.$el=$el;
            }
            this.$bindings=this.$el.find('[data-binding]');
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
                    var binding=this.getAttribute('data-binding');
                    var rbinding=new RegExp('\\b([a-zA-Z_-1-9])\\s*\\:\\s*'+self.binding.replace(/(\$|\[|\])/g,'\\$1'))
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
    })

    module.exports=Model;
});