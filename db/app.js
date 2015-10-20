var develop = require('../core/develop');
var bodyParser = require('body-parser');

develop.start(__dirname, function (app) {

    app.use(bodyParser.urlencoded({ extended: true }));

    app.use('/api/mysql', require('./api/mysql/index'));
});