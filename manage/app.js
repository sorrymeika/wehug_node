var express=require('express');
var app=express();
var args=process.argv;
var port=args.length>=3?parseInt(args[2]):5555;

console.log("start with args",process.argv)

app.get('/',function (req,res) {

    var MongoClient=require('mongodb').MongoClient;

    var url='mongodb://192.168.0.106:27017/test';

    MongoClient.connect(url,function (err,db) {
        console.log("Connected correctly to server.");
        db.close();
    });

    res.send('hello world');
});

app.listen(port,"127.0.0.1");