var express=require('express');
var app=express();
var args=process.argv;
var port=args.length>=3?parseInt(args[2]):5554;

var Tools=require('./../tools/tools');
var path=require('path');

var tools=new Tools(path.join(__dirname,'./'),path.join(__dirname,'./dest'));
var razor=require('./../core/razor');
var fs=require('fs');

app.get('/js/template/*.js',function(req,res) {
    fs.readFile('./template/'+req.params[0]+'.tpl',{
        encoding: 'utf-8'
    },function(err,text) {

        text=tools.compressJs(razor.web(text));
        res.set('Content-Type','text/javascript');
        res.send(text);
    });
});

app.use(express.static(__dirname));

app.listen(port);

//require('./build');

console.log("start with",port,__dirname,process.argv);
