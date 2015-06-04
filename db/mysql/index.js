var express=require('express');

var app=express.Router();
var mysql=require('../../data/mysql');

app.get('/',function (req,res) {
    res.send('mysql')
});


module.exports=app;
