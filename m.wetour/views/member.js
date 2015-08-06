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
            'tap [member="gender"]': function (e) {
                var value = e.currentTarget.getAttribute('value');

                if (this.model.get('user.Gender') != value)
                    this.setMemberInfo({
                        userid: this.user.ID,
                        auth: this.user.Auth,
                        Gender: value
                    });
            },
            'change form input[type="file"]': function (e) {
                guid++;
                var self = this;
                var form = e.target.parentNode;
                var target = "_submit_iframe" + guid;
                var resultText;
                var $iframe = $('<iframe style="top:-999px;left:-999px;position:absolute;display:none;" frameborder="0" width="0" height="0" name="' + target + '"></iframe>')
                        .appendTo(document.body)
                        .on('load', function () {
                            var result;
                            try {
                                result = $.trim((this.contentWindow.document.body.innerHTML));
                            } catch (e) {
                                self.loading.load();
                                return;
                            }
                            if (!resultText || result != resultText) {
                                resultText = result;
                                try {
                                    result = JSON.parse(resultText);

                                    if (result.success) {
                                        var photo_ver = Date.now();
                                        localStorage.setItem('photo_ver', photo_ver);
                                        self.loading.load();
                                    } else {
                                        sl.tip(result.msg)
                                    }

                                } catch (e) {
                                    sl.tip(e.message)
                                }
                            }
                        });

                form.target = target;
                form.submit();
            }
        },
        swipeRightBackAction: '/',

        setMemberInfo: function (data) {
            var self = this;
            this.loading.showLoading();
            $.post(bridge.url('/api/user/update'), data, function (res) {
                if (!res.success) {
                    sl.tip(res.msg);
                } else {
                    self.model.set('user', data);
                }
                self.loading.hideLoading();
            }, 'json');
        },

        onCreate: function () {
            var self = this;

            this.model = new model.ViewModel(this.$el, {
                title: '个人信息',
                back: '/',
                upload: bridge.url('/api/user/update')
            });

            ['NickName', 'Address'].forEach(function (name) {
                self.model.set(name, {
                    edit: 'edit',
                    value: '',
                    readonly: true,
                    click: function (e) {
                        if (this.data.edit == 'edit') {
                            self.model.set(name, {
                                value: '确定',
                                readonly: null,
                                edit: 'editing'
                            });
                            self['$' + name].focus();
                        } else {
                            if (self.model.data.user[name] != this.data.input) {

                                var data = {
                                    userid: self.user.ID,
                                    Auth: self.user.Auth
                                };
                                data[name] = this.data.input;

                                self.setMemberInfo(data);
                            }

                            self.model.set(name, {
                                readonly: true,
                                value: '',
                                edit: 'edit'
                            });
                        }
                    }
                });
                self['$' + name] = self.model.$el.find('[sn-model="' + name + '.input"]');
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
                        userid: user.ID,
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
