var express=require('express');
var redis=require('../data/redis');
var app=express();
var args=process.argv;
var port=args.length>=3?parseInt(args[2]):5555;

console.log("start with args",process.argv);

app.get('/',function(req,res) {

    var cache=redis.connect();

    cache.hset("test",'a',"asdf",function() {
        console.log('set')
    });

    cache.hget("test",'a',function(err,obj) {
        console.log(obj)
    })

    res.send('hello world1');
});

app.listen(port,"127.0.0.1");