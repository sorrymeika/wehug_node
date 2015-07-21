
var _ = require('underscore');
var express = require('express');
var app = express();

var http = require('http');

app.all('/api/*', function (request, response) {
    var url = request.url.replace(/^\/api/, '/v1.5.0');

    console.log(request.url);

    var options = {
        hostname: 'api.linshi.biz',
        port: 80,
        path: url,
        method: request.method,
        headers: _.extend({}, request.headers, { host: 'api.linshi.biz' })
    };

    var req = http.request(options, function (res) {
        response.set(res.headers);
        response.set('Access-Control-Allow-Credentials', true);
        response.set('Access-Control-Allow-Origin', request.headers.origin);

        res.on('data', function (chunk) {
            response.write(chunk);
        });

        res.on('end', function () {
            response.end();
        });
    });

    req.on('error', function (e) {
    });

    request.on('data', function (postData) {
        req.write(postData);
    });

    request.on('end', function () {
        req.end();
    });
});


app.listen(5556);
console.log("start with 5556", __dirname, process.argv);

