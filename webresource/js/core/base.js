define(function(require,exports,module) {
    if(!Object.create) Object.create=function(o) {
        var F=function() { };
        F.prototype=o;
        return new F;
    };

    if(!Date.now) Date.now=function() {
        return +new Date;
    };

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

    Class.prototype={
        options: {},
        initialize: function() { }
    }

    Class.extend=function(child,prop) {
        var parent=this,
            options;

        if(typeof child!=='function') {
            prop=child;
            child=function() {
                parent.apply(this,arguments);
            }
        }
        var Surrogate=function() { this.constructor=child; };
        Surrogate.prototype=parent.prototype;
        child.prototype=new Surrogate;

        options=prop.options;
        if(typeof options!=='undefined') {
            for(var key in options) {
                child.prototype.options[key]=options[key];
            }
            delete prop.options;
        }

        for(var key in prop) {
            child.prototype[key]=prop[key];
        }

        child.__super__=parent.prototype;

        child.extend=Class.extend;

        return child;
    };

    window.sl=window.slan={};

    module.exports=Class;
});