var express=require('express');
var app=express();
var args=process.argv;
var port=args.length>=3?parseInt(args[2]):5554;

app.use(express.static(__dirname));

app.listen(port,"127.0.0.1");

require('./build');

console.log("start with",port,__dirname,process.argv);
