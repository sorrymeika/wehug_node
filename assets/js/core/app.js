define(function(require,exports,module) {

    var $=require('$'),
        util=require('util'),
        bridge=require('bridge'),
        Base=require('./base'),
        view=require('./view'),
        animation=require('./animation'),
        LinkList=require('./linklist'),
        Promise=require('./promise'),
        Touch=require('./touch'),
        Route=require('./route'),
        Activity=require('./activity');

    var noop=util.noop,
        lastIndexOf=util.lastIndexOf,
        slice=Array.prototype.slice,
        getPath=util.getPath,
        parseHash=Route.standardizeHash,
        checkQueryString=function(activity,route) {
            if(activity.route.url!=route.url) {
                activity._setRoute(route);
                activity.trigger('QueryChange');
            }
        },
        defAnim={
            openEnterAnimationFrom: {
                translate: '100%,0'
            },
            openEnterAnimationTo: {
                translate: '0,0'
            },
            openExitAnimationFrom: {
                translate: '0,0'
            },
            openExitAnimationTo: {
                translate: '-50%,0'
            },
            closeEnterAnimationTo: {
                translate: '0,0'
            },
            closeEnterAnimationFrom: {
                translate: '-50%,0'
            },
            closeExitAnimationFrom: {
                translate: '0,0'
            },
            closeExitAnimationTo: {
                translate: '100%,0'
            }
        };

    var getToggleAnimation=function(isOpen,currentActivity,activity,animationName) {
        if(!animationName) animationName=(isOpen?activity:currentActivity).animationName;

        var anim=require('anim/'+animationName)||defAnim,
            type=isOpen?"open":"close",
            ease=isOpen?'ease-out':'ease-out',
            enterFrom=Object.create(anim[type+'EnterAnimationFrom']),
            exitFrom=Object.create(anim[type+'ExitAnimationFrom']);

        enterFrom.zIndex=isOpen?2:1;
        enterFrom.display='block';
        exitFrom.zIndex=isOpen?1:3;

        return [{
            el: activity.$el,
            start: enterFrom,
            css: anim[type+'EnterAnimationTo'],
            ease: ease
        },{
            el: currentActivity.$el,
            start: exitFrom,
            css: anim[type+'ExitAnimationTo'],
            ease: ease
        }];
    }

    var prepareActivity=function(currentActivity,activity) {
        currentActivity.prepareExitAnimation();
        currentActivity.$el.siblings(':not([data-path="'+activity.path+'"])').hide();

        if(activity.el.parentNode===null) activity.$el.appendTo(currentActivity.application.el);
    }

    var Application=view.extend({
        events: {
            'tap,click a[href]:not(.js-link-default)': function(e) {
                var that=this,
                    target=$(e.currentTarget);

                if(!/http\:|javascript\:|mailto\:/.test(target.attr('href'))) {
                    e.preventDefault();
                    if(e.type=='tap') {
                        var href=target.attr('href');
                        if(!/^#/.test(href)) href='#'+href;

                        target.attr('forward')!=null?that.forward(href):target.attr('back')!=null?that.back(href):that.to(href);
                    }

                } else {
                    target.addClass('js-link-default');
                }

                return false;
            },
            'tap [data-href]': function(e) {
                var that=this,
                    target=$(e.currentTarget);

                if(!/http\:|javascript\:|mailto\:/.test(target.attr('data-href'))) {
                    that.to(target.attr('data-href'));
                }
            },
            'tap [data-back]': function(e) {
                this.back($(e.currentTarget).attr('data-back'));
            },
            'tap [data-forward]': function(e) {
                this.forward($(e.currentTarget).attr('data-forward'));
            },
            'focus input': function(e) {
                this.activeInput=e.target;
            }
        },

        _touchStart: function() {
            var that=this,
                currentActivity,
                action,
                isSwipeLeft,
                isOpen,
                deltaX=that.touch.dx;

            if(that.touch.isDirectionY||that.swiperPromise) {
                that.touch.stop();
                return;
            }
            that.width=window.innerWidth;

            currentActivity=that._currentActivity;

            isSwipeLeft=that.isSwipeLeft=deltaX>0;
            that.swiper=null;

            action=isSwipeLeft?(currentActivity.swipeLeftForwardAction?(isOpen=true,currentActivity.swipeLeftForwardAction):(isOpen=false,currentActivity.swipeLeftBackAction))
                        :(currentActivity.swipeRightForwardAction?(isOpen=true,currentActivity.swipeRightForwardAction):(isOpen=false,currentActivity.swipeRightBackAction));

            if(!action) {
                if(isSwipeLeft&&currentActivity.referrerDir=="Left") {
                    action=currentActivity.referrer;
                } else if(!isSwipeLeft&&currentActivity.referrerDir!="Left") {
                    action=currentActivity.referrer;
                }
                isOpen=false;
            }

            if(action) {
                that.swiperPromise=new Promise();

                that.mask.show();
                that.get(action,function(activity) {
                    prepareActivity(currentActivity,activity);

                    that.isSwipeOpen=isOpen;

                    that.swiper=new animation.Animation(getToggleAnimation(isOpen,currentActivity,activity));
                    that.swipeActivity=activity;

                    that.swiperPromise.resolve();
                });

            } else {
                that.swiperPromise=null;
            }
        },

        _touchMove: function(e) {
            var that=this,
                per,
                deltaX=that.touch.dx;

            if(!that.swiperPromise) return;

            that.swiperPromise.then(function() {
                if(that.isSwipeLeft&&deltaX<0||!that.isSwipeLeft&&deltaX>0) {
                    that.swiper.step(0);
                    return;
                }

                per=Math.abs(deltaX)*100/that.width;

                that.swiper.step(per);
            },that);
        },

        _swiperAnimEnd: function() {
            var that=this,
                activity=that.swipeActivity,
                currentActivity=that._currentActivity;

            if(that.isCancelSwipe) {
                currentActivity.isPrepareExitAnimation=false;
                activity.$el.remove();
                that.mask.hide();
            } else {
                //var swipeAction='swipe'+(that.isSwipeLeft?'Right':'Left')+(that.isSwipeOpen?'BackAction':'ForwardAction');

                that._currentActivity=that.swipeActivity;
                that.navigate(activity.url);

                activity.finishEnterAnimation();

                if(that.isSwipeOpen) {
                    activity.referrer=currentActivity.url;
                    activity.referrerDir=that.isSwipeLeft?"Right":"Left";
                    currentActivity.trigger('Pause');
                } else {
                    currentActivity.destroy();
                }
            }
            that.turning();
        },

        _touchEnd: function() {
            var that=this;

            that.isCancelSwipe=that.touch.isMoveLeft!==that.isSwipeLeft;

            if(that.swiperPromise) {
                that.swiperPromise.then(function() {
                    that.queue([200,that.isCancelSwipe?0:100,that._swiperAnimEnd.bind(that)],that.swiper.animate,that.swiper);
                    that.swiperPromise=null;
                });
            }
        },

        skip: 0,
        _history: [],
        _historyCursor: -1,

        el: '<div class="screen" style="position:fixed;top:0px;bottom:0px;right:0px;width:100%;background:rgba(0,0,0,0);z-index:2000;display:none"></div><div class="viewport"></div><canvas class="imagecanvas"></canvas>',

        initialize: function() {
            var that=this,
                preventEvents='tap click touchend touchmove touchstart';

            that._queue=new LinkList();

            that.mask=$(that.$el[0]).off(preventEvents).on(preventEvents,false);

            that.el=that.$el[1];
            that.canvas=that.$el[2];

            that.touch=new Touch(that.el,{
                start: that._touchStart,
                move: that._touchMove,
                stop: that._touchEnd
            },that);
        },

        mapRoute: function(routes) {
            this.route=new Route(routes);
            return this;
        },

        start: function() {
            $(window).on('load',$.proxy(this._start,this));
        },

        _start: function() {
            var that=this,
                hash,
                $win=$(window);

            sl.app=this;

            that.$el.appendTo(document.body);
            that.$el=$(that.el);

            if(!location.hash) location.hash='/';
            that.hash=hash=parseHash(location.hash);

            that.queue([hash,function(activity) {
                activity.$el.appendTo(that.el);
                that._currentActivity=activity;
                that._history.push(activity.url);
                that._historyCursor++;

                activity.$el.transform(defAnim.openEnterAnimationTo);
                activity.then(function() {
                    activity.trigger('Resume');
                    activity.trigger('Show');

                    that.trigger('start');
                    that.turning();
                });

                $win.on('hashchange',function() {
                    hash=that.hash=parseHash(location.hash);

                    var index=lastIndexOf(that._history,hash),
                        isForward=(that._skipRecordHistory||index== -1)&&!that.isHistoryBack;

                    if(that._skipRecordHistory!==true) {
                        if(index== -1) {
                            that.isHistoryBack?that._history.splice(that._historyCursor,0,hash):(that._history.push(hash),that._historyCursor++);
                        } else {
                            that._history.length=index+1;
                            that._historyCursor=index;
                        }
                    } else
                        that._skipRecordHistory=false;

                    if(that.skip==0) {
                        that[isForward?'forward':'back'](hash);

                    } else if(that.skip>0)
                        that.skip--;
                    else
                        that.skip=0;

                    that.isHistoryBack=false;
                });

            } ],that.get,that);
        },

        _queue: null,

        queue: function(args,fn,context) {
            var queue=this._queue;
            queue.append({
                context: context,
                fn: fn,
                args: args
            });

            if(queue.length==1)
                fn.apply(context,args);
        },

        turning: function() {
            var queue=this._queue;

            if(queue.length) {
                queue.shift();
                if(queue.length) {
                    queue=queue.first();
                    queue.fn.apply(queue.context,queue.args);
                }
            }
        },

        viewPath: 'views/',
        _currentActivity: null,
        _activities: {},

        set: function(url,activity) {
            this._activities[getPath(url)]=activity;
        },

        get: function(url,callback) {
            var that=this,
                route=typeof url==='string'?that.route.match(url):url;

            if(!route) return;

            var activity=this._activities[route.path];

            if(activity==null) {
                seajs.use(that.viewPath+route.view,function(ActivityClass) {

                    if(ActivityClass!=null) {
                        activity=new ActivityClass({
                            application: that,
                            route: route
                        });
                        that.set(route.path,activity);

                        activity.then(function() {
                            callback.call(that,activity,route);
                        });

                    } else {
                        that.skip++;
                        that._currentActivity.finishEnterAnimation();
                        location.hash=that._currentActivity.url;
                    }
                });

            } else {
                callback.call(that,activity,route);
            }
        },

        remove: function(url) {
            this._activities[getPath(url)]=void 0;
        },

        _animationTo: function(url,duration,animationName,type,callback) {
            if(!duration) duration=400;
            url=parseHash(url);

            var that=this,
                currentActivity=that._currentActivity,
                route=that.route.match(url);

            if(url!=parseHash(location.hash)&&that._queue.length==1) {
                var args=that._queue.first().args;
                if(args&&parseHash(args[0])===url) that.navigate(url);
            }

            if(currentActivity.path==route.path) {
                checkQueryString(currentActivity,route);
                that.turning();
                return;
            }

            that.get(route,function(activity) {
                if(activity.path==currentActivity.path) {
                    checkQueryString(activity,route);
                    that.turning();
                    return;
                }
                that._currentActivity=activity;

                prepareActivity(currentActivity,activity);

                activity.then(function() {
                    activity.trigger('Resume');
                });

                var isOpen=type=='open',
                    ease=type=='open'?'ease-out':'ease-out',
                    anims=getToggleAnimation(isOpen,currentActivity,activity,animationName),
                    anim;

                if(isOpen) {
                    activity.referrer=currentActivity.url;
                    activity.referrerDir=currentActivity.swipeRightForwardAction==url?"Left":"Right";
                }

                for(var i=0,n=anims.length;i<n;i++) {
                    anim=anims[i];
                    anim.ease=ease;
                    anim.duration=duration;
                }

                anim.finish=function() {
                    callback&&callback(activity);
                    activity.finishEnterAnimation();
                    that.turning();
                    //console.log(that._history);
                }

                animation.parallel(anims);
            });
        },

        _to: function(url) {
            this._navigate(url);
            this.turning();
        },

        to: function(url) {
            this.queue([url],this._to,this);
        },

        _navigate: function(url,skip) {
            url=parseHash(url);

            var that=this,
                index=lastIndexOf(that._history,url);

            if(skip===true) {
                that.skip++;
            }

            if(index== -1) {
                that._history.splice(that._historyCursor+1,0,url);
                that._history.length=that._historyCursor+2;
                that._historyCursor++;
                that._skipRecordHistory=true;

                location.hash=url;

            } else {
                if(index!=that._historyCursor) {
                    history.go(index-that._historyCursor);
                }
                if(skip===true) {
                    that._history.length=index+1;
                    that._historyCursor=index;
                }
            }
        },

        navigate: function(url) {
            this._navigate(url,true);
        },

        _forward: function(url,duration,animationName) {
            var currentActivity=this._currentActivity;

            this._animationTo(url,duration,animationName,'open',function() {
                currentActivity.trigger('Pause');
            });
        },

        forward: function(url,duration,animationName) {
            this.queue([url,duration,animationName],this._forward,this);
        },

        isHistoryBack: false,

        _back: function(url,duration,animationName) {
            var that=this,
                currentActivity=that._currentActivity;

            if(typeof url!=='string') {
                currentActivity.prepareExitAnimation();
                that.isHistoryBack=true;
                history.back();
                that.turning();

            } else {
                if(typeof duration==='string') {
                    animationName=duration;
                    duration=null;
                }
                that._animationTo(url,duration,animationName,'close',function() {
                    currentActivity.destroy();
                });
            }
        },

        back: function(url,duration,animationName) {
            this.queue([url,duration,animationName],this._back,this);
        }
    });

    sl.Application=Application;

    return Application;
});
