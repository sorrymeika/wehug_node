var async=require('async');
var host=require('./data/config').host;
var promise=require('./core/promise');

var url='mongodb://sa:12345Qwert@'+host+':27017/admin';
var MongoClient=require('mongodb').MongoClient;
var mysql=require('mysql');

var DbManage=function(dbname) {
    this.dbname="";

    MongoClient.connect(url,function(err,database) {
    });
    var domesticDb=database.db(dbname);
}

DbManage.prototype={
    initialize: function(db,dbname) {
        var domesticDb=database.db(this.dbname);

        domesticDb.addUser('sa','12345Qwert',function(err,result) {
            console.log('Create sa',err,result)

            domesticDb.authenticate('sa','12345Qwert',function(err,result) {
                console.log('Authenticate sa',err,result)

                var pool=mysql.createPool({
                    host: host,
                    user: 'root',
                    password: '12345Qwert'
                }).getConnection(function(err,connection) {
                    console.log('Connected to mysql',err)

                    if(err) {
                        database.close();
                        return;
                    }

                    connection.query("create database domestic",function(err,result) {
                        console.log("mysql:create database domestic",err);

                        connection.release();

                        domesticDb.createCollection("version",function(err,obj) {
                            console.log("mongodb:create collection version");
                            database.close();
                        });
                    });
                });
            });
        });
    }
};


MongoClient.connect(url,function(err,database) {
    console.log("Connected to mongodb",err);

    var domesticDb=database.db('domestic');

    domesticDb.listCollections({ name: "version" }).next(function(err,items) {

        console.log('Collection version',items);

        if(!items) {



        } else {

            var pool=require('./data/mysql');
            var mongodb=require('./data/mongodb');

            var collection=domesticDb.collection("version");

            var executeByDate=function(date,callback) {

                collection.findOne({ v: date },function(err,obj) {
                    console.log('Execute sql',date,err,obj);

                    if(obj==null) {

                        callback(function(err,result) {
                            if(err) {
                                console.log('Execute sql failure',date,err,result);
                                database.close();

                            } else {
                                collection.insertOne({ v: date },function() {

                                    console.log('Execute sql success',date,err,result);
                                    database.close();
                                });
                            }
                        });

                    } else {
                        console.log('Sql executed',date);
                        database.close();
                    }
                });
            };

            executeByDate("2015-04-29",function(callback) {

                pool.connect(function(err,connection) {
                    async.mapSeries([

                        "create table Admin(\
                            ID int(11) NOT NULL AUTO_INCREMENT,\
                            Name varchar(200),\
                            Password varchar(200),\
                            `Group` int(11),\
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

                        ],
                    connection.query.bind(connection),function(err,result) {
                        if(err) {
                            callback(err,result);
                            return;
                        }
                        connection.release();

                        mongodb.connect(function(err,db) {
                            async.map(["master","servant"],db.createCollection.bind(db),function(err,result) {
                                db.close();

                                callback(err,result);
                            });
                        });
                    });


                });
            });


        }
    });

});


