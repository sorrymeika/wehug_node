define(function(require,exports) {
    if(!Object.create) {
        Object.create=function(o) {
            var F=function() { };
            F.prototype=o;
            return new F();
        };
    }

    var Class=function() {
        var that=this,
            args=Array.prototype.slice.call(arguments),
            options=args.shift();

        if(options) {
            for(var i in options) {
                that.options[i]=options[i];
            }
        }
        that.initialize.apply(that,args);
        that.options.initialize&&that.options.initialize.apply(that,args);
    };

    Class.fn=Class.prototype={
        options: {},
        initialize: function() { }
    };

    Class.extend=function(childClass,prop) {
        var that=this,
            F=function() { },
            options=that.fn.options;

        childClass=typeof childClass=='function'?childClass:(prop=childClass,function() {
            that.apply(this,arguments);
        });

        F.prototype=that.fn;
        childClass.fn=childClass.prototype=new F();

        if(!prop.options) prop.options={};
        for(var i in options) {
            if(typeof prop.options[i]==='undefined')
                prop.options[i]=options[i];
        }

        for(var i in prop) {
            childClass.fn[i]=prop[i];
        }

        childClass.superClass=that.fn;
        childClass.fn.constructor=childClass;

        childClass.extend=arguments.callee;

        return childClass;
    };

    exports.Class=Class;


    window.sl=exports;
});