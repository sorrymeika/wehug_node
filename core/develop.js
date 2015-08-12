var _ = require('underscore');

var path = require('path');
var Tools = require('./../tools/tools');
var Util = require('util');
var util = require('./util');
var razor = require('./razor');
var Promise = require('./promise');
var fs = require('fs');

_.extend(Util, util);

var express = require('express');
var app = express();

var generateHomePage = function (project) {

    var promise = new Promise();
    fs.readFile(path.join(project, './index.tpl'), { encoding: 'utf-8' }, function (err, data) {

        data = data.replace(/^\uFEFF/i, '');
        data = Tools.compressJs(razor.node(data))

        fs.writeFile(path.join(project, './index.js'), data, function (err, res) {
            promise.resolve();
        });
    });
    return promise;
};

//<!--映射SEO页面
var mapViews = function (project, config, routes) {

    var home = require(path.join(project, './index'));
    var Route = require('./route');
    var route = new Route(routes);

    for (var i = 0, cfg, length = config.projects.length; i < length; i++) {
        cfg = config.projects[i];

        cfg.html = Tools.compressHTML(home.html(_.extend({
            routes: routes,
            isDebugFramework: config.isDebugFramework

        }, cfg)));
    }

    app.get("*", function (req, res, next) {
        var data = route.match(req.url),
            cfg;

        if (data) {
            res.set('Content-Type', 'text/html');

            for (var i = 0, cfg, length = config.projects.length; i < length; i++) {
                cfg = config.projects[i];

                if (cfg.root == data.root) {
                    res.send(cfg.html.replace('</head>', '<script>if(!location.hash)location.hash="' + data.url + '";</script></head>'));
                    break;
                }
            }

        } else {
            next();
        }
    });
};
//映射SEO页面-->

//<!--映射控制器路由
var mapControllers = function (config) {
    config.projects.forEach(function (data, i) {

        var root = data.root == '/' ? '' : data.root,
            devPath = '/webresource/js' + root;

        app.get(devPath + '/views/*.js', function (req, res) {
            res.set('Content-Type', 'text/javascript');

            fs.readFile('.' + root + '/views/' + req.params[0] + '.js', { encoding: 'utf-8' }, function (err, text) {
                if (err) {
                    res.send(err);
                    return;
                }
                res.send(text);
            });
        });

        app.get(devPath + '/template/*.js', function (req, res) {
            res.set('Content-Type', 'text/javascript');

            fs.readFile('.' + root + '/template/' + req.params[0] + '.tpl', {
                encoding: 'utf-8'

            }, function (err, text) {
                if (err) {
                    res.send(err);
                    return;
                }
                text = razor.web(text);
                res.send(text);
            });
        });
    });
}
//映射控制器路由-->

var configloader = require('../core/configloader');

exports.start = function (project, callback) {

    configloader(path.join(project, './config'), function (config, routes) {
        var args = process.argv;

        for (var i = 2, arg, length = args.length; i < length; i++) {
            arg = args[i];

            arg.replace(/--([^=]+)(?:=(.+)){0,1}/, function (match, key, value) {
                config[key] = value == undefined ? true : eval(value);
                return '';
            });
        }

        generateHomePage(project)
            .then(function () {
                mapViews(project, config, routes);
                mapControllers(config, routes);
            })
            .then(function () {
                if (config.build) {
                    require(path.join(project, './build'))();
                }

                app.use(express.static('../webresource'));
                app.use('/webresource', express.static('../webresource'));
                app.use('/webresource', express.static(path.join(project, './webresource')));
                app.use('/webresource/js', express.static(project));
                app.use('/webresource/js', express.static('../webresource/js.m'));
                app.get('/webresource/js/*.js', function (req, res) {
                    res.set('Content-Type', 'text/javascript');

                    var template = '../webresource/js/' + req.params[0];

                    fs.exists(template, function (exists) {

                        fs.readFile(exists ? template : req.params[0], {
                            encoding: 'utf-8'

                        }, function (err, text) {
                            if (err) {
                                res.send(err);
                                return;
                            }
                            text = razor.web(text);
                            res.send(text);
                        });
                    });
                });

                app.use('/webresource/images', express.static('../webresource/images.m'));

                callback(app);

                app.listen(config.port);
                console.log("start with", config.port, project, process.argv);
            });
    });
}
