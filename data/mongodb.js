var async=require('async');
var host="172.16.163.141";

var MongoClient=require('mongodb').MongoClient;

exports.connect=function(callback) {
    MongoClient.connect('mongodb://sa:12345Qwert@'+host+':27017/domestic',callback);
}