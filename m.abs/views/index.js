define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var bridge = require('bridge');
    var Loading = require('../widget/loading');
    var Slider = require('../widget/slider');
    var model = require('../core/model');
    var Scroll = require('../widget/scroll');
    var barcode1 = require('../widget/barcode');
    var barcode = require('../util/barcode');
    var animation = require('animation');

    var points = [1000, 4000, 5000, 45000];
    var pointPercent = function (point) {
        var result = 0;
        for (var i = 0; i < points.length; i++) {
            if (point <= points[i]) {
                result += point * 25 / points[i];
                break;
            } else {
                result += 25;
                point -= points[i];
            }
        }
        return result;
    };

    return Activity.extend({
        events: {
            'tap': function (e) {
                if (e.target == this.el) {
                    this.back('/');
                }
            },
            'tap .open_msg': function (e) {
                if ($(e.target).hasClass('open_msg')) {
                    $(e.target).removeClass('show');
                }
            },
            'tap .head_menu': function (e) {
                this.forward('/menu');
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
                if (index == 1) {
                    bridge.openInApp(this.user.OpenUrl || 'http://m.abs.cn');

                } else if (!$target.hasClass('curr')) {
                    $target.addClass('curr').siblings('.curr').removeClass('curr');
                    this.$main.eq(index).show().siblings('.main').hide();

                    if (index == 2 && !this.model.data.baiduMap) {
                        this.model.set('baiduMap', '<iframe class="js_baidu_map" src="' + bridge.url("/baiduMap.html") + '" frameborder="0" ></iframe>');
                        this.$baiduMap = this.$('.js_baidu_map').css({ width: window.innerWidth, height: window.innerHeight - 47 - 44 - (util.isInApp ? 20 : 0) });

                        bridge.getLocation(function (longitude, b) {
                            self.$baiduMap.src = bridge.url("/baiduMap.html#longitude=" + longitude + "&latitude=" + latitude);
                        });
                    }
                }
            }
        },

        swipeRightForwardAction: '/menu',

        className: 'home',
        titles: ['欢迎来到ABS会员俱乐部', '马上购物', '附件门店', '我'],

        onCreate: function () {
            var self = this;

            $.get(bridge.url('/api/settings/update?version=' + sl.appVersion), function (res) {
                if (res.success && res.updateUrl) {
                    self.confirm(res.text, function () {
                        bridge.open(res.updateUrl, {
                            target: 'browser'
                        });
                    });
                }
            }, 'json');

            model.Filter.formatMoney = util.formatMoney;

            this.model = new model.ViewModel(this.$el, {
                menu: 'head_menu',
                titleClass: 'head_title',
                title: 'ABS + CLUB',
                isLogin: !!util.store('user'),
                msg: 0,
                open: function () {
                    bridge.openInApp(self.user.OpenUrl || 'http://m.abs.cn');
                },
                openUrl: function (e, url) {
                    bridge.openInApp(url || 'http://m.abs.cn');
                }
            });

            var $main = this.$main = this.$('.main');

            Scroll.bind($main.filter('.js_usescroll'), {
                useScroll: true
            });
            Scroll.bind($main.filter(':not(.js_usescroll)'));

            this.$points = this.$('.home_points');
            this.$cursor = this.$('.home_points_cursor');
            self.$open_msg = this.$('.open_msg').on($.fx.transitionEnd, function (e) {
                if (!self.$open_msg.hasClass('show')) {
                    self.$open_msg.hide();
                }
            });
            Scroll.bind(self.$open_msg.find('.msg_bd'));

            this.userLoading = new Loading({
                url: '/api/user/get',
                check: false,
                checkData: false,
                $el: this.$el,
                success: function (res) {
                    $.extend(self.user, res.data);
                    util.store('user', self.user);
                    self.model.set({
                        user: self.user
                    });
                    self.showPoints();
                    self.getUnreadMsg();

                    if (res.vdpMessage) {

                        self.$open_msg.show();
                        self.$open_msg[0].clientHeight;
                        self.$open_msg.addClass('show');

                        self.model.set({
                            message: res.vdpMessage
                        });
                    }
                }
            });

            this.adLoading = new Loading({
                url: '/api/settings/ad_list?name=index1',
                check: false,
                checkData: false,
                $el: this.$el.find('.home_ad'),
                success: function (res) {
                    self.model.set({
                        ads: res.data
                    });

                    var items = self.$('.home_ad > li');
                    items.each(function (i) {
                        var el = this;
                        setTimeout(function () {
                            el.className = 'toggle';
                        }, (i + 1) * 100);
                    })
                }
            });

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
        },

        setRainbow: function () {
            var self = this;
            var total = Math.round(this.user.Amount);
            var percent = pointPercent(total);
            var deg = percent / 50 * 117 - 117;
            var level;
            var nextLevel;
            var currentLevel;
            var levelAmounts;
            var levels = ['银卡会员', '金卡会员', '钻石会员', 'VIP会员', 'SVIP会员', '无敌会员'];
            self.model.set('vip', total < (levelAmounts = 1000) ? (level = 0, nextLevel = 1000 - total, levels[1]) : total < (levelAmounts = 5000) ? (level = 1, nextLevel = 5000 - total, levels[2]) : total < (levelAmounts = 10000) ? (level = 2, nextLevel = 10000 - total, levels[3]) : total < (levelAmounts = 50000) ? (level = 3, nextLevel = 50000 - total, levels[4]) : (level = 4, nextLevel = '0', levels[5]));

            this.$('.rainbow_vip :nth-child(' + (level + 1) + ')').addClass('curr');

            self.model.set('nextLevel', "+" + nextLevel);
            self.model.set('currentLevel', levels[level]);
            self.model.set('levelAmounts', levelAmounts);
            self.model.set('cardAmounts', '(' + util.formatMoney(total) + (total > 50000 ? '' : ('/' + util.formatMoney(levelAmounts))) + ')');

            if (total != self.model.data.point) {
                self.model.set('point', total);

                animation.animate(function (d) {
                    var curr = animation.step(-117, deg, d);
                    var num = Math.round(animation.step(0, total, d));
                    var point = util.circlePoint(0, 0, 91, 90 - curr);

                    if (point.x > 0) {
                        if (deg == 0) {
                            point.x = 0;
                        } else if (deg < 55) {
                            point.x -= 4;
                            point.y += 2;
                        } else if (deg < 80) {
                            point.x -= 7;
                        } else {
                            point.x -= 9;
                            point.y += 2;
                        }
                    } else {
                        point.y += 2;
                    }

                    self.model.set('Point', num);

                    self.$cursor.css({
                        '-webkit-transform': 'rotate(' + deg + 'deg)',
                        top: 91 - point.y,
                        left: 91 + point.x
                    });

                }, 800, 'ease-out')

                if (percent > 50) {
                    this.$points.eq(0).animate({
                        rotate: '0deg'
                    }, 800, 'ease-out');
                } else {
                }
                this.$points.eq(1).animate({
                    rotate: deg + 'deg'

                }, 800, 'ease-out');
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

        onShow: function () {
            var self = this;

            self.user = util.store('user');
            var isLogin = !!self.user;
            self.model.set('isLogin', isLogin);

            if (isLogin) {
                self.showPoints();
                self.model.set('barcode', barcode.code93(self.user.Mobile).replace(/0/g, '<em></em>').replace(/1/g, '<i></i>'))
                .set('user', self.user);

                if (!this.userLoaded && (this.userLoaded = true)) {

                    var load = function (token) {
                        self.userLoading.setParam({
                            UserID: self.user.ID,
                            Auth: self.user.Auth,
                            IMEI: token || 'CAN_NOT_GET'

                        }).load();
                    }

                    util.isInApp ? bridge.getDeviceToken(load) : load();

                    this.adLoading.load();
                }
                else
                    this.getUnreadMsg();
            }
        },

        showPoints: function () {

            this.setRainbow(this.user.Amount);

            this.$('.point_tip').addClass('show');
        },

        onPause: function () {
            //this.$('.point_tip').removeClass('show');
        },

        onDestory: function () {
        }
    });
});
