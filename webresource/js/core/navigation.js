define(function (require,exports,module) {

    var $=require('$'),
        util=require('util'),
        Base=require('./base'),
        view=require('./view'),
        Route=require('./route'),
        Promise=require('./promise');

    var noop=util.noop,
        slice=Array.prototype.slice,
        getPath=util.getPath,
        standardizeHash=Route.standardizeHash,
        checkQueryString=function (activity,route) {
            if(activity.route.url!=route.url) {
                activity._setRoute(route);
                activity.trigger('QueryChange');
            }
        };

    var Navigation=view.extend({
        events: {
            'click a[href]:not(.js-link-default)': function (e) {
                var that=this,
                    target=$(e.currentTarget);

                if(!/http\:|javascript\:|mailto\:/.test(target.attr('href'))) {
                    e.preventDefault();
                    var href=target.attr('href');
                    if(!/^#/.test(href)) href='#'+href;

                    location.hash=href;

                } else {
                    target.addClass('js-link-default');
                }

                return false;
            }
        },
        el: '<div class="screen" style="position:fixed;top:0px;bottom:0px;right:0px;width:100%;background:rgba(0,0,0,0);z-index:2000;display:none"></div><div class="viewport"></div>',
        initialize: function () {
            var that=this;

            that.$mask=$(that.$el[0]).on('click',false);
            that.el=that.$el[1];
            that.promise=Promise.resolve();
        },

        mapRoute: function (routes) {
            this.route=new Route(routes);
            return this;
        },

        start: function () {
            var that=this,
                hash,
                $win=$(window);

            sl.app=this;

            that.$el.appendTo(document.body);
            that.$el=$(that.el);

            if(!location.hash) location.hash='/';
            that.hash=hash=standardizeHash(location.hash);

            that.promise.then(function () {
                that.get(hash,function (activity) {
                    activity.$el.appendTo(that.el);
                    that._currentActivity=activity;

                    activity.then(function () {
                        activity.trigger('Resume');
                        activity.trigger('Show');

                        that.trigger('start');
                        that.promise.resolve();
                    });
                });

                $win.on('hashchange',function () {
                    hash=that.hash=standardizeHash(location.hash);

                    if(that.skip==0) {

                        that.to(hash);

                    } else if(that.skip>0)
                        that.skip--;
                    else
                        that.skip=0;
                });

                return that.promise;
            });
        },
        skip: 0,

        viewPath: 'views/',
        _currentActivity: null,
        _activities: {},

        set: function (url,activity) {
            this._activities[getPath(url)]=activity;
        },

        get: function (url,callback) {
            var that=this,
                route=typeof url==='string'?that.route.match(url):url;

            if(!route) return;

            var activity=this._activities[getPath(route.path)];

            if(activity==null) {
                seajs.use(that.viewPath+route.view,function (ActivityClass) {

                    if(ActivityClass!=null) {
                        activity=new ActivityClass({
                            application: that,
                            route: route
                        });
                        that.set(route.path,activity);

                        activity.then(function () {
                            callback.call(that,activity,route);
                        });

                    } else {
                        that.skip++;
                        location.hash=that._currentActivity.url;
                    }
                });

            } else {
                callback.call(that,activity,route);
            }
        },

        remove: function (url) {
            this._activities[getPath(url)]=void 0;
        },

        navigate: function (url) {
            url=standardizeHash(url);
            this.skip++;
            location.hash=url;
        },

        to: function (url) {
            url=standardizeHash(url);

            var that=this,
                promise=that.promise;

            promise.then(function () {
                var currentActivity=that._currentActivity,
                    route=that.route.match(url);

                if(promise.queue.length==1&&url!=standardizeHash(location.hash)) {
                    that.navigate(url);
                }

                if(currentActivity.path==route.path) {
                    checkQueryString(currentActivity,route);
                    promise.resolve();
                    return;
                }

                that.get(route,function (activity) {
                    if(activity.path==currentActivity.path) {
                        checkQueryString(activity,route);

                    } else {
                        that._currentActivity=activity;

                        if(activity.el.parentNode===null) activity.$el.appendTo(currentActivity.application.el);

                        activity.$el.show().siblings().hide();

                        activity.then(function () {
                            activity.trigger('Resume');
                        });
                    }
                    promise.resolve();
                });

                return promise;
            });
        }
    });

    sl.Navigation=Navigation;

    module.exports=Navigation;
});
