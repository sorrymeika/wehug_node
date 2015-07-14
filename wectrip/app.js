var _=require('underscore');

var path=require('path');
var Tools=require('./../tools/tools');
var Util=require('util');
var util=require('./../core/util');
var razor=require('./../core/razor');
var Promise=require('./../core/promise');
var fs=require('fs');

_.extend(Util,util);

var express=require('express');
var app=express();

var generateHomePage=function () {
    var promise=new Promise();
    fs.readFile('./index.tpl',{ encoding: 'utf-8' },function (err,data) {

        data=Tools.compressJs(razor.node(data))

        fs.writeFile('./index.js',data,function (err,res) {
            promise.resolve();
        });
    });
    return promise;
};

var mapRouteAllPages=function (config,routes) {

    var home=require('./index');
    var Route=require('./../core/route');
    var route=new Route(routes);

    for(var i=0,cfg,length=config.projects.length;i<length;i++) {
        cfg=config.projects[i];

        cfg.html=Tools.compressHTML(home.html(_.extend({
            routes: routes,
            isDebugFramework: config.isDebugFramework

        },cfg)));
    }

    app.get("*",function (req,res,next) {
        var data=route.match(req.url),
            cfg,
            html;

        if(data) {
            res.set('Content-Type','text/html');

            for(var i=0,cfg,length=config.projects.length;i<length;i++) {
                cfg=config.projects[i];

                if(cfg.root==data.root) {

                    html=cfg.html.replace('</head>','<script>if(!location.hash)location.hash="'+data.url+'";</script>');

                    res.send(html);
                    break;
                }
            }

        } else {
            next();
        }
    });
};

var mapRouteControllers=function (config) {
    config.projects.forEach(function (data,i) {

        var root=data.root=='/'?'':data.root,
            devPath='/webresource/js'+root;

        app.get(devPath+'/views/*.js',function (req,res) {
            res.set('Content-Type','text/javascript');

            fs.readFile('.'+root+'/views/'+req.params[0]+'.js',{ encoding: 'utf-8' },function (err,text) {
                if(err) {
                    res.send(err);
                    return;
                }
                res.send(text);
            });
        });

        app.get(devPath+'/template/*.js',function (req,res) {
            res.set('Content-Type','text/javascript');

            fs.readFile('.'+root+'/template/'+req.params[0]+'.tpl',{
                encoding: 'utf-8'

            },function (err,text) {
                if(err) {
                    res.send(err);
                    return;
                }
                text=razor.web(text);
                res.send(text);
            });
        });
    });
}

var configloader=require('./configloader');

configloader('./config',function (config,routes) {
    var args=process.argv;

    for(var i=2,arg,length=args.length;i<length;i++) {
        arg=args[i];

        arg.replace(/--([^=]+)(?:=(.+)){0,1}/,function (match,key,value) {
            config[key]=value==undefined?true:eval(value);
            return '';
        });
    }

    generateHomePage()
        .then(function () {
            mapRouteAllPages(config,routes);
            mapRouteControllers(config,routes);
        })
        .then(function () {
            if(config.build) {
                require('./build')();
            }

            app.use(express.static(path.join(__dirname,'../webresource')));
            app.use('/webresource',express.static(path.join(__dirname,'../webresource')));

            app.get('/webresource/js/*.js',function (req,res) {
                res.set('Content-Type','text/javascript');

                fs.readFile('../webresource/js/'+req.params[0]+'.tpl',{
                    encoding: 'utf-8'

                },function (err,text) {
                    if(err) {
                        res.send(err);
                        return;
                    }
                    text=razor.web(text);
                    res.send(text);
                });
            });

            app.listen(config.port);
            console.log("start with",config.port,__dirname,process.argv);
        });
});

