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
var sass = require('node-sass');

var Util = require('util');
var util = require('../core/util');
_.extend(Util, util);

var combinePath = util.combinePath;
var formatJs = Tools.formatJs;

function trimPath(path) {
    var rpath = /(^\/)|(\/$)/g;
    return path.replace(rpath, '');
}

function combineRouters(config) {
    var result = {};
    config.projects.forEach(function (project) {
        for (var key in project.route) {
            var router = project.route[key];
            var regexStr = trimPath(project.root) + '/' + trimPath(key);

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
            var filePath = "." + req.url;

            fsc.readFirstExistentFile([filePath, filePath + 'x'], function (err, text) {
                if (err) {
                    next();
                    return;
                }
                text = text.replace(/^\uFEFF/i, '');

                text = formatJs(text);
                text = Tools.replaceDefine(filePath.replace(/(^\/)|(\.js$)/g, ''), text, requires);

                res.set('Content-Type', "text/javascript; charset=utf-8");
                res.send(text);
            });
        });
    });

    app.all('*.js', function (req, res, next) {
        var filePath = req.url;

        fsc.readFirstExistentFile(_.map(config.projects, 'projectPath').concat(config.path), [filePath, filePath + 'x'], function (err, text) {
            if (err) {
                next();
                return;
            }
            text = text.replace(/^\uFEFF/i, '');
            text = formatJs(text);

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

        fsc.firstExistentFile(_.map(config.projects, 'projectPath').concat(config.path), [req.params[0] + '.scss'], function (fileName) {
            if (!fileName) {
                next();
                return;
            }

            sass.render({
                file: fileName

            }, function (err, result) {
                if (err) {
                    console.log(err);
                    next();

                } else {
                    res.set('Content-Type', "text/css; charset=utf-8");
                    res.send(result.css.toString());
                }

            });
        });
    });

    app.use('/dest', express.static(config.dest));

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

//打包
if (args.build) {
    exports.loadConfig(function (err, config) {
        _.extend(config, config.env.production);

        var baseDir = path.join(__dirname, './');
        var destDir = path.join(__dirname, config.dest);
        var tools = new Tools(baseDir, destDir);

        //打包框架
        tools.combine(config.framework);

        //生成首页
        exports.createIndex(config, function (err, html) {
            Tools.save(path.join(destDir, 'index.html'), Tools.compressHTML(html));
        });

        //打包业务代码
        config.projects.forEach(function (project) {
            var promise = new Promise().resolve();
            var codes = '';
            var requires = [];

            for (var key in project.js) {
                requires.push(key);

                //打包项目引用js                
                (function (key, filePromise) {

                    filePromise.each(project.js[key], function (i, file) {
                        fsc.readFirstExistentFile([project.projectPath], [file + '.js', file + '.jsx'], function (err, text) {
                            text = formatJs(text);
                            text = Tools.compressJs(Tools.replaceDefine(combinePath(project.projectPath, file), text));

                            filePromise.next(i, err, text);
                        });

                    }).then(function (err, results) {

                        Tools.save(path.join(destDir, project.projectPath, key + '.js'), results.join(''));
                    });

                })(key, new Promise().resolve());
            }

            for (var key in project.css) {
                requires.push(key);
                
                //打包项目引用css
                (function (key, filePromise) {
                    filePromise.each(project.css[key], function (i, file) {

                        fsc.firstExistentFile([path.join(project.projectPath, file), path.join(project.projectPath, file).replace(/\.css$/, '.scss')], function (file) {

                            if (/\.css$/.test(file)) {
                                fs.readFile(file, 'utf-8', function (err, text) {
                                    text = Tools.compressCss(text);
                                    filePromise.next(i, err, text);
                                });
                            } else {
                                sass.render({
                                    file: file

                                }, function (err, result) {
                                    result = Tools.compressCss(result.css.toString());
                                    filePromise.next(i, err, result);
                                });
                            }
                        });

                    }).then(function (err, results) {
                        Tools.save(path.join(destDir, project.projectPath, key), results.join(''));
                    });

                })(key, new Promise().resolve());

            }

            //打包template和controller
            for (var key in project.route) {
                (function (router) {

                    var controller;
                    var template;

                    if (typeof router == 'string') {
                        controller = template = router;

                    } else {
                        controller = router.controller;
                        template = router.template;
                    }

                    controller = combinePath(project.projectPath, 'views', controller);
                    template = combinePath(project.projectPath, 'template', template);

                    var controllerPath = path.join(baseDir, controller);
                    var templatePath = path.join(baseDir, template);

                    promise.then(function () { 
                        //打包模版
                        fsc.readFirstExistentFile([templatePath + '.html', templatePath + '.tpl'], function (err, text) {
                            if (!err) {
                                text = razor.web(text);
                                text = Tools.compressJs(Tools.replaceDefine(template, text));
                                codes += text;
                            }

                            promise.resolve();
                        });

                        return promise;

                    }).then(function () {
                        //打包控制器
                        fsc.readFirstExistentFile([controllerPath + '.js', controllerPath + '.jsx'], function (err, text) {
                            if (!err) {
                                text = formatJs(text);
                                text = Tools.compressJs(Tools.replaceDefine(controller, text, requires));
                                codes += text;
                            }

                            promise.resolve();
                        });

                        return promise;
                    });

                })(project.route[key]);
            }

            //保存合并后的业务代码
            promise.then(function () {
                Tools.save(path.join(destDir, project.projectPath, 'controller.js'), codes);
            });
        });
        
        
        //复制图片资源
        var imgPromise = new Promise().resolve();
        imgPromise.each(config.images, function (i, imgDir) {
            fsc.copy(path.join(baseDir, imgDir), path.join(config.dest, 'images'), '*.(jpg|png)', function (err, result) {
                imgPromise.next(i, err, result);
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
    });

} else {
    exports.loadConfig(function (err, config) {
        exports.startWebServer(config);
    });
}
    