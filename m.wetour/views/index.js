define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/loading');
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
                        self.model.set('menu', 'head_menu');
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
            'tap .head_menu': function (e) {
                this.forward('/menu');
            },
            'focus [sn-model="search"]': function () {
                this.model.set('menu', 'head_back js_back');
                this.$searchFilters.show();
            }
        },

        swipeRightForwardAction: '/menu',

        onCreate: function () {
            var self = this;

            var $main = this.$('.main');
            this.$searchFilters = this.$('.search_filters');

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

            this.model = new model.ViewModel(this.$el, {
                menu: 'head_menu',
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
