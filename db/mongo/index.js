var express=require('express');

var app=express.Router();
var connect=require('./connect');

app.get('/',function(req,res) {

    connect(function(err,db) {
        if(err) {
            res.json({
                success: false,
                msg: err
            });
            return;
        }

        db.admin().listDatabases(function(err,dbs) {

            res.json(err?{
                success: false,
                msg: err
            }:{
                success: true,
                data: dbs.databases
            });

            db.close();
        });
    });
});


module.exports=app;