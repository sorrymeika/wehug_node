var LinkList=require('./linklist');
var slice=Array.prototype.slice;

var Promise=function (args,callback,ctx) {
    if(!(this instanceof Promise))
        return new Promise(args,callback,ctx);

    this.queue=new LinkList();
    this.state=2;

    if(args) {
        this.state=0;
        this.then(args,callback,ctx);
    }
}

Promise.prototype={
    reject: function (reason) {
        this.resolve(reason||'unknow error',null);
    },
    resolve: function () {
        var that=this,
            args=slice.call(arguments),
            then=that.queue.shift(),
            thenArgs,
            next,
            ctx,
            promise;

        if(then) {
            that.state=1;
            thenArgs=then[0];
            next=then[1];
            ctx=then[2];

            if(thenArgs&&thenArgs.length) {
                args=thenArgs.concat(args);
            }

            if(typeof next=='function') {
                promise=next.apply(ctx,args);

                if(promise instanceof Promise) {
                    if(promise!==that) {
                        promise.then(function (err,result) {
                            that.resolve(err,result);
                        });
                    }

                } else
                    that.resolve(null,promise);

            } else if(next instanceof Array) {
                var errors=[],
                    result=[],
                    count=0;

                for(var i=0,n=next.length;i<n;i++) {
                    (function (fn,i,n) {

                        if(typeof fn=='function'&&!(fn instanceof Promise)) {
                            fn=fn.apply(ctx,args);
                        }

                        if(fn instanceof Promise) {

                            fn.then(function (err,obj) {
                                if(err) errors[i]=err;

                                count++;
                                result[i]=obj;

                                if(count>=n) that.resolve(errors,result);
                            });


                        } else {
                            count++;
                            result[i]=fn;

                            if(count>=n) that.resolve(null,result);
                        }

                    })(next[i],i,n);
                }

            } else {
                that.resolve(null,args);
            }

        } else {
            that.state=0;
        }
    },
    when: function (args,ctx) {
        if(!(args instanceof Array))
            args=[args];

        this.queue.append([null,args,ctx||this]);

        if(this.state!=1) {
            this.resolve();
        }

        return this;
    },
    then: function (args,callback,ctx) {
        if(!(args instanceof Array)) {
            ctx=callback;
            callback=args;
            args=null;
        }

        this.queue.append([args,callback,ctx||this]);

        if(!this.state) {
            this.resolve();
        }

        return this;
    }
};

module.exports=Promise;

/*
var promise=Promise(function () {
var that=this;

setTimeout(function () {
console.log('init');

that.resolve(null,'tes1t');

},2000);

return that;
});

promise.when(function () {
var dfd=Promise();

setTimeout(function () {
console.log('when');

dfd.resolve(null,'test');

},2000);

return dfd;
})
.then(function (err,result) {
setTimeout(function () {
console.log('then',err,result);

promise.resolve();

},1000);

return promise;
})
.then(function (err,result) {

setTimeout(function () {
console.log('end',err,result);

promise.resolve();

},500);

return promise;
});
*/