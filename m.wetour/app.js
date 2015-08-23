var develop = require('../core/develop');

develop.start(__dirname, function (app) {


    //<!--api proxy
    var http_proxy = require('../core/http_proxy');
    app.all('/mweather/*', http_proxy('m.weather.com.cn', 80));
    app.all('*', http_proxy('localhost', 11405));
    //api proxy-->

});