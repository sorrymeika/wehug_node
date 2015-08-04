var _ = require('underscore');
var config = require('./config');
var args = process.argv;

for (var i = 2, arg, length = args.length; i < length; i++) {
    arg = args[i];

    arg.replace(/--([^=]+)(?:=(.+)){0,1}/, function (match, key, value) {
        config[key] = value == undefined ? true : eval(value);
        return '';
    });
}

var path = require('path');
var Tools = require('./../tools/tools');

var Util = require('util');
var util = require('./../core/util');
var razor = require('./../core/razor');
var Promise = require('./../core/promise');
var fs = require('fs');

_.extend(Util, util);

var routes = {};
var configList = [];
var projectsConfig = [];
var loadConfig = function (project, callback) {

    fs.readFile(path.join(__dirname, project.replace(/\/$/, '') + '/config.json'), { encoding: 'utf-8' }, function (err, text) {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }

        var webresource = config.webresource.replace(/\/$/, '') + '/',//text.match(/([\'\"]|\b)webresource\1\s*\:\s*([\'\"])(.+?)\2/)[3],
            rwebresource = /@webresource\(('|")(.+?)\1\)/img;

        [text.replace(rwebresource, function (match, qt, url) {
            return '"' + webresource + 'dest.m/' + url.replace(/^\//, '') + '"';

        }), text.replace(rwebresource, function (match, qt, url) {
            return '"' + webresource + url.replace(/^\//, '') + '"';

        })].forEach(function (data, i) {

            data = eval('[' + data + '][0]');

            data.root = '/' + data.root.replace(/^\/|\/$/g, '')
            data.webresource = webresource;

            var root = data.root == '/' ? '' : data.root,
                routeKey,
                routeData,
                routeOption;

            for (var key in data.route) {
                routeOption = data.route[key];
                routeData = {};

                if (typeof routeOption == 'string') {
                    routeData.template = routeData.controller = routeOption;

                } else {
                    routeData.controller = routeOption.controller;
                    routeData.template = routeOption.template || routeData.controller;
                    routeData.api = routeOption.api;
                }

                routeKey = root + key;
                routeData.root = data.root;
                routeData.controller = 'views/' + routeData.controller;
                routeData.template = 'template/' + routeData.template;

                routes[routeKey == '/' ? '/' : routeKey.replace(/\/$/, '')] = routeData;
            }

            if (i == 0) {
                projectsConfig.push(_.extend(data, { debug: false, webresource: webresource + '/dest.m' }));

            } else {
                configList.push(data);
                callback(null, data);
            }
        });
    });
};

var express = require('express');
var app = express();

var promise = new Promise(function () {
    var pms = this;
    fs.readFile('./index.tpl', { encoding: 'utf-8' }, function (err, data) {

        data = data.replace(/^\uFEFF/i, '');
        data = Tools.compressJs(razor.node(data));

        fs.writeFile('./index.js', data, function (err, res) {
            pms.resolve();
        });
    });
    return pms;
});
promise.each(config.projects, function (i, project) {

    loadConfig(project, function (err, data) {

        if (err) {
            promise.next(i, err);
            return;
        }

        var root = data.root == '/' ? '' : data.root,
            visitRoot = '/webresource/js' + root;

        app.get(visitRoot + '/views/*.js', function (req, res) {
            res.set('Content-Type', 'text/javascript');

            fs.readFile('.' + root + '/views/' + req.params[0] + '.js', { encoding: 'utf-8' }, function (err, text) {
                if (err) {
                    res.send(err);
                    return;
                }
                res.send(text);
            });
        });

        app.get(visitRoot + '/template/*.js', function (req, res) {
            res.set('Content-Type', 'text/javascript');

            fs.readFile('.' + root + '/template/' + req.params[0] + '.tpl', {
                encoding: 'utf-8'

            }, function (err, text) {
                if (err) {
                    res.send(err);
                    return;
                }
                text = Tools.webresource(config.webresource, text);
                text = Tools.compressJs(razor.web(text));
                res.send(text);
            });
        });

        promise.next(i);
    });
})
.then(function () {
    var t = require('./index');
    var Route = require('./../core/route');
    var route = new Route(routes);

    for (var i = 0, cfg, length = configList.length; i < length; i++) {
        cfg = configList[i];

        cfg.html = Tools.compressHTML(t.html(_.extend({
            routes: routes,
            isDebugFramework: config.isDebugFramework

        }, cfg)));
    }

    app.get("*", function (req, res, next) {
        var data = route.match(req.url),
            cfg,
            html;

        if (data) {
            res.set('Content-Type', 'text/html');

            for (var i = 0, cfg, length = configList.length; i < length; i++) {
                cfg = configList[i];

                if (cfg.root == data.root) {

                    html = cfg.html;

                    res.send(html);
                    break;
                }
            }

        } else {
            next();
        }
    });

    app.use('/images', express.static('./webresource/images'));
    app.use('/webresource', express.static(path.join(__dirname, './webresource')));
    app.use('/webresource/js', express.static(path.join(__dirname, '../webresource/js.m')));
    app.use('/webresource/images', express.static(path.join(__dirname, '../webresource/images.m')));
    app.use('/webresource', express.static(path.join(__dirname, '../webresource')));

    app.use('/webresource/js', express.static(path.join(__dirname)));
    app.use('/', express.static(path.join(__dirname, './')));


    if (config.build) {
        //<--打包合并
        var tmplPromise = Promise.resolve(),
            views = {};

        tmplPromise.each(route.routes, function (i, buildConfig) {
            var templatePath = './' + buildConfig.template + '.tpl',
                viewPath = './' + buildConfig.view + '.js',
                count = 2,
                callback = function () {
                    count--;
                    if (count == 0) {
                        tmplPromise.next(i);
                    }
                },
                root = buildConfig.root == '/' ? '/' : (buildConfig.root + '/');

            if (!views[root]) views[root] = '';

            fs.readFile(templatePath, { encoding: 'utf-8' }, function (err, data) {
                data = Tools.webresource('', data);
                var nodeCode = Tools.compressJs(razor.node(data));
                var code = Tools.compressJs(Tools.replaceDefine(buildConfig.template, razor.web(data)));

                Tools.save(config.node_dest + '/' + buildConfig.template + '.js', nodeCode);

                views[root] += code;

                callback();
            });

            fs.readFile(viewPath, { encoding: 'utf-8' }, function (err, data) {
                var code = Tools.compressJs(Tools.replaceDefine(buildConfig.view, data));

                views[root] += code;
                callback();
            });
        })
        .then(function () {

            for (var key in views) {
                Tools.save(config.dest + key + 'controller.js', views[key]);
            }

            Tools.save(path.join(config.node_dest, 'config.js'), 'module.exports=' + JSON.stringify(_.extend({}, config, {
                port: 5556,
                isDebugFramework: false,
                debug: false,
                build: false,
                projects: projectsConfig,
                routes: routes
            })));

            Tools.copy(path.join(config.node_dest, 'index.js'), './index.js');

            Tools.save(path.join(config.dest, 'index.html'), t.html({
                routes: routes,
                isDebugFramework: false,
                webresource: '',
                debug: false,
                css: [],
                js: []
            }));

            var tools = new Tools(path.join(__dirname, './'), path.join(__dirname, config.dest));

            tools.combine({
                "images/style.css": ['../webresource/images.m/style.css', '../webresource/images.m/anim.css', './webresource/images/views.css'],
                'slan.m': {
                    'seajs': '../webresource/js/seajs/sea',
                    'zepto': '../webresource/js/zepto',
                    'extend/touch': '../webresource/js.m/extend/touch',
                    'extend/fx': '../webresource/js/extend/fx',
                    'extend/matchMedia': '../webresource/js.m/extend/matchMedia',
                    'extend/ortchange': '../webresource/js.m/extend/ortchange',
                    'util': '../webresource/js/util',
                    'bridge': '../webresource/js.m/bridge',
                    'graphics/matrix2d': '../webresource/js/graphics/matrix2d',
                    'graphics/tween': '../webresource/js/graphics/tween',
                    'core/base': '../webresource/js/core/base',
                    'core/promise': '../webresource/js/core/promise',
                    'core/linklist': '../webresource/js/core/linklist',
                    'core/event': '../webresource/js/core/event',
                    'core/view': '../webresource/js/core/view',
                    'core/model': '../webresource/js/core/model',
                    'core/page': '../webresource/js/core/page',
                    'core/route': '../webresource/js/core/route',
                    'core/animation': '../webresource/js/core/animation',
                    'core/master': '../webresource/js/core/master',
                    'core/app': '../webresource/js.m/core/app',
                    'core/activity': '../webresource/js.m/core/activity',
                    'core/touch': '../webresource/js.m/core/touch',
                    'widget/scrollview': '../webresource/js.m/widget/scrollview',
                    'widget/scroll': '../webresource/js.m/widget/scroll',
                    'widget/tip': '../webresource/js/widget/tip',
                    'widget/dialog': '../webresource/js/widget/dialog',
                    'widget/loading': '../webresource/js.m/widget/loading',
                    'widget/extend/loading': './widget/extend/loading',
                    'widget/extend/wxshare': './widget/extend/wxshare',
                    'anim/default': '../webresource/js.m/anim/default'
                }
            });

            var fsc = require('../core/fs');

            fsc.copy('../webresource/images.m', path.join(config.dest, 'images'), '*.(jpg|png)', function (err, result) {
                fsc.copy('webresource/images', path.join(config.dest, 'images'), '*.(jpg|png)', function (err, result) {
                });
            });

            fsc.copy('data', path.join(config.dest, 'data'), function (err, result) {
            });

            app.listen(config.port);
            console.log("start with", config.port, __dirname, process.argv);
        });
        //打包合并-->

    } else {
        app.listen(config.port);
        console.log("start with", config.port, __dirname, process.argv);
    }
});

