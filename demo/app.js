var config={
    port: 5555,
    projects: ['./'],
    webresource: '/webresource/dest'
};

var express=require('express');
var app=express();
var args=process.argv;
var port=args.length>=3?parseInt(args[2]):config.port;

var Tools=require('./../tools/tools');
var path=require('path');
var Util=require('util');
var util=require('./../core/util');
var razor=require('./../core/razor');
var Promise=require('./../core/promise');
var fs=require('fs');

Util.encodeHTML=util.encodeHTML;

var promise=new Promise(function() {
    var pms=this;
    fs.readFile('./index.tpl',{ encoding: 'utf-8' },function(err,data) {
        data=Tools.compressJs(razor.node(data))

        fs.writeFile('./index.js',data,function(err,res) {
            pms.resolve();
        });
    });
    return pms;
});

var routes={},
    configList=[];

promise.each(config.projects,function(i,project) {

    fs.readFile(path.join(__dirname,project+'config.json'),{ encoding: 'utf-8' },function(err,data) {

        if(err) {
            console.log(err);
            promise.next(i,err);
            return;
        }

        data=data.replace(/@webresource\(('|")(.+?)\1\)/img,function(match,qt,url) {

            return config.webresource+'/'+url.replace(/^\//,'');
        });

        data=eval('['+data+'][0]');

        configList.push(data);

        var root=data.root=data.root.replace(/\/$/,'');

        if(root) {
            var viewPath=root.replace(/^\//,'');
            for(var key in data.route) {
                routes[key]=data.route[key]=viewPath+'/'+data.route[key];
            }
            root="/"+viewPath;
        } else {
            for(var key in data.route) {
                routes[key]=data.route[key];
            }
        }

        app.get('/views'+root+'/*.js',function(req,res) {
            res.set('Content-Type','text/javascript');

            fs.readFile('.'+root+'/views/'+req.params[0]+'.js',{ encoding: 'utf-8' },function(err,text) {
                res.send(text);
            });
        });

        app.get(root+'/template/*.js',function(req,res) {
            res.set('Content-Type','text/javascript');

            fs.readFile('.'+root+'/template/'+req.params[0]+'.tpl',{
                encoding: 'utf-8'
            },function(err,text) {

                text=Tools.compressJs(razor.web(text));
                res.send(text);
            });
        });

        promise.next(i);
    });
})
.then(function() {
    var t=require('./index');

    configList.forEach(function(cfg) {

        cfg.routes=routes;

        var html=Tools.compressHTML(t.html(cfg))

        app.get(cfg.root+'/',function(req,res) {
            res.set('Content-Type','text/html');

            res.send(html);
        });
    });

    app.use(express.static(path.join(__dirname,'../webresource')));
    app.use('/webresource',express.static(path.join(__dirname,'../webresource')));
    app.listen(port);

    console.log("start with",port,__dirname,process.argv);
});





