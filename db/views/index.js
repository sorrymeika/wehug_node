define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var model = require('core/model2');
    var Page = require('core/page');
    var menu = require('common/menu');
    var Form = require('components/form');
    var Grid = require('components/grid');

    return Page.extend({
        events: {
            'keyup': function (e) {
                var self = this;
                
                if (e.keyCode == 116) {
                    $.post('/api/mysql/query', {
                        query: this.model.data.query

                    }, function (res) {
                        self.setQueryResult(res);

                    }, 'json');
                }
            }
        },

        onCreate: function () {
            var self = this;

            self.on('QueryChange', function () {
                if (self.route.query.database) {
                    self.model.set({
                        database: self.route.query.database
                    });
                }
                if (self.route.query.table) {
                    self.model.set({
                        table: self.route.query.table
                    });
                }
            });

            self.model = new model.ViewModel(this.$el, {
                table: '',
                database: ''
            });

            self.model.on('change:database', function (e, mod, origin, value) {

                self.menu.set({
                    database: value,
                    table: ''
                });

                $.get('/api/mysql/use?database=' + value, function (res) {

                    $.post('/api/mysql/query', {
                        query: 'show tables'
                    }, function (res) {
                        var tables = [];
                        var databases = $.extend(true, [], self.model.data.databases);

                        res.data.forEach(function (item) {
                            tables.push({
                                name: item['Tables_in_' + value]
                            });
                        });

                        var currentDb = util.first(databases, function (db) {
                            return db.Database == value;
                        });
                        currentDb.children = tables;

                        self.menu.setDatabases(databases);

                    }, 'json');

                }, 'json');
            });


            self.model.on('change:table', function (e, mod, origin, value) {
                if (value) {

                    self.menu.set({
                        table: value
                    });

                    $.post('/api/mysql/query', {
                        query: "select COLUMN_NAME,COLUMN_TYPE,IS_NULLABLE,COLUMN_KEY,PRIVILEGES from information_schema.COLUMNS where table_name=@p0 and table_schema=@p1",
                        params: JSON.stringify([self.model.data.table, self.model.data.database])

                    }, function (res) {
                        self.setQueryResult(res);

                    }, 'json');
                }
            });

            $.get('/api/mysql/databases', function (res) {
                self.model.set({
                    databases: res.data,
                    database: self.route.query.database || res.fields[0].db,
                    table: self.route.query.table
                });

            }, 'json');

        },
        setQueryResult: function (res) {
            if (res.success) {
                var columns = [];
                if (res.data && res.data.length) {
                    for (var key in res.data[0]) {
                        columns.push({
                            key: key
                        });
                    }
                }

                this.model.set({
                    result: res.data,
                    columns: columns
                });
            }
        },
        onShow: function () {
            this.menu = menu.get('/');
        },

        onDestory: function () {
        }
    });
});
