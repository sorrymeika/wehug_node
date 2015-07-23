define(function (require, exports, module) {

    var $ = require('$'),
        util = require('util'),
        Activity = require('activity'),
        model = require('core/model'),
        Scroll = require('../widget/scroll'),
        bridge = require('bridge');
    var Loading = require('../widget/extend/loading');
    var guid = 0;

    return Activity.extend({
        events: {
            'tap [member="gender"]': function (e) {
                var value = e.currentTarget.getAttribute('value');
                if (this.model.get('member.sex') != value)
                    this.setMemberInfo({
                        member_id: this.model.get('member.member_id'),
                        sex: value
                    });
            },
            'change form input[type="file"]': function (e) {
                guid++;
                var self = this;
                var form = e.target.parentNode;

                var fr = new FileReader();
                fr.onload = function (evt) {
                    self.loading.showLoading();
                    $.post(bridge.url('/user/edit_photo'), {
                        headPic: encodeURIComponent(evt.target.result.replace(/^data\:image\/[a-z]+\;base64,/g, '')),
                        member_id: self.member.member_id
                    }, function (res) {
                        if (res.error_code != 0) {
                            sl.tip(res.error_msg);
                        } else {
                            var photo_ver = Date.now();
                            localStorage.setItem('photo_ver', photo_ver)
                            self.model.set('member', { head_photo: res.data.head_photo + '?v=' + photo_ver });
                        }
                        self.loading.hideLoading();
                    }, 'json');
                };
                fr.readAsDataURL(e.target.files[0]);
                /*
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
                        */
            }
        },
        swipeRightBackAction: '/',

        setMemberInfo: function (data) {
            var self = this;
            this.loading.showLoading();
            $.post(bridge.url('/user/edit_member_info'), data, function (res) {
                if (res.error_code != 0) {
                    sl.tip(res.error_msg);
                } else {
                    self.model.set('member', data);
                }
                self.loading.hideLoading();
            }, 'json');
        },

        onCreate: function () {
            var self = this;

            this.model = new model.ViewModel(this.$el, {
                title: '个人信息',
                back: '/',
                upload: bridge.url('/user/edit_photo') //'http://api.linshi.biz/user/edit_photo'
            });

            ['nick_name', 'address'].forEach(function (name) {
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
                            if (self.model.data.member[name] != this.input) {

                                var data = {
                                    member_id: self.member.member_id
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
            var member = localStorage.getItem('member');
            if (member) {
                self.member = member = JSON.parse(member);
                if (member.head_photo === '') member.head_photo = null;

                this.loading = new Loading({
                    url: '/user/get_member_info',
                    check: false,
                    checkData: false,
                    params: {
                        member_id: member.member_id
                    },
                    $el: this.$el,
                    success: function (res) {
                        self.member = member = $.extend(member, res.data);
                        if (member.head_photo === '') member.head_photo = null;
                        else member.head_photo = member.head_photo + '?v=' + localStorage.getItem('photo_ver')
                        localStorage.setItem('member', JSON.stringify(member));
                        self.model.set({
                            member: member,
                            'nick_name.input': member.nick_name,
                            'address.input': member.address
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
