var _ = require('underscore');
var develop = require('../core/develop');
var express = require('express');

develop.start(__dirname, function (app) {

    app.use('/images', express.static('./webresource/images'));

    //<!--api proxy
    var http_proxy = require('../core/http_proxy');

    app.all('/api/*', http_proxy('test.linshi.biz', 80, function (url) {
        return url.replace(/^\/api/, '/v1.5.4');
    }));
    //api proxy-->

});