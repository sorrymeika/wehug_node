var api = require('models/base');
var model = require('core/model2');
var util = require('util');
var $ = require('$');
var State = model.State;

var User = {
    get: function () {
        var user = State.get('user');
        if (!user) {
            user = util.store('user');
            if (user) {
                State.set('user', user);
            }
        }
        return user;
    },

    set: function (user) {
        if (user != null) {
            user = $.extend({}, User.get(), user);
        }
        util.store('user', user);
        State.set('user', user);
        return this;
    },

    setParam: function (params) {
        userApi.setParam(params);
        return this;
    },

    request: function (callback) {
        var self = this;
        var user = this.get();

        userApi.setParam({
            UserID: user.ID,
            Auth: user.Auth

        }).load(callback);
        return this;
    }
};

var userApi = new api.API({
    el: 'body',
    url: '/api/user/get',
    checkData: false,

    success: function (res) {
        if (res.success) {
            User.set(res.data);
        }
    },

    error: function () {
    }
});

module.exports = User;