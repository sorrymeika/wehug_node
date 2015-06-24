var gitweb=require('gitweb');
var path=require('path');

require('http').createServer(gitweb('/',{

    projectroot: path.join(__dirname,"../"),

    max_depth: 2

})).listen(5554,function() {
    console.log("GitWeb powered by node!\nHTTP server running on port: %d",this.address().port);
});
