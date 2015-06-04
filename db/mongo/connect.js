var MongoClient=require('mongodb').MongoClient;

module.exports=function (callback) {
    MongoClient.connect('mongodb://sa:12345Qwert@'+require('../../data/config').host+':27017/admin',callback);
}
