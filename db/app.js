var express=require('express');
var app=express();
var args=process.argv;
var port=args.length>=3?parseInt(args[2]):5554;

var Tools=require('./../tools/tools');
var path=require('path');
var razor=require('./../core/razor');
var fs=require('fs');


app.get('/captcha',require('./../util/captcha'));

app.get('/js/template/*.js',function (req,res) {
    res.set('Content-Type','text/javascript');

    fs.readFile('./template/'+req.params[0]+'.tpl',{
        encoding: 'utf-8'
    },function (err,text) {

        text=Tools.compressJs(razor.web(text));
        res.send(text);
    });
});

app.use(express.static(path.join(__dirname,'./static')));

app.use(express.static(path.join(__dirname,'../webresource')));
app.use('/webresource',express.static(path.join(__dirname,'../webresource')));

app.use('/mongo',require('./mongo/index'));
app.use('/mysql',require('./mysql/index'));

app.listen(port);

//require('./build');

console.log("start with",port,__dirname,process.argv);
