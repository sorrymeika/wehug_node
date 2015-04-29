var async=require('async');
var host=require('./data/config').host;

var url='mongodb://sa:12345Qwert@'+host+':27017/admin';
var MongoClient=require('mongodb').MongoClient;

var mysql=require('mysql');

MongoClient.connect(url,function (err,database) {
    console.log("Connected to mongodb",err);

    var domesticDb=database.db('domestic');

    domesticDb.listCollections({ name: "version" }).next(function (err,items) {

        console.log('start',items);

        if(!items) {

            var pool=mysql.createPool({
                host: host,
                user: 'root',
                password: '12345Qwert'
            }).getConnection(function (err,connection) {
                console.log('mysql',err)
                connection.query("create database domestic");
                connection.release();

                console.log("mysql:create database domestic");
            });

            domesticDb.createCollection("version",function (err,obj) {
                console.log("mongodb:create collection version");
            });

        } else {

            var pool=require('./data/mysql');
            var mongodb=require('./data/mongodb');

            var Count=0;

            var executeByDate=function (date,fn) {
                console.log('start')

                Count++;
                domesticDb.collection("version").findOne({ v: date },function (err,obj) {
                    console.log(obj)
                    if(obj==null) {
                        domesticDb.collection("version").insertOne({ v: date },function () {

                            setTimeout(function () {
                                Count--;

                                if(Count<=0) {
                                    domesticDb.close();
                                }
                            },0);
                        });
                        fn();
                    }
                });
            };

            executeByDate("2015-04-29",function () {
                mongodb.connect(function (err,db) {
                    async.map(["master","servant"],db.createCollection.bind(db),function (err,result) {
                        console.log("create collections");

                        db.close();
                    });
                });

                pool.connect(function (err,connection) {
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
                        )  ENGINE=MyISAM DEFAULT CHARSET=utf8",

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

                        ],connection.query.bind(connection),function (err,result) {
                            console.log("create tables");

                            connection.release();
                        });
                });
            });


        }
    });

    return;

});


