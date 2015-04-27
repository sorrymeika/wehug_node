
var async=require('async');
var host="172.16.163.141";

/*
var url='mongodb://sa:12345Qwert@'+host+':27017/admin';
var MongoClient=require('mongodb').MongoClient;
MongoClient.connect(url,function(err,db) {
console.log("Connected to mongodb",err);

var domestic=db.db('domestic');

async.map(["master","servant"],domestic.createCollection.bind(domestic),function(err,result) {
console.log(result)
db.close();
});
});
*/

var mysql=require('mysql');

var pool=mysql.createPool({
    connectionLimit: 10,
    host: host,
    user: 'root',
    password: '12345Qwert',
    database: 'domestic',
    queryFormat: function(query,values) {
        if(!values) return query;
        return query.replace(/\@p(\d+)/g,(function(txt,key) {
            return this.escape(values[key]);
        }).bind(this));
    }
});

pool.getConnection(function(err,connection) {
    return;
    console.log("Connected to mysql",err);

    //connection.query("create database domestic");

    async.mapSeries([

    "create table Admin(\
        ID int(11) NOT NULL AUTO_INCREMENT,\
        Name varchar(200),\
        Password varchar(200),\
        Group int(11),\
        primary key(ID)\
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8",

    "create table Servant(\
        ID int(11) NOT NULL AUTO_INCREMENT,\
        Name varchar(10),\
        Account varchar(50),\
        Password varchar(32),\
        Mobile varchar(11),\
        CityID int,\
        RegionID int,\
        primary key(ID)\
    )  ENGINE=MyISAM DEFAULT CHARSET=utf8",

    "create table Province(\
        ID int(11) NOT NULL AUTO_INCREMENT,\
        Name varchar(10),\
        Sort int(11),\
        primary key(ID)\
    )  ENGINE=MyISAM DEFAULT CHARSET=utf8",,

    "create table City(\
        ID int(11) NOT NULL AUTO_INCREMENT,\
        Name varchar(10),\
        ProvinceID int,\
        Sort int(11),\
        primary key(ID)\
    )  ENGINE=MyISAM DEFAULT CHARSET=utf8",

    "create table Region(\
        ID int(11) NOT NULL AUTO_INCREMENT,\
        Name varchar(10),\
        CityID int,\
        Sort int(11),\
        primary key(ID)\
    )  ENGINE=MyISAM DEFAULT CHARSET=utf8"

    ],connection.query.bind(connection),function(err,result) {
        console.log("create tables");

        connection.release();
    });

});
