var http_proxy = require('../core/http_proxy');
//app.all('*', http_proxy('m.abs.cn', 7788));
//app.all('*', http_proxy('localhost', 6004));
//app.all('*', http_proxy('192.168.0.106', 6004));


var Promise = require('../core/promise');
var fs = require('fs');
var fsc = require('../core/fs');
var path = require('path');
var razor = require('../core/razor');
var _ = require('underscore');
var Tools = require('../tools/tools');

var Util = require('util');
var util = require('../core/util');
_.extend(Util, util);

function trimPath(path) {
    var rpath = /(^\/)|(\/$)/g;
    return path.replace(rpath, '');
}

function combinePath(root, path) {
    var rpath = /(^\/)|(\/$)/g;
    path = path.replace(rpath, '');
    path = (root == '/' || !root ? '' : root.replace(rpath, '')) + '/' + path;
    return path.replace(rpath, '');
}

function combineRouters(config) {
    var result = {};
    config.projects.forEach(function (project) {
        for (var key in project.route) {
            var router = project.route[key];
            var regexStr = combinePath(project.root, key);

            if (typeof router == 'string') {
                router = {
                    controller: router,
                    template: router
                }
            } else {
                router = _.extend({}, router);
            }
            _.extend(router, {
                controller: combinePath("views", router.controller),
                template: combinePath("template", router.template)
            });

            if (project.root && project.root != '/') {
                router.root = project;
            }
            result[regexStr] = router;
        }
    });
    return result;
}

exports.loadConfig = function (callback) {
    var promise = new Promise();

    fs.readFile('./global.json', { encoding: 'utf-8' }, function (err, globalStr) {
        var globalConfig = JSON.parse(globalStr);
        var subPromise = new Promise().resolve();
        globalConfig.routes = {};

        subPromise.each(globalConfig.projects, function (i, project) {

            fs.readFile(path.join(project, 'config.json'), { encoding: 'utf-8' }, function (err, data) {
                var config = JSON.parse(data);
                config.projectPath = project;

                subPromise.next(i, err, config);
            });

        }).then(function (err, result) {
            globalConfig.projects = result;

            promise.resolve(null, callback(err, globalConfig));
        });

    });

    return promise;
}

