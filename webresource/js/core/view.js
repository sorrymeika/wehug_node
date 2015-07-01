define(function (require,exports,module) {

    var $=require('$'),
        util=require('util'),
        Base=require('./base'),
        Event=require('./event'),
        slice=Array.prototype.slice;

    var View=function () {
        var that=this,
            options,
            args=slice.call(arguments),
            selector=args.shift();

        that._bindListenTo=[];

        if($.isPlainObject(selector)) {
            options=selector;
            selector=null;
        } else
            options=args.shift();

        that.options=$.extend({},that.options,options);

        if(that.options.className) that.className=that.options.className;
        if(that.options.el) that.el=that.options.el;

        that.cid=util.guid();

        that.setElement(selector||that.el);

        that.initialize.apply(that,args);

        if(that.options.initialize) that.options.initialize.apply(that,args);

        that.on('Destroy',that.onDestroy);
    };

    View.prototype={
        options: {},

        initialize: util.noop,

        setElement: function (element,delegate) {
            if(element) {
                if(this.$el) this.undelegateEvents();
                this.$el=$(element);
                this.el=this.$el[0];
                if(this.className) this.$el.addClass(this.className);
                if(delegate!==false) this.delegateEvents();
            }
            return this;
        },

        on: Event.on,
        one: Event.one,
        off: Event.off,
        trigger: Event.trigger,

        undelegateEvents: function () {
            this.$el.off('.delegateEvents'+this.cid);
            return this;
        },

        delegateEvents: function () {
            this.listen(this.events);
            this.listen(this.options.events);
            return this;
        },

        listen: function (events,fn) {
            var that=this;

            if(!fn) {
                for(var k in events) {
                    that.listen(k,events[k]);
                }
            } else {
                var els=events.split(' '),
                    event=els.shift().replace(/,/g,'.delegateEvents'+that.cid+' ');

                fn=$.proxy($.isFunction(fn)?fn:that[fn],that);

                if(els.length>0&&els[0]!=='') {
                    that.$el.on(event,els.join(' '),fn);
                } else {
                    that.$el.on(event,fn);
                }
            }

            return that;
        },

        listenTo: function (target) {

            var args=slice.apply(arguments),
                fn=args[args.length-1];

            if(typeof target.on!=='function') target=$(target);

            args[0]=target;
            args[args.length-1]=$.proxy(fn,this);

            this._bindListenTo.push(slice.apply(args));

            args.shift().on.apply(target,args);

            return this;
        },

        $: function (selector) {
            return this.$el.find(selector);
        },

        onDestroy: util.noop,

        destroy: function () {
            var $el=this.$el,
                that=this,
                target;

            $.each(this._bindListenTo,function (i,attrs) {
                target=attrs.shift();
                target.off.apply(target,attrs);
            });

            that.undelegateEvents();
            that.$el.remove();

            that.trigger('Destroy');
        }
    };

    View.extend=function () {
        var that=this,
            args=slice.call(arguments),
            child=args[0],
            prop;

        if(typeof child!=='function') {
            child=null;
            args.unshift({});

        } else {
            args[0]={};
        }

        prop=$.extend.apply($,args);

        child=Base.extend.apply(that,child?[child,prop]:[prop]);

        child.prototype.events=$.extend({},child.superClass.events,child.prototype.events);

        child.extend=arguments.callee;

        return child;
    };

    sl.View=View;

    module.exports=View;
});