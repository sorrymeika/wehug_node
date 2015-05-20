define(function (require,exports,module) {

    var $=require('$'),
        util=require('util'),
        sl=require('./base'),
        Event=require('./event'),
        slice=Array.prototype.slice;

    var View=sl.Class.extend(function () {
        var that=this,
            options,
            args=slice.call(arguments),
            selector=args.shift();

        that._bindListenTo=[];

        $.isPlainObject(selector)?(options=selector,selector=null):(options=args.shift());

        if(options&&options.override) {
            $.each(options.override,function (key,fn) {
                that[key]=fn;
            });
            delete options.override;
        }
        that.options=$.extend({},that.options,options);

        if(that.options.className) that.className=that.options.className;
        if(that.options.el) that.el=that.options.el;

        that.cid=util.guid();

        that.setElement(selector||that.el);

        that.initialize.apply(that,args);

        if(that.options.initialize) that.options.initialize.apply(that,args);

        that.on('Destory',that.onDestory);

    },{
        options: {},
        setElement: function (element,delegate) {
            if(this.$el) this.undelegateEvents();
            this.$el=$(element);
            this.el=this.$el[0];
            if(this.className) this.$el.addClass(this.className);
            if(delegate!==false) this.delegateEvents();
            return this;
        },

        undelegateEvents: function () {
            this.$el.off('.delegateEvents'+this.cid);
            return this;
        },

        delegateEvents: function () {
            this.listen(this.events);
            this.listen(this.options.events);
            return this;
        },

        listen: function (options,fn) {
            var that=this;

            if(!fn) {
                for(var k in options) {
                    that.listen(k,options[k]);
                }
            } else {
                var els=options.split(' '),
                    events=els.shift().replace(/,/g,'.delegateEvents'+that.cid+' ');

                fn=$.proxy($.isFunction(fn)?fn:that[fn],that);

                if(els.length>0&&els[0]!=='') {
                    that.$el.on(events,els.join(' '),fn);
                } else {
                    that.$el.on(events,fn);
                }
            }

            return that;
        },

        listenTo: function (target) {

            var args=slice.apply(arguments),
                fn=args[args.length-1];

            args[args.length-1]=$.proxy(fn,this);

            typeof target.on!=='function'&&(target=$(target));

            this._bindListenTo.push(slice.apply(args));
            args.shift();

            target.on.apply(target,args);

            return this;
        },

        on: Event.on,
        one: Event.one,
        off: Event.off,
        trigger: Event.trigger,

        $: function (selector) {
            if(typeof selector==="string"&&selector[0]=='#') {
                selector='[id="'+selector.substr(1)+'"]';
            }
            return $(selector,this.$el);
        },

        initialize: function () {
        },

        onDestory: function () { },

        destory: function () {
            var $el=this.$el,
                that=this,
                target;

            $.each(this._bindListenTo,function (i,attrs) {
                target=attrs.shift();
                target.off.apply(target,attrs);
            });

            that.undelegateEvents();
            that.$el.remove();

            that.trigger('Destory');
        }
    });

    View.extend=function (childClass,prop) {
        var that=this;

        childClass=sl.Class.extend.call(that,childClass,prop);

        childClass.events=$.extend({},childClass.superClass.events,childClass.prototype.events);

        childClass.extend=arguments.callee;

        return childClass;
    };

    sl.View=View;

    module.exports=View;
});