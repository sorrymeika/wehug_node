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
            },
            'change form input[type="file"]': function (e) {
                guid++;
                var self = this;
                var form = e.target.parentNode;
                /*
                var fr = new FileReader();
                fr.onload = function (evt) {
                    self.loading.showLoading();
                    $.post(bridge.url('/user/edit_photo'), {
                        headPic: encodeURIComponent(evt.target.result.replace(/^data\:image\/[a-z]+\;base64,/g, '')),
                        member_id: self.user.member_id
                    }, function (res) {
                        if (res.error_code != 0) {
                            sl.tip(res.error_msg);
                        } else {
                            var photo_ver = Date.now();
                            localStorage.setItem('photo_ver', photo_ver)
                            self.model.set('user', { head_photo: res.data.head_photo + '?v=' + photo_ver });
                        }
                        self.loading.hideLoading();
                    }, 'json');
                };
                fr.readAsDataURL(e.target.files[0]);
                        */
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
                                    sl.tip(e.error_msg)

                                    if (result.error_code == 0) {
                                        self.loading.load();
                                    }

                                } catch (e) {
                                    sl.tip(e.message)
                                }
                            }
                        });

                form.submit();
            }
        },
        swipeRightBackAction: '/',

        setMemberInfo: function (data) {
            var self = this;
            this.loading.showLoading();
            $.post(bridge.url('/api/user/update'), data, function (res) {
                if (res.error_code != 0) {
                    sl.tip(res.error_msg);
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
                        if (this.edit == 'edit') {
                            self.model.set(name, {
                                value: '确定',
                                readonly: null,
                                edit: 'editing'
                            });
                            self['$' + name].focus();
                        } else {
                            if (self.model.data.user[name] != this.input) {

                                var data = {
                                    id: self.user.ID
                                };
                                data[name] = this.input;

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
