﻿var develop = require('../core/develop');

develop.start(__dirname, function (app) {

    var http_proxy = require('../core/http_proxy');
    app.all('*', http_proxy('localhost', 6004));

});