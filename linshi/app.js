var _=require('underscore');
var config=require('./config');
var args=process.argv;

for(var i=2,arg,length=args.length;i<length;i++) {
    arg=args[i];

    arg.replace(/--([^=]+)(?:=(.+)){0,1}/,function(match,key,value) {
        config[key]=value==undefined?true:eval(value);
        return '';
    });
}



var path=require('path');
var Tools=require('./../tools/tools');
var tools=new Tools(path.join(__dirname,'./'),path.join(__dirname,config.dest));

var Util=require('util');
var util=require('./../core/util');
var razor=require('./../core/razor');
var Promise=require('./../core/promise');
var fs=require('fs');

_.extend(Util,util);

var routes={};
var configList=[];
var loadConfig=function(project,callback) {

    fs.readFile(path.join(__dirname,project.replace(/\/$/,'')+'/config.json'),{ encoding: 'utf-8' },function(err,data) {
        if(err) {
            console.log(err);
            callback(err);
            return;
        }

        var debug=eval(data.match(/([\'\"]|\b)debug\1\s*\:\s*(.+?)\,/)[2]),
            webresource=data.match(/([\'\"]|\b)webresource\1\s*\:\s*([\'\"])(.+?)\2/)[3];

        if(!debug) {
            webresource+='/dest';
        }

        data=data.replace(/@webresource\(('|")(.+?)\1\)/img,function(match,qt,url) {

            return webresource+'/'+url.replace(/^\//,'');
        });

        data=eval('['+data+'][0]');

        data.webresource=webresource;
        data.root='/'+data.root.replace(/^\/|\/$/g,'')

        var root=data.root=='/'?'':data.root,
            routeKey,
            routeData,
            routeOption;

        for(var key in data.route) {
            routeOption=data.route[key];
            routeData={};

            if(typeof routeOption=='string') {
                routeData.template=routeData.controller=routeOption;

            } else {
                routeData.controller=routeOption.controller;
                routeData.template=routeOption.template||routeData.controller;
                routeData.api=routeOption.api;
            }

            routeKey=root+key;
            routeData.root=data.root;
            routeData.controller='views/'+routeData.controller;
            routeData.template='template/'+routeData.template;

            routes[routeKey=='/'?'/':routeKey.replace(/\/$/,'')]=routeData;
        }

        configList.push(data);

        callback(null,data);
    });
};

var express=require('express');
var app=express();

var promise=new Promise(function() {
    var pms=this;
    fs.readFile('./index.tpl',{ encoding: 'utf-8' },function(err,data) {

        data=Tools.compressJs(razor.node(data))
        console.log(data)

        fs.writeFile('./index.js',data,function(err,res) {
            pms.resolve();
        });
    });
    return pms;
});
promise.each(config.projects,function(i,project) {

    loadConfig(project,function(err,data) {

        if(err) {
            promise.next(i,err);
            return;
        }

        if(data.debug) {
            var root=data.root=='/'?'':data.root,
                visitRoot=data.debug?'/webresource/js'+root:root;

            app.get(visitRoot+'/views/*.js',function(req,res) {
                res.set('Content-Type','text/javascript');

                fs.readFile('.'+root+'/views/'+req.params[0]+'.js',{ encoding: 'utf-8' },function(err,text) {
                    if(err) {
                        res.send(err);
                        return;
                    }
                    res.send(text);
                });
            });

            app.get(visitRoot+'/template/*.js',function(req,res) {
                res.set('Content-Type','text/javascript');

                fs.readFile('.'+root+'/template/'+req.params[0]+'.tpl',{
                    encoding: 'utf-8'

                },function(err,text) {
                    if(err) {
                        res.send(err);
                        return;
                    }
                    text=Tools.compressJs(razor.web(text));
                    res.send(text);
                });
            });
        }

        promise.next(i);
    });
})
.then(function() {
    var t=require('./index');
    var Route=require('./../core/route');
    var route=new Route(routes);

    for(var i=0,cfg,length=configList.length;i<length;i++) {
        cfg=configList[i];

        cfg.html=Tools.compressHTML(t.html(_.extend({
            routes: routes,
            isDebugFramework: config.isDebugFramework

        },cfg)));
    }

    app.get("*",function(req,res,next) {
        var data=route.match(req.url),
            cfg,
            html;

        if(data) {
            res.set('Content-Type','text/html');

            for(var i=0,length=configList.length;i<length;i++) {
                cfg=configList[i];

                html=cfg.html.replace('</head>','<script>location.hash="'+data.url+'";</script>');

                console.log(data.template);

                if(!config.debug) {
                    var tmpl=require(config.node_dest+'/'+data.template);
                    if(data.api) {
                    }
                    html=html.replace('<body>','<body><div class="view" data-url="'+util.encodeHTML(data.url)+'" data-path="'+util.encodeHTML(data.path)+'">'+tmpl.html()+'</div>');
                }

                res.send(html);
                break;
            }

        } else {
            next();
        }
    });

    app.use(express.static(path.join(__dirname,'../webresource')));
    app.use('/webresource',express.static(path.join(__dirname,'../webresource')));

    if(config.build) {
        var tmplPromise=Promise.resolve(),
            templates={},
            views={};

        tmplPromise.each(route.routes,function(i,buildConfig) {
            var templatePath='./'+buildConfig.template+'.tpl',
                viewPath='./'+buildConfig.view+'.js',
                count=2,
                callback=function() {
                    count--;
                    if(count==0) {
                        tmplPromise.next(i);
                    }
                },
                root=buildConfig.root=='/'?'/':(buildConfig.root+'/');

            if(!templates[root]) templates[root]='';
            if(!views[root]) views[root]='';

            fs.readFile(templatePath,{ encoding: 'utf-8' },function(err,data) {
                var nodeCode=Tools.compressJs(razor.node(data));
                var code=Tools.compressJs(Tools.replaceDefine(buildConfig.template,razor.web(data)));

                Tools.save(config.node_dest+'/'+buildConfig.template,nodeCode);

                templates[root]+=code;

                callback();
            });

            fs.readFile(viewPath,{ encoding: 'utf-8' },function(err,data) {
                var code=Tools.compressJs(Tools.replaceDefine(buildConfig.view,data,'require("'+root+'razor");'));

                views[root]+=code;
                callback();
            });

            console.log(root);
        })
        .then(function() {
            for(var key in templates) {
                Tools.save(config.dest+key+'razor.js',templates[key]);
            }
            for(var key in views) {
                Tools.save(config.dest+key+'controller.js',views[key]);
            }
            app.listen(config.port);
            console.log("start with",config.port,__dirname,process.argv);
        });

    } else {
        app.listen(config.port);
        console.log("start with",config.port,__dirname,process.argv);
    }

});





