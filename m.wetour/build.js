var config = require('./config');
var path = require('path');
var fs = require('fs');
var Promise = require('./../core/promise');
var Tools = require('./../tools/tools');
var razor = require('./../core/razor');
var tools = new Tools(path.join(__dirname, './'), path.join(__dirname, config.dest));

var build = function (config, routes, projectsRequires) {
    var tmplPromise = Promise.resolve();
    var views = {};
    var Route = require('./../core/route');
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

            Tools.save(config.node_dest + '/' + buildConfig.template + '.js', nodeCode);

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

var configloader = require('./configloader');

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

module.exports = function (env) {
    configloader('./config', env, function (config, routes) {

        var combine = {
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
                'widget/slider': '../webresource/js.m/widget/slider',
                'anim/default': '../webresource/js.m/anim/default'
            }
        };

        var requires = {};

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

        console.log(requires);

        var mainTemplate = require('./index');

        Tools.save(path.join(config.dest, 'index.html'), mainTemplate.html({
            routes: routes,
            isDebugFramework: false,
            webresource: '',
            debug: false,
            css: [],
            js: []
        }));


        tools.combine(combine);

        build(config, routes, requires);
    });
}