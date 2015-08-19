define(function (require, exports, module) {

    var $ = require('$'),
        util = require('util'),
        bridge = require('bridge'),
        Base = require('./base'),
        view = require('./view'),
        Master = require('./master'),
        animation = require('./animation'),
        LinkList = require('./linklist'),
        Promise = require('./promise'),
        Touch = require('./touch'),
        Route = require('./route'),
        Activity = require('./activity');

    var noop = util.noop,
        lastIndexOf = util.lastIndexOf,
        slice = Array.prototype.slice,
        getPath = util.getPath,
        standardizeHash = Route.standardizeHash,
        checkQueryString = Master.checkQueryString;

    var getToggleAnimation = function (isOpen, currentActivity, activity, toggleAnim) {
        if (!toggleAnim) toggleAnim = (isOpen ? activity : currentActivity).toggleAnim;

        var anim = require('anim/' + toggleAnim),
            type = isOpen ? "open" : "close",
            ease = isOpen ? 'ease-out' : 'ease-out',
            enterFrom = $.extend({}, anim[type + 'EnterAnimationFrom']),
            exitFrom = $.extend({}, anim[type + 'ExitAnimationFrom']);

        enterFrom.zIndex = isOpen ? anim.openEnterZIndex : anim.closeEnterZIndex;
        enterFrom.display = 'block';
        exitFrom.zIndex = isOpen ? anim.openExitZIndex : anim.closeExitZIndex;

        return [{
            el: activity.$el,
            start: enterFrom,
            css: anim[type + 'EnterAnimationTo'],
            ease: ease
        }, {
            el: currentActivity.$el,
            start: exitFrom,
            css: anim[type + 'ExitAnimationTo'],
            ease: ease
        }];
    }

    var adjustActivity = function (currentActivity, activity) {
        currentActivity.startExit();
        currentActivity.$el.siblings('.view:not([data-path="' + activity.path + '"])').hide();

        if (activity.el.parentNode === null) activity.$el.appendTo(currentActivity.application.el);
    };

    var bindBackGesture = function (application) {
        application.touch = new Touch(application.el, {
            start: function () {
                var that = this,
                action,
                isOpen,
                deltaX = that.touch.dx;

                if (that.touch.isDirectionY || that.swiperPromise) {
                    that.touch.stop();
                    return;
                }
                that.width = window.innerWidth;

                var currentActivity = that._currentActivity;
                var isSwipeLeft = that.isSwipeLeft = deltaX > 0;

                that.swiper = null;

                action = isSwipeLeft ? (currentActivity.swipeLeftForwardAction ? (isOpen = true, currentActivity.swipeLeftForwardAction) : (isOpen = false, currentActivity.swipeLeftBackAction))
                        : (currentActivity.swipeRightForwardAction ? (isOpen = true, currentActivity.swipeRightForwardAction) : (isOpen = false, currentActivity.swipeRightBackAction));

                if (!action) {
                    if (isSwipeLeft && currentActivity.referrerDir == "Left") {
                        action = currentActivity.referrer;
                    } else if (!isSwipeLeft && currentActivity.referrerDir != "Left") {
                        action = currentActivity.referrer;
                    }
                    isOpen = false;
                }

                if (action) {
                    that.swiperPromise = new Promise();

                    that.mask.show();
                    that.get(action, function (activity) {
                        adjustActivity(currentActivity, activity);

                        that.isSwipeOpen = isOpen;

                        that.swiper = new animation.Animation(getToggleAnimation(isOpen, currentActivity, activity));
                        that.swipeActivity = activity;

                        that.swiperPromise.resolve();
                    });

                } else {
                    that.swiperPromise = null;
                }
            },

            move: function (e) {
                var that = this,
                per,
                deltaX = that.touch.dx;

                if (!that.swiperPromise) return;

                that.swiperPromise.then(function () {
                    if (that.isSwipeLeft && deltaX < 0 || !that.isSwipeLeft && deltaX > 0) {
                        that.swiper.step(0);
                        return;
                    }

                    per = Math.abs(deltaX) * 100 / that.width;

                    that.swiper.step(per);
                }, that);
            },

            stop: function () {
                var that = this;

                that.isCancelSwipe = that.touch.isMoveLeft !== that.isSwipeLeft || Math.abs(that.touch.dx) <= 10;

                if (that.swiperPromise) {
                    that.swiperPromise.then(function () {
                        that.queue([200, that.isCancelSwipe ? 0 : 100, function () {
                            var activity = that.swipeActivity,
                            currentActivity = that._currentActivity;

                            if (that.isCancelSwipe) {
                                currentActivity.isPrepareExitAnimation = false;
                                currentActivity.$el.addClass('active');
                                activity.$el.remove();
                                that.mask.hide();
                            } else {

                                that._currentActivity = that.swipeActivity;
                                that.navigate(activity.url);

                                activity.finishEnterAnimation();

                                if (that.isSwipeOpen) {
                                    activity.referrer = currentActivity.url;
                                    activity.referrerDir = that.isSwipeLeft ? "Right" : "Left";
                                    currentActivity.trigger('Pause');
                                } else {
                                    currentActivity.destroy();
                                }
                            }
                            that.turning();
                        }], that.swiper.animate, that.swiper);

                        that.swiperPromise = null;
                    });
                }
            }
        }, application);
    };

    var Application = view.extend(Master, {
        events: {
            'tap,click a[href]:not(.js-link-default)': function (e) {
                var that = this,
                    target = $(e.currentTarget);

                if (!/^(http\:|https\:|javascript\:|mailto\:|tel\:)/.test(target.attr('href'))) {
                    e.preventDefault();
                    if (e.type == 'tap') {
                        var href = target.attr('href');
                        if (!/^#/.test(href)) href = '#' + href;

                        target.attr('forward') != null ? that.forward(href) : target.attr('back') != null ? that.back(href) : that.to(href);
                    }

                } else {
                    target.addClass('js-link-default');
                }

                return false;
            },
            'tap [data-back]': function (e) {
                this.back($(e.currentTarget).attr('data-back'));
            },
            'tap [data-forward]': function (e) {
                this.forward($(e.currentTarget).attr('data-forward'));
            },
            'focus input': function (e) {
                this.activeInput = e.target;
            }
        },

        _history: [],
        _historyCursor: -1,
        isHistoryBack: false,

        el: '<div class="screen" style="position:fixed;top:0px;bottom:0px;right:0px;width:100%;background:rgba(0,0,0,0);z-index:2000;display:none"></div><div class="viewport"></div><canvas class="imagecanvas"></canvas><input type="text" style="position:absolute;height:20px;top: -20px;left:0px;box-sizing: border-box;">',

        backGesture: true,

        initialize: function () {
            var that = this,
                preventEvents = 'tap click touchend touchmove touchstart';

            that._queue = new LinkList();

            that.mask = $(that.$el[0]).off(preventEvents).on(preventEvents, false);

            that.el = that.$el[1];
            that.canvas = that.$el[2];
            that.$input = that.$el[3];

            if (that.backGesture) bindBackGesture(this);

            var prepareExit = false;

            this.on('back', function () {
                var hash = location.hash;
                if (hash == '' || hash === '#' || hash === "/" || hash === "#/") {
                    if (prepareExit) {
                        bridge.exit();
                    } else {
                        prepareExit = true;
                        setTimeout(function () {
                            prepareExit = false;
                        }, 2000);
                        sl.tip("再按一次退出程序");
                    }

                } else {
                    history.back();
                }
            });
        },

        start: function () {
            var that = this;
            var $win = $(window);
            var hash = location.hash || '/';

            that.$el.appendTo(document.body);
            that.$el = $(that.el);

            if (bridge.hasStatusBar) {
                that.$el.addClass('has_status_bar');
            }

            that.hash = hash = standardizeHash(hash);

            that.queue([hash, function (activity) {
                activity.$el.appendTo(that.el);
                that._currentActivity = activity;
                that._history.push(activity.url);
                that._historyCursor++;

                activity.$el.transform(require('anim/' + activity.toggleAnim).openEnterAnimationTo);
                activity.then(function () {
                    activity.$el.addClass('active');
                    activity.trigger('Resume').trigger('Show');

                    that.trigger('start');
                    that.turning();
                });

                $win.on('hashchange', function () {
                    hash = that.hash = standardizeHash(location.hash);

                    var index = lastIndexOf(that._history, hash),
                    isForward = (that._skipRecordHistory || index == -1) && !that.isHistoryBack;

                    if (that._skipRecordHistory !== true) {
                        if (index == -1) {
                            that.isHistoryBack ? that._history.splice(that._historyCursor, 0, hash) : (that._history.push(hash), that._historyCursor++);
                        } else {
                            that._history.length = index + 1;
                            that._historyCursor = index;
                        }
                    } else
                        that._skipRecordHistory = false;

                    if (that.skip == 0) {
                        that[isForward ? 'forward' : 'back'](hash);

                    } else if (that.skip > 0)
                        that.skip--;
                    else
                        that.skip = 0;

                    that.isHistoryBack = false;
                });

            }], that.get, that);

            $(window).on('load', function () {
                if (!location.hash) location.hash = '/';
            });
        },

        _queue: null,

        queue: function (args, fn, context) {
            var queue = this._queue;

            if (typeof args == 'function') context = fn, fn = args, args = undefined;

            queue.append({
                context: context,
                fn: fn,
                args: args
            });

            if (queue.length == 1)
                fn.apply(context, args);
        },

        turning: function () {
            var queue = this._queue;

            if (queue.length) {
                queue.shift();
                if (queue.length) {
                    queue = queue.first();
                    queue.fn.apply(queue.context, queue.args);
                }
            }
        },

        _animationTo: function (url, duration, toggleAnim, type, callback) {

            var that = this,
                currentActivity = that._currentActivity,
                route = typeof url == "string" ? that.route.match(url) : url;

            url = route.url;

            if (!duration) duration = 300;

            if (url != standardizeHash(location.hash) && that._queue.length == 1) {
                var args = that._queue.first().args;
                if (args && args[0] === url) that.navigate(url);
            }

            if (currentActivity.path == route.path) {
                checkQueryString(currentActivity, route);
                that.turning();
                return;
            }

            that.get(route, function (activity) {
                if (activity.path == currentActivity.path) {
                    checkQueryString(activity, route);
                    that.turning();
                    return;
                }
                that._currentActivity = activity;

                adjustActivity(currentActivity, activity);

                activity.then(function () {
                    activity.trigger('Resume');
                });

                var isOpen = type == 'open',
                    ease = type == 'open' ? 'ease-out' : 'ease-out',
                    anims = getToggleAnimation(isOpen, currentActivity, activity, toggleAnim),
                    anim;

                if (isOpen) {
                    activity.referrer = currentActivity.url;
                    activity.referrerDir = currentActivity.swipeRightForwardAction == url ? "Left" : "Right";
                }

                var finishExecuted = false;
                var finish = function () {
                    if (finishExecuted) return;
                    finishExecuted = true;
                    clearTimeout(finishTimer);
                    callback && callback(activity);
                    activity.finishEnterAnimation();
                    that.turning();
                }
                var finishTimer = setTimeout(finish, duration + 100);

                for (var i = 0, n = anims.length; i < n; i++) {
                    anim = anims[i];
                    anim.ease = ease;
                    anim.duration = duration;

                    anim.el.css(animation.transform(anim.start).css).animate(anim.css, duration, ease, finish);
                }

                //anim.finish = finish;
                //animation.parallel(anims);
            });
        },

        to: function (url) {
            this.queue(function () {
                this._navigate(url);
                this.turning();
            }, this);
        },

        _navigate: function (url, skip) {
            url = standardizeHash(url);

            var that = this,
                index = lastIndexOf(that._history, url);

            if (skip === true) {
                that.skip++;
            }

            if (index == -1) {
                that._history.splice(that._historyCursor + 1, 0, url);
                that._history.length = that._historyCursor + 2;
                that._historyCursor++;
                that._skipRecordHistory = true;

                location.hash = url;

            } else {
                if (index != that._historyCursor) {
                    history.go(index - that._historyCursor);
                }
                if (skip === true) {
                    that._history.length = index + 1;
                    that._historyCursor = index;
                }
            }
        },

        navigate: function (url) {
            this._navigate(url, true);
        },

        forward: function (url, duration, toggleAnim) {
            var route = this.route.match(url);
            if (route)
                this.queue([route.url], function () {
                    var currentActivity = this._currentActivity;

                    this._animationTo(url, duration, toggleAnim, 'open', function () {
                        currentActivity.trigger('Pause');
                    });
                }, this);
        },

        back: function (url, duration, toggleAnim) {
            var route = this.route.match(url);
            if (route)
                this.queue([route.url], function () {
                    var that = this,
                        currentActivity = that._currentActivity;

                    if (!route) {
                        currentActivity.startExit();
                        that.isHistoryBack = true;
                        history.back();
                        that.turning();

                    } else {
                        if (typeof duration === 'string') {
                            toggleAnim = duration;
                            duration = null;
                        }
                        that._animationTo(route, duration, toggleAnim, 'close', function () {
                            currentActivity.destroy();
                        });
                    }
                }, this);
        }
    });

    return Application;
});
