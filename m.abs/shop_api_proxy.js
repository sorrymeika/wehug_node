var express = require('express');
var app = express();

var http_proxy = require('../core/http_proxy');
app.all('*', http_proxy('appapi.abs.cn', 80));

app.listen(6006);
