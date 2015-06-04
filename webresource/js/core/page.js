define(function(require,exports,module) {

    require('../widget/tip');

    var $=require('$'),
        util=require('util'),
        Base=require('./base'),
        view=require('./view'),
        Promise=require('./promise'),
        Dialog=require('../widget/dialog');

    var noop=util.noop,
        indexOf=util.indexOf,
        slice=Array.prototype.slice,
        getUrlPath=util.getPath;

    var Page=view.extend({
        options: {
            route: null
        },
        application: null,
        el: '<div class="view"></div>',

        _setRoute: function(route) {
            this.route=route;
            this.hash=route.hash;
            this.url=route.url;
            this.path=route.path;
            this._queries=this.queries;
            this.queries=$.extend({},route.queries);
        },

        queryString: function(key,val) {
            if(typeof val==='undefined')
                return this.route.queries[key];

            else if(val===null||val===false||val==='')
                delete this.route.queries[key];
            else
                this.route.queries[key]=val||'';

            var queries=$.param(this.route.queries);
            this.application.to(this.route.path+(queries?'?'+queries:''));
        },

        template: 'views/home.html',

        loadTemplate: function() {
            var that=this;

            seajs.use(that.template,function(razor) {
                that.$el.html(razor.html());
                that.razor=razor;
                that.trigger("Create");
                that.promise.resolve(razor);
            });

            return that.promise;
        },

        initialize: function() {
            var that=this,
                promise=Promise.resolve();

            that.promise=promise;
            that.className=that.el.className;

            that._setRoute(that.options.route);

            that.$el.data('url',that.url).data('path',that.path);

            that.application=that.options.application;

            that.on('Start',that.onStart);
            that.on('Resume',that.onResume);
            that.on('Show',that.onShow);
            that.on('Pause',that.onPause);
            that.on('QueryChange',that.onQueryChange);
            that.on('QueryChange',that.checkQuery);

            promise.then(that.loadTemplate,that)
                .then(that.onCreate,that)
                .then(function() {
                    that.trigger('Start');
                    that.checkQuery();
                });
        },

        onCreate: noop,
        onStart: noop,
        onResume: noop,

        //进入动画结束时触发
        onShow: noop,

        onStop: noop,
        onRestart: noop,

        //离开动画结束时触发
        onPause: noop,

        onQueryChange: noop,

        then: function(fn) {
            this.promise.then(fn,this);
            return this;
        },

        _queryActions: {},
        checkQuery: function() {
            var that=this;
            var queries=that.queries;
            var prevQueries=that._queries;
            var queryActions=that._queryActions;
            var action;

            queryActions&&$.each(queryActions,function(i,qa) {
                action=queries[i]||'';

                if((action&&!prevQueries)||(prevQueries&&action!=prevQueries[i])) {
                    var queryFn=qa.cls[qa.map[action]].__query_action;
                    queryFn.apply(qa.cls,queryFn.__arguments);
                    queryFn.__arguments=undefined;
                }
            });
        },

        bindQueryAction: function(name,cls,fnMap) {
            var map={};
            var that=this;
            var newFn;

            $.each(fnMap,function(i,fn) {
                newFn=function() {
                    var args=slice.apply(arguments);
                    var queryFn=arguments.callee.__query_action;
                    (that.queryString(name)==i)?queryFn.apply(cls,args):(queryFn.__arguments=args,that.queryString(name,i));
                };
                newFn.__query_action=cls[fn];
                cls[fn]=newFn;
            });

            this._queryActions[name]={
                cls: cls,
                map: fnMap
            };
            return this;
        },

        prompt: function(title,val,fn,target) {
            target=typeof fn!=='function'?fn:target;
            fn=typeof val==='function'?val:fn;
            val=typeof val==='function'?'':val;

            !this._prompt&&(this._prompt=this.createDialog({
                content: '<input type="text" class="prompt-text" />',
                buttons: [{
                    text: '取消',
                    click: function() {
                        this.hide();
                    }
                },{
                    text: '确认',
                    click: function() {
                        this.hide();
                        this.ok&&this.ok(this.$('.prompt-text').val());
                    }
                }]
            }));

            var prompt=this._prompt;

            prompt.title(title||'请输入').show(target);
            prompt.$('.prompt-text').val(val).focus();
            prompt.ok=$.proxy(fn,this);
        },

        createDialog: function(options) {
            var that=this;
            var dialog=new Dialog(options);

            that.bindQueryAction('dialog',dialog,{
                show: 'show',
                "": 'hide'
            });

            return dialog;
        },

        onActivityResult: function(event,fn) {
            this.listenTo(this.application,event,fn);
        },

        setResult: function() {
            this.application.trigger.apply(this.application,arguments);
        },

        compareUrl: function(url) {
            return getUrlPath(url)===this.route.path.toLowerCase();
        }
    });

    sl.Page=Page;

    module.exports=Page;
});
