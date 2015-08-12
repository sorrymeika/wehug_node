var path = require('path');
var fs = require('fs');
var Promise = require('./promise');
var razor = require('./razor');
var configloader = require('./configloader');
var Tools = require('../tools/tools');

var build = function (config, routes, projectsRequires) {
    var tmplPromise = Promise.resolve();
    var views = {};
    var Route = require('./route');
    var route = new Route(routes);

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
            var nodeCode = Tools.compressJs(razor.node(data));
            var code = Tools.compressJs(Tools.replaceDefine(buildConfig.template, razor.web(data)));

            Tools.save(path.join(config.node_dest, buildConfig.template + '.js'), nodeCode);

            views[root] += code;
            callback();
        });

        fs.readFile(viewPath, { encoding: 'utf-8' }, function (err, data) {
            var requires,
                tmpRequire;
            if (projectsRequires && (tmpRequire = projectsRequires[buildConfig.root]) && tmpRequire.length) {
                requires = tmpRequire;
            }
            var code = Tools.compressJs(Tools.replaceDefine(buildConfig.view, data, requires));

            views[root] += code;
            callback();
        });
    })
    .then(function () {
        for (var key in views) {
            Tools.save(config.dest + key + 'controller.js', views[key]);
        }

        Tools.save(path.join(config.node_dest, 'config.js'), 'module.exports=' + JSON.stringify(config));
        Tools.copy(path.join(config.node_dest, 'index.js'), './index.js');
    });

    return tmplPromise;
}

var getWebsourcePath = function (dir, url, callback) {
    var files = [dir, './', '../'];
    var fileName;

    for (var i = 0; i < files.length; i++) {
        fileName = path.join(files[i], 'webresource/' + url);

        if (fs.existsSync(fileName)) {
            return fileName;
        } else if (url.indexOf('images/') == 0) {
            fileName = path.join(files[i], 'webresource/images.m' + url.substr(6));
            if (fs.existsSync(fileName)) {
                return fileName;
            }
        }
    }
};

var getJsPath = function (dir, url, callback) {
    var files = [dir, './', '../'];
    var fileName;

    for (var i = 0; i < files.length; i++) {
        fileName = path.join(files[i], 'webresource/js/' + url);
        if (fs.existsSync(fileName)) {
            return fileName;
        } else {
            fileName = path.join(files[i], 'webresource/js.m' + url);
            if (fs.existsSync(fileName)) {
                return fileName;
            }
        }
    }
};

module.exports = function (projectPath, env, callback) {

    configloader(path.join(projectPath, 'config'), env, function (config, routes) {

        var combine = {};
        var requires = {};

        config.node_dest = path.join(projectPath, config.node_dest);
        config.dest = path.join(projectPath, config.dest);

        config.projects.forEach(function (project) {
            if (project.css) {
                for (var key in project.css) {
                    var fileList = combine[key];
                    if (!fileList) combine[key] = fileList = [];
                    var cssList = project.css[key];

                    var requireList = requires[project.root];
                    if (!requireList) requires[project.root] = requireList = [];

                    if (requireList.indexOf(key) == -1) {
                        requireList.push(key);
                    }

                    cssList.forEach(function (css) {
                        var file = getWebsourcePath(project.path, css);
                        if (file && fileList.indexOf(file) == -1) {
                            fileList.push(file);
                        }
                    });
                }
            }
        });

        var home = require(path.join(projectPath, './index'));

        Tools.save(path.join(config.dest, 'index.html'), home.html({
            routes: routes,
            isDebugFramework: false,
            webresource: '',
            debug: false,
            css: {},
            js: {}
        }));

        var tools = new Tools(projectPath, config.dest);
        tools.combine(combine);

        build(config, routes, requires);

        var fsc = require('./fs');

        fsc.copy('../webresource/images.m', path.join(config.dest, 'images'), '*.(jpg|png)', function (err, result) {
            fsc.copy(path.join(projectPath, 'webresource/images'), path.join(config.dest, 'images'), '*.(jpg|png)', function (err, result) {
            });

            callback(config, tools);
        });
    });
}