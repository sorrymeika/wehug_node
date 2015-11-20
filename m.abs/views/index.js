var $ = require('$');
var util = require('util');
var Activity = require('activity');
var bridge = require('bridge');
var Loading = require('../widget/loading');
var Slider = require('../widget/slider');
var model = require('../core/model2');
//var Touch2 = require('../core/touch2');
var Scroll = require('../widget/scroll');
var barcode = require('../util/barcode');
var animation = require('animation');

module.exports = Activity.extend({
    events: {
        'tap .head_tab li': function (e) {
            this.model.set('tab', $(e.target).index());
        },
        'tap .home_tip_mask': function (e) {
            util.store('isFirstOpen', false);
            this.model.set({ isFirstOpen: false });
        },
        'tap .open_msg': function (e) {
            if ($(e.target).hasClass('open_msg')) {
                $(e.target).removeClass('show');
            }
        },
        'tap .js_offline .btn': function () {
            this.userLoading.reload();
        },
        'tap .js_comment_list [data-id]': function (e) {
        },
        'tap .rainbow_bd': function (e) {
            this.$('.footer li').eq(3).trigger('tap');
        },
        'tap .footer li': function (e) {
            var self = this;
            var $target = $(e.currentTarget);
            var index = $target.index();

            if (!$target.hasClass('curr')) {
                $target.addClass('curr').siblings('.curr').removeClass('curr');

                this.model.set({
                    bottomTab: index
                });

                if (index == 1) {
                    if (!this.model.data.baiduMap) {
                        this.model.set('baiduMap', '<iframe class="js_baidu_map" src="' + bridge.url("/baiduMap.html?v3") + '" frameborder="0" ></iframe>');
                        this.$baiduMap = this.$('.js_baidu_map').css({ width: window.innerWidth, height: window.innerHeight - 47 - 44 - (util.isInApp ? 20 : 0) });
                    }

                    bridge.getLocation(function (longitude, latitude) {
                        self.$baiduMap[0].src = bridge.url("/baiduMap.html?v3#longitude=" + longitude + "&latitude=" + latitude);
                    });
                }
            }
        }
    },

    className: 'home',

    onCreate: function () {
        var self = this;

        self.user = util.store('user');

        $.get(bridge.url('/api/settings/update?version=' + sl.appVersion), function (res) {
            if (res.success && res.updateUrl) {
                self.confirm(res.text, function () {
                    bridge.update(res.updateUrl, res.versionName);
                });
            }
        }, 'json');

        this.model = new model.ViewModel(this.$el, {
            menu: 'head_menu',
            titleClass: 'head_title',
            isOffline: false,
            isLogin: !!self.user,
            isFirstOpen: util.store('isFirstOpen') === null,
            msg: 0,
            bottomTab: 0,
            chartType: 0,
            open: function () {
                bridge.openInApp(self.user.OpenUrl || 'http://m.abs.cn');
            },
            openUrl: function (e, url) {
                bridge.openInApp(url || 'http://m.abs.cn');
            }
        });

        var $main = this.$main = this.$('.main');

        Scroll.bind($main);

        /*/<!--
        var touch2 = new Touch2($(this.$main[0]).children());

        touch2.on('start', function () {
            this.maxY = this.el.offsetHeight - this.el.parentNode.clientHeight;

        }).on('move', function () {
            var self = this;
            self.el.style.webkitTransform = 'translate(0px,' + self.y * -1 + 'px)';
        })
        //-->*/

        self.$open_msg = this.$('.open_msg').on($.fx.transitionEnd, function (e) {
            if (!self.$open_msg.hasClass('show')) {
                self.$open_msg.hide();
            }
        });
        Scroll.bind(self.$open_msg.find('.msg_bd'));

        var canvas = this.$('.js_canvas')[0];
        canvas.width = 170;
        canvas.height = 170;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');

        this.userLoading = new Loading({
            url: '/api/user/get',
            check: false,
            checkData: false,
            $el: this.$el,
            success: function (res) {
                if (res.success == false) {
                    if (res.error_code == 503) {
                        self.user = null;
                        self.model.set('isLogin', false);
                    }
                } else {
                    $.extend(self.user, res.data);
                }

                util.store('user', self.user);
                self.model.set({
                    isOffline: false,
                    user: self.user
                });

                self.showEnergy();
                self.getUnreadMsg();

                if (res.vdpMessage) {

                    self.$open_msg.show();
                    self.$open_msg[0].clientHeight;
                    self.$open_msg.addClass('show');

                    self.model.set({
                        message: res.vdpMessage
                    });
                }
            },
            error: function () {
                self.model.set('isOffline', true);
            }
        });

        this.launchLoading = new Loading({
            url: '/api/settings/ad_list?name=launch&type=base64',
            check: false,
            checkData: false,
            $el: $(''),
            success: function (res) {
                if (res && res.data && res.data.length) {
                    localStorage.setItem('LAUNCH_IMAGE', res.data[0].Src);
                }
            }
        });
        this.launchLoading.load();

        var $launchImgs = this.$('.launch img');
        var $mask = this.$('.home_mask').on($.fx.transitionEnd, function (e) {
            if ($mask.hasClass('toggle')) {
                $mask.removeClass('toggle');

                var $el = $launchImgs.filter(':not(.launch_hide)').addClass('launch_hide');

                $launchImgs.eq($el.index() + 1 == $launchImgs.length ? 0 : ($el.index() + 1)).removeClass('launch_hide');
            }
        });

        setTimeout(function () {
            $mask.addClass('toggle');

            setTimeout(arguments.callee, 3200)
        }, 3200);

        self.onResult("Login", function () {
            self.user = util.store('user');
            self.doWhenLogin();
        }).onResult("Logout", function () {
            self.model.set({
                isLogin: false
            });
        });

    },

    _angleFrom: 0,

    drawCircle: function (percent) {
        if (!this._angleFrom) {
            this._angleFrom = 1.5 * Math.PI;
        }
        var angleTo = Math.floor((1.5 + 2 * percent) * 1000) / 1000 * Math.PI;

        var context = this.context;
        var canvas = this.canvas;
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        var radius = centerX - 10;

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.beginPath();
        context.arc(centerX, centerY, radius, this._angleFrom, angleTo, false);
        context.lineWidth = 19;
        context.strokeStyle = '#fff';
        context.stroke();

        //this._angleFrom = angleTo;
    },

    showEnergy: function () {
        if (!this.user) return;

        var self = this;
        var total = Math.round(this.user.Amount);
        var percent = 1;
        var level;
        var nextLevel;
        var currentLevel;
        var levelAmounts;
        var levels = ['银卡会员', '金卡会员', '钻石会员', 'VIP会员', 'SVIP会员', '无敌会员'];

        self.model.set('vip', total < (levelAmounts = 1000) ? (level = 0, nextLevel = 1000 - total, levels[1]) : total < (levelAmounts = 5000) ? (level = 1, nextLevel = 5000 - total, levels[2]) : total < (levelAmounts = 10000) ? (level = 2, nextLevel = 10000 - total, levels[3]) : total < (levelAmounts = 50000) ? (level = 3, nextLevel = 50000 - total, levels[4]) : (level = 4, nextLevel = '0', levels[5]));

        percent = Math.min(1, total / levelAmounts);

        self.model.set({
            nextLevel: nextLevel,
            currentLevel: levels[level],
            levelAmounts: levelAmounts,
            energyPercent: percent * 100 + '%',
            ucCardAmounts: util.formatMoney(total) + (total > 50000 ? '' : ('/' + util.formatMoney(levelAmounts)))
        });

        if (total != self.model.data.energy) {
            self.model.set({
                energy: total
            });
            animation.animate(function (d) {
                var num = Math.round(animation.step(0, total, d));

                self.model.set('energyAnimNum', num);
                self.drawCircle(animation.step(0, percent, d));

            }, 800, 'ease-out')

        }
    },

    getUnreadMsg: function () {
        var self = this;

        $.get(bridge.url('/api/user/get_unread_msg_count'), {
            UserID: self.user.ID,
            Auth: self.user.Auth

        }, function (res) {
            if (res.success) {
                self.model.set('msg', res.count);
            }

        }, 'json');
    },

    doWhenLogin: function () {
        var self = this;

        self.model.set({
            barcode: barcode.code93(self.user.Mobile).replace(/0/g, '<em></em>').replace(/1/g, '<i></i>'),
            user: self.user,
            isLogin: true
        });

        var load = function (token) {
            self.userLoading.setParam({
                UserID: self.user.ID,
                Auth: self.user.Auth,
                IMEI: token || 'CAN_NOT_GET'

            }).load();
        }

        util.isInApp ? bridge.getDeviceToken(load) : load();
        this.getUnreadMsg();
    },

    onLoad: function () {
        if (this.user) {
            this.showEnergy();
            this.doWhenLogin();
        }
    },

    onShow: function () {
        var self = this;
    },

    onPause: function () {
    },

    onDestory: function () {
    }
});
