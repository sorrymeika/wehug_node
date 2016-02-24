var express = require('express');

var app = express.Router();
var pools = require('./pools');

app.post('/connect', function (req, res) {

    pools.connect({
        host: "localhost",
        user: 'root',
        password: '12345Qwert'

    }, function (err, conn) {
        res.json({
            success: true
        });
        conn.release();
    });
});

app.get('/config', function (req, res) {
    res.json({
        success: true,
        data: pools.getConfig()
    });
});

app.get('/databases', function (req, res) {
    pools.connect(function (err, conn) {
        conn.query("show databases", function (err, rows, fields) {
            res.json(err ? {
                success: false,
                msg: err

            } : {
                success: true,
                data: rows,
                fields: fields
            });
            conn.release();
        });

    });
});

app.get('/use', function (req, res) {

    var database = req.query.database;

    pools.connect(function (err, conn) {

        console.log('use', database);

        conn.query("use " + database, function (err, rows, fields) {

            res.json(err ? {
                success: false,
                msg: err

            } : {
                success: true,
                data: rows,
                fields: fields
            });

            conn.release();
        });

    });
});

app.all('/query', function (req, res) {
    var query = req.body.query;
    var params = typeof req.body.params == 'string' ? JSON.parse(req.body.params) : [];

    console.log(query, params);

    pools.connect(function (err, conn) {

        conn.query(query, params, function (err, rows, fields) {

            res.json(err ? {
                success: false,
                msg: err

            } : {
                success: true,
                data: rows,
                fields: fields
            });

            conn.release();
        });

    });
});


module.exports = app;
