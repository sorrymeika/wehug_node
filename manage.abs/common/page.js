define(function (require, exports, module) {
    var $ = require('$');
    var util = require('util'),
        Page = require('core/page');
    var API = require('models/api').API;

    return Page.extend({
        initialize: function () {
            var self = this;
            Page.prototype.initialize.call(this, arguments);

            new API({
                url: '/api/manage/islogin',
                success: function (res) {
                },
                error: function () {
                    self.forward('/login');
                }
            }).request();
        }
    });
});

