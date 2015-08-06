define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/extend/loading');
    var model = require('../core/model');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');

    return Activity.extend({
        events: {
            'tap': function (e) {
                if (e.target == this.el) {
                    this.back('/')
                }
            },
            'tap .js_back,.search_filters': function (e) {
                var $target = $(e.target);
                var self = this;
                if ($target.hasClass('js_back') || $target.hasClass('search_filters')) {
                    this.$searchFilters.hide();
                    setTimeout(function () {
                        self.model.set('back', 'head_back js_home');
                    }, 0);
                    return false;
                }
            },
            'tap [sn-repeat-name="data"][data-id]': function (e) {
                this.forward('/teacher/' + e.currentTarget.getAttribute('data-id'));
            },
            'tap .js_search': function (e) {
                var search = this.model.data.search;
                if (search) this.forward('/search/' + search);
                else sl.tip('请输入搜索内容');
            },
            'tap .js_home': function (e) {
                this.back('/');
            },
            'focus [sn-model="search"]': function () {
                this.model.set('back', 'head_back js_back');
                this.$searchFilters.show();
            }
        },

        swipeRightBackAction: '/',

        onCreate: function () {
            var self = this;

            var $main = this.$('.main');
            this.$searchFilters = this.$('.search_filters');

            model.Filter.avatar = function (item) {
                return item.head_photo ? item.head_photo : (item.sex == '女' ? 'images/default_photo_fe.png' : 'images/default_photo.png');
            }
            model.Filter.avatarError = function (item) {
                return "this.src='" + (item.sex == '女' ? 'images/default_photo_fe.png' : 'images/default_photo.png') + "'";
            }

            this.model = new model.ViewModel(this.$el, {
                back: 'head_back js_home',
                filters: [{
                    name: '小学',
                    id: 2
                }, {
                    name: '初中',
                    id: 3
                }, {
                    name: '高中',
                    id: 4
                }, {
                    name: '艺术',
                    id: 6
                }, {
                    name: '体育',
                    id: 5
                }],
                city: {
                    name: '上海'
                },
                showDownload: !util.store('hideDownload'),
                closeDownload: function () {
                    self.model.set('showDownload', false);
                    util.store('hideDownload', true);
                },
                download: function () {
                    if (util.isInWechat) {
                        sl.tip('若微信内无法打开下载链接，请点击右上角并选择“' + (util.ios ? '在Safari中打开' : '在浏览器中打开') + '”');
                    } else {
                        location.href = (util.android ? "http://api.linshi.biz/download/linshi.apk" : "https://itunes.apple.com/us/app/lin-shi/id1001036632?l=zh&ls=1&mt=8");
                    }
                }
            });

            util.store('hideDownload', null)

            Scroll.bind($main, {
                //useScroll: true,
                refresh: function (resolve, reject) {
                    self.loading.reload({
                        showLoading: false
                    }, function (err, data) {
                        if (err) reject(err)
                        else resolve(data);
                    });
                }
            });

            this.loading = new Loading({
                url: '/teacher/teacher_list',
                params: {
                    sort: 'member_id',
                    order_by: 'asc'
                },
                check: false,
                $el: this.$el,
                $content: $main.children(":first-child"),
                $scroll: $main,
                success: function (res) {
                    if (res.data.length >= 10)
                        res.total = (this.pageIndex + 1) * this.pageSize;

                    self.model.set(res);
                },
                append: function (res) {
                    if (res.data.length >= 10) {
                        res.total = (this.pageIndex + 1) * this.pageSize;
                    }

                    self.model.get('data').append(res.data);
                }
            });


            this.loading.load();
        },

        onShow: function () {
            var that = this;
        },

        onDestory: function () {
        }
    });
});
