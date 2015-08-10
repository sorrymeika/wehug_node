define(function (require, exports, module) {

    var $ = require('$'),
        util = require('util'),
        Activity = require('activity'),
        model = require('core/model'),
        Scroll = require('../widget/scroll'),
        bridge = require('bridge');
    var Loading = require('../widget/loading');
    var guid = 0;

    return Activity.extend({
        events: {
            'tap [user="gender"]': function (e) {
                var value = e.currentTarget.getAttribute('value');
                if (this.model.get('user.Gender') != value)
                    this.setMemberInfo({
                        id: this.user.ID,
                        auth: this.user.Auth,
                        gender: value
                    });
            }
        },
        swipeRightBackAction: '/',

        onCreate: function () {
            var self = this;

            this.model = new model.ViewModel(this.$el, {
                title: '个人信息',
                back: '/'
            });
        },

        onShow: function () {
            var self = this;
            var user = localStorage.getItem('user');
            if (user) {
                self.user = user = JSON.parse(user);
                if (user.Avatars === '') user.Avatars = null;

                this.loading = new Loading({
                    url: '/api/user/get',
                    check: false,
                    checkData: false,
                    params: {
                        id: user.ID,
                        auth: user.Auth
                    },
                    $el: this.$el,
                    success: function (res) {
                        self.user = user = $.extend(user, res.data);
                        if (user.Avatars === '') user.Avatars = null;
                        else user.Avatars = user.Avatars + '?v=' + localStorage.getItem('photo_ver')
                        localStorage.setItem('user', JSON.stringify(user));
                        self.model.set({
                            user: user,
                            'NickName.input': user.NickName,
                            'Address.input': user.Address
                        });
                    }
                });
                this.loading.load();

            } else {
                this.forward('/login');
            }
        },

        onDestory: function () {
        }
    });
});
