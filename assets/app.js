var express=require('express');
var app=express();
var args=process.argv;
var port=args.length>=3?parseInt(args[2]):5554;

var Tools=require('./../tools/tools');
var path=require('path');

var tools=new Tools(path.join(__dirname,'./'),path.join(__dirname,'./dest'));
var razor=require('./../core/razor');
var fs=require('fs');

app.get('/js/template/*.js',function (req,res) {
    fs.readFile('./template/'+req.params[0]+'.tpl',{
        encoding: 'utf-8'
    },function (err,text) {

        text=tools.compressJs(razor.web(text));
        res.set('Content-Type','text/javascript');
        res.send(text);
    });
});


app.get('/test',function (req,res) {

    var Canvas=require('canvas'),
        height=50,
        Image=Canvas.Image,
        canvas=new Canvas(100,50),
        ctx=canvas.getContext('2d');

    var util=require('./../core/util');

    var font=['Impact','Arial'];
    var words=["A","B","C","D","E","F","G","H","J","K","L","M","N","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","m","n","p","q","r","s","t","u","v","w","x","y","z","2","3","4","5","6","7","8","9"];

    var result='';
    var gradient=ctx.createLinearGradient(0,0,50,0);
    gradient.addColorStop(0,"magenta");
    gradient.addColorStop(0.5,"blue");
    gradient.addColorStop(1.0,"red");

    for(var i=0;i<4;i++) {
        var fontSize=util.random(35,40);
        var fontFamily=util.random(0,1);
        var rotate=.01*util.random(-45,45);

        var wordCanvas=new Canvas(50,50),
        wordCtx=wordCanvas.getContext('2d');

        wordCtx.rotate(rotate);
        wordCtx.font=fontSize+'px '+font[fontFamily];
        var c=words[util.random(55)];
        result+=c;

        // 用渐变进行填充
        wordCtx.strokeStyle=gradient;

        wordCtx.strokeText(c,rotate>0.15?rotate*50:5,40);

        var img=new Image;
        img.src=wordCanvas.toBuffer();

        ctx.drawImage(img,i*20,0,50,50)
    }

    gradient=ctx.createLinearGradient(0,0,canvas.width,0);
    gradient.addColorStop(0,"magenta");
    gradient.addColorStop(0.5,"blue");
    gradient.addColorStop(1.0,"red")

    var random=util.random(0,1);
    var from=util.random(0,10);
    var to=util.random(40,50);

    ctx.strokeStyle=gradient;
    ctx.beginPath();
    ctx.lineTo(0,random?from:to);
    ctx.lineTo(100,random?to:from);
    ctx.stroke();

    var stream=canvas.createJPEGStream({
        bufsize: 2048,
        quality: 80
    });

    stream.pipe(res);

    //res.set('Content-Type','text/html');
    //res.end('<img src="'+canvas.toDataURL()+'" />'+result)
})

app.use(express.static(__dirname));

app.listen(port);

//require('./build');

console.log("start with",port,__dirname,process.argv);
