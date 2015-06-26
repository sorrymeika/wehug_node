var config={
    port: 5555,
    projects: ['./'],
    webresource: '/webresource'
};

var express=require('express');
var app=express();
var args=process.argv;
var port=args.length>=3?parseInt(args[2]):config.port;

var Tools=require('./../tools/tools');
var path=require('path');
var razor=require('./../core/razor');
var Promise=require('./../core/promise');
var fs=require('fs');

var promise=new Promise(function() {

});

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

        console.log(data);

        data=eval('['+data+'][0]');

        var root=data.root.replace(/\/$/,'');

        app.get(root+'/',function() {
        });

        app.get(root+'/template/*.js',function(req,res) {
            res.set('Content-Type','text/javascript');

            fs.readFile('./template/'+req.params[0]+'.tpl',{
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

    app.use(express.static(path.join(__dirname,'../webresource')));
    app.use('/webresource',express.static(path.join(__dirname,'../webresource')));
    app.listen(port);

    console.log("start with",port,__dirname,process.argv);
});





