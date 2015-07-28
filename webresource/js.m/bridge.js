define(function (require, exports, module) {

    var $ = require('$'),
        util = require('util'),
        ua = navigator.userAgent,
        ios = util.ios,
        isAndroid = util.android,
        slice = Array.prototype.slice,
        blankFn = function () { },
        $win = $(window),
        baseUrl = $('meta[name="api-base-url"]').attr('content');

    window.hybridFunctions = {};
    window.complete = function () {
        if (ios && queue.length != 0) {
            queue.shift();
            if (queue.length != 0) location.href = queue.shift();
        }
    };

    window.trigger = window.app_trigger = function () {
        $.fn.trigger.apply($win, arguments);
    };

    window.callJS = function (data) {
        $win.trigger(data.method, data.params);
    }

    var queue = [],
        guid = 0,
        hybrid = function (method, params, hybridCallback) {

            var data = {
                method: method
            },
            hybridReturn;

            hybridCallback = typeof params === "function" ? params : hybridCallback;
            params = typeof params === "function" ? null : params;

            data.params = params;

            if (typeof hybridCallback == "function") {
                hybridReturn = "hybridCallback" + (++guid);

                data.callback = hybridReturn;
                hybridFunctions[hybridReturn] = function () {
                    hybridCallback.apply(null, arguments);
                    delete hybridFunctions[hybridReturn];
                };
            }

            if (bridge.isDevelopment) {
                switch (data.method) {
                    case 'exitLauncher':
                        hybridFunctions[hybridReturn]();
                        break;
                }
                return;
            }

            if (ios) {
                alert(JSON.stringify(data));
            } else if (isAndroid) {
                prompt(JSON.stringify(data));
            }
        },
        bridge = {
            isInApp: /SLApp/.test(ua),
            isAndroid: isAndroid,
            android: isAndroid,
            ios: ios,
            versionName: isAndroid ? '1.0' : "1.0",
            exec: hybrid,
            exitLauncher: function (f) {
                hybrid('exitLauncher', function () {
                    f && f();
                });
            },
            tip: function (msg) {
                hybrid('tip', msg + "");
            },
            pickImage: function (f) {
                hybrid('pickImage', f);
            },
            takePhoto: function (f) {
                setTimeout(function () {
                    hybrid('takePhoto', f);
                }, 0);
            },
            queryThumbnailList: function (f) {
                hybrid('queryThumbnailList', f);
            },
            pickColor: function (f) {
                hybrid('pickColor', f);
            },
            pay: function (data, f) {
                hybrid('pay', data, f);
            },
            share: function () {
                hybrid('share');
            },
            isDevelopment: navigator.platform == "Win32" || navigator.platform == "Win64",
            url: function (url) {
                return /^http\:\/\//.test(url) ? url : (baseUrl + url);
            },
            post: function (url, data, files, callback) {
                callback = typeof files === 'function' ? files : callback;
                files = typeof files === 'function' ? null : files;

                hybrid('post', {
                    url: this.url(url),
                    files: files,
                    data: data
                }, callback);
            },
            exit: function () {
                hybrid('exit');
            },
            update: function (downloadUrl, versionName, f) {
                hybrid('updateApp', {
                    downloadUrl: downloadUrl,
                    versionName: versionName
                }, f);
            }
        };

    bridge.hasStatusBar = bridge.isInApp && util.ios && util.osVersion >= 7;

    var prepareExit = false;

    $win.on('back', function () {
        var hash = location.hash;
        if (hash == '' || hash === '#' || hash === "/" || hash === "#/") {
            if (prepareExit) {
                bridge.exit();
            } else {
                prepareExit = true;
                setTimeout(function () {
                    prepareExit = false;
                }, 2000);
                bridge.tip("再按一次退出程序");
            }

        } else {
            history.back();
        }
    });

    return bridge;
});
