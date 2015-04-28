var host="172.16.163.141";

var Memcached=require('memcached');

var memcached=new Memcached(host+":11211");

module.exports=memcached;