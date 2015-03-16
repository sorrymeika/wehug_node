var express=require('express');
var app=express();
var args=process.argv;
var port=args.length>=3?parseInt(args[2]):5555;

console.log(process.argv)

app.get('/',function(req,res) {
    res.send('hello world');
});

app.listen(port);