exports.createIndex = function (config, callback) {
    fs.readFile('./index.html', { encoding: 'utf-8' }, function (err, html) {

        var T = razor.nodeFn(html.replace(/^\uFEFF/i, ''));

        var promise = new Promise().resolve();
        var rimg = /url\(("|'|)([^\)]+)\1\)/g;

        promise.each(config.css, function (i, cssPath) {
            fs.readFile(cssPath, { encoding: 'utf-8' }, function (err, style) {
                promise.next(i, err, style.replace(/^\uFEFF/i, ''));
            });

        }).then(function (err, styles) {

            var style = styles.join('').replace(rimg, function (r0, r1, r2) {
                return "url(images/" + r2 + ")";
            });

            callback(null, T.html(_.extend({}, config, {
                style: "<style>" + style + "</style>",
                routes: combineRouters(config)
            })));
        });
    });
}

function addDefineForSeajs(jsText) {
    if (/\b(module\.exports\s*=)|(exports\.[a-z0-9A-Z_]\s*=)/.test(jsText) && !/\bdefine\(/.test(jsText)) {
        jsText = "define(function (require, exports, module) {" + jsText + "});";
    }
    return jsText;
}

exports.startWebServer = function (config) {
    var express = require('express');
    var app = express();

    app.get('/', function (req, res) {
        exports.createIndex(config, function (err, html) {
            res.send(html);
        });
    });

    config.projects.forEach(function (project) {
        var root = trimPath(project.root);
        var requires = [];

        for (var key in project.js) {
            requires.push.apply(requires, project.js[key]);
        }

        for (var key in project.css) {
            requires.push.apply(requires, project.css[key]);
        }

        app.all((root ? "/" + root : '') + '/template/[\\S\\s]+.js', function (req, res, next) {
            var filePath = req.url.replace(/\.js(\?.*){0,1}$/, '');

            fsc.readFirstExistentFile(['.' + filePath + '.html', '.' + filePath + '.tpl'], function (err, text) {
                if (err) {
                    next();
                    return;
                }
                text = text.replace(/^\uFEFF/i, '');
                text = razor.web(text);
                res.set('Content-Type', "text/javascript; charset=utf-8");
                res.send(text);
            });
        });

        app.all((root ? "/" + root : '') + '/views/[\\S\\s]+.js', function (req, res, next) {
            var filePath = req.url;

            fs.readFile("." + filePath, 'utf-8', function (err, text) {
                if (err) {
                    next();
                    return;
                }
                text = text.replace(/^\uFEFF/i, '');

                console.log(requires);

                text = addDefineForSeajs(text);
                text = Tools.replaceDefine(filePath.replace(/(^\/)|(\.js$)/g, ''), text, requires);

                res.set('Content-Type', "text/javascript; charset=utf-8");
                res.send(text);
            });
        });
    });

    app.all('*.js', function (req, res, next) {
        var filePath = req.url;

        fsc.readFirstExistentFile(_.extend([], _.map(config.projects, 'projectPath'), config.path), [filePath], function (err, text) {
            if (err) {
                next();
                return;
            }
            text = text.replace(/^\uFEFF/i, '');
            text = addDefineForSeajs(text);

            res.set('Content-Type', "text/javascript; charset=utf-8");
            res.send(text);
        });
    });

    config.projects.forEach(function (project) {
        app.use(express.static(project.projectPath));
    });

    config.path.forEach(function (searchPath) {
        app.use(express.static(searchPath));
    });

    app.all('*.css', function (req, res, next) {
        console.log(req.params)
        next();
    });

    console.log("start with", config.port, process.argv);

    app.listen(config.port);
}


var argv = process.argv;
var args = {};

for (var i = 2, arg, length = argv.length; i < length; i++) {
    arg = argv[i];

    arg.replace(/--([^=]+)(?:=(.+)){0,1}/, function (match, key, value) {
        args[key] = value == undefined ? true : eval(value);
        return '';
    });
}


exports.loadConfig(function (err, config) {
    exports.startWebServer(config);
});

//打包
if (args.build) {
    exports.loadConfig(function (err, config) {
        _.extend(config, config.env.production);

        var promise = new Promise().resolve();
        var baseDir = path.join(__dirname, './');
        var destDir = path.join(__dirname, config.dest);
        var tools = new Tools(baseDir, destDir);

        //打包框架
        tools.combine(config.framework);

        //生成首页
        exports.createIndex(config, function (err, html) {
            Tools.save(path.join(destDir, 'index.html'), html);
        });

        //复制图片资源
        promise.each(config.images, function (i, imgDir) {
            fsc.copy(path.join(baseDir, imgDir), path.join(config.dest, 'images'), '*.(jpg|png)', function (err, result) {
                promise.next(i, err, result);
            });
        }).then(function () {
            config.projects.forEach(function (proj) {

                if (proj.images) {
                    proj.images.forEach(function (imgDir) {
                        fsc.copy(path.join(proj.projectPath, imgDir), path.join(config.dest, proj.projectPath, 'images'), '*.(jpg|png)', function (err, result) {

                        });
                    });
                }
            });
        });

        //打包业务代码
        config.projects.forEach(function (project) {
            var promise = new Promise();
            var codes = '';

            for (var key in project.route) {
                var router = project.route[key];
                var controller;
                var template;

                if (typeof router == 'string') {
                    controller = template = router;

                } else {
                    controller = router.controller;
                    template = router.template;
                }
                controller = path.join(baseDir, 'views', controller);
                template = path.join(baseDir, 'template', template);
            }

            promise.then(function () {
                Tools.save(path.join(destDir, project.projectPath, 'controller.js'), codes);
            });
        });

    });
}
    