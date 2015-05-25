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


app.get('/test',function(req,res) {

    var Canvas=require('canvas'),
        height=50,
        Image=Canvas.Image,
        canvas=new Canvas(300,500),
        ctx=canvas.getContext('2d');

    var util=require('./../core/util');

    var font=['Impact','Arial'];
    var fontSize=util.random(25,40);
    var fontFamily=util.random(0,1);
    var rotate=.01*util.random(-20,20);

    ctx.rotate(rotate);
    ctx.font=fontSize+'px '+font[fontFamily];
    ctx.fillText("A",10,30);
    ctx.save();

    rotate=rotate* -1+.01*util.random(10,20);
    ctx.rotate(rotate);
    ctx.font='25px Arial';
    ctx.fillText("B",30,25);
    ctx.save();

    rotate=rotate* -1+.01*util.random(10,30);
    ctx.rotate(rotate);
    ctx.font='25px Arial';
    ctx.fillText("C",40,20);
    ctx.save();

    rotate=.01*util.random(-30,30);
    console.log(rotate)
    ctx.font='25px Arial';
    ctx.rotate(rotate);
    ctx.fillText("D",50,10);
    ctx.save();

    ctx.strokeStyle='rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.lineTo(30,20);
    ctx.lineTo(50,30);
    ctx.stroke();

    res.set('Content-Type','text/html');
    res.end('<img src="'+canvas.toDataURL()+'" />')
})

app.use(express.static(__dirname));

app.listen(port);

//require('./build');

console.log("start with",port,__dirname,process.argv);
