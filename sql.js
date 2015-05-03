var async=require('async');
var host=require('./data/config').host;
var Promise=require('./core/promise');

var url='mongodb://sa:12345Qwert@'+host+':27017/admin';
var MongoClient=require('mongodb').MongoClient;
var mysql=require('mysql');

var DbVersionController=function (dbname) {
    var self=this;

    this.dbname=dbname;

    this.promise=new Promise(function () {
        var promise=this;

        MongoClient.connect(url,function (err,db) {
            console.log('Connected to MongoClient',err);
            self.db=db;
            var newDb=db.db(dbname);

            newDb.listCollections({ name: 'db.version' }).next(function (err,collections) {
                console.log('Collection db.version',dbname,collections);

                if(!collections) {
                    self.dbInitialize(newDb,function () {

                        newDb.createCollection('db.version',function (err,obj) {
                            console.log("mongodb:create db.version collection",dbname);

                            promise.resolve(null,newDb);
                        });
                    });
                } else {
                    promise.resolve(null,newDb);
                }
            });
        });

        return promise;
    });
}

DbVersionController.prototype={
    dbInitialize: function (db,resolve) {

        db.addUser('sa','12345Qwert',function (err,result) {
            console.log('Create sa',err,result)

            db.authenticate('sa','12345Qwert',function (err,result) {
                console.log('Authenticate sa',err,result)

                var pool=mysql.createPool({
                    host: host,
                    user: 'root',
                    password: '12345Qwert'
                }).getConnection(function (err,connection) {
                    console.log('Connected to mysql',err)

                    if(err) {
                        resolve(err);
                        return;
                    }

                    connection.query("create database domestic",function (err,result) {
                        console.log("mysql:create database domestic",err);

                        connection.release();
                        resolve(null,result);
                    });
                });
            });
        });
    },
    execute: function (version,callback) {

        var promise=this.promise;

        promise.then(function (err,db) {

            if(err) {
                promise.resolve(err,db);
                return;
            }

            var collection=db.collection("db.version");

            collection.findOne({ version: version },function (err,obj) {
                console.log('Execute sql',version,err,obj);

                if(err) {
                    promise.resolve(err,db);

                } else if(obj==null) {

                    new Promise([db],callback)
                        .then(function (err,result) {
                            if(err) {
                                console.log('Execute failure',version,err);

                                promise.resolve(err,db);

                            } else {
                                collection.insertOne({ version: version },function () {
                                    console.log('Execute success',version);
                                    promise.resolve(null,db);
                                });
                            }
                        });

                } else {
                    console.log('Sql executed',version);
                    promise.resolve(null,db);
                }
            });

            return promise;
        });

        return this;
    },
    finish: function () {
        var self=this;

        this.promise.then(function (err,db) {
            self.db.close();
            console.log('Finish');
        });
    }
};

var dbController=new DbVersionController("domestic");

dbController.execute('2015-04-29',function (db) {
    var pool=require('./data/mysql');
    var promise=this;

    pool.connect(function (connection) {
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
        connection.query.bind(connection),function (err,result) {
            if(err) {
                promise.resolve(err,result);
                return;
            }
            connection.release();

            async.map(["master","servant"],db.createCollection.bind(db),function (err,result) {
                promise.resolve(err,result);
            });

        });
    });

    return promise;
});

dbController.execute('2015-05-02',function (db) {
    var pool=require('./data/mysql');
    var promise=this;

    pool.connect(function (err,connection) {

        connection.query("create table Master(\
            ID int(11) NOT NULL AUTO_INCREMENT,\
            Name varchar(10),\
            Account varchar(50),\
            Password varchar(32),\
            Mobile varchar(11),\
            CityID int,\
            RegionID int,\
            primary key(ID)\
        )  ENGINE=MyISAM DEFAULT CHARSET=utf8",function () {
            promise.resolve(err,connection);
        });

        connection.release();
    });

    return promise;
});


dbController.finish();