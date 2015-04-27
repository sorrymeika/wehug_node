var host="172.16.163.141";

var redis=require('redis');

exports.connect=exports.connectMaster=function() {
    return redis.createClient('6379',host);
};

exports.connectSlave=function() {
    return redis.createClient('6379',host);
};