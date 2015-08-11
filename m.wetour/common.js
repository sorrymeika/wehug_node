define(function (require, exports, module) {
    var util = require('util');
    var $ = require('$');
    var bridge = require('bridge');

    exports.isFavorite = function (type, id) {
        var user = util.store('user');

        if (user) {
            if (user.Favorite) {
                var favorite = JSON.parse(user.Favorite);
                if (favorite = favorite[type]) {
                    return util.indexOf(favorite, id) != -1;
                }
            }
        }
        return false;
    }

    exports.favorite = function (type, id, isFavorite) {
        var user = util.store('user');

        if (user) {
            var favorite, list;
            if (user.Favorite) {
                favorite = JSON.parse(user.Favorite);
            } else {
                user.Favorite = favorite = {};
            }

            if (favorite[type]) {
                list = favorite[type];

            } else {
                favorite[type] = list = [];
            }

            var index = util.indexOf(list, id);
            if (index != -1) {
                if (!isFavorite) {
                    list.splice(index, 1);
                }
            } else {
                if (isFavorite) {
                    list.push(id);
                }
            }
            user.Favorite = JSON.stringify(favorite);

            $.post(bridge.url('/api/user/update'), {
                UserID: user.ID,
                Auth: user.Auth,
                Favorite: user.Favorite,
                FavoriteID: id,
                FavoriteType: type,
                IsFavorite: isFavorite
            });

            util.store('user', user);

        }
        return false;
    }

});