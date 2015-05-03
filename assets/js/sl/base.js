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

    exports.functionlize=function(Class,defaultFunc) {

        return function() {
            var one=Class._single,
                    args=slice.apply(arguments);

            if(!one) one=Class._single=new Class();

            if(!args.length) return one;

            var actionName=args.shift()+'',
                    key,
                    val,
                    action;

            for(var key in one) {
                if(key==actionName) {
                    action=val;
                    break;
                }
            }

            typeof action==='function'?
                    action.apply(one,args):
                    (defaultFunc&&defaultFunc.call(one,actionName));

            return this;
        }
    };

    window.sl=exports;
});