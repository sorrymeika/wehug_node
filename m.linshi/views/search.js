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
            'tap [sn-repeat-name="data"][data-id]': function (e) {
                this.forward('/teacher/' + e.currentTarget.getAttribute('data-id') + '?from=' + this.route.url);
            },
            'tap .js_search': function (e) {
                var param = this.getParam(this.model.data.keywords);
                this.loading.setParam(param).reload();
            }
        },

        getParam: function (keywords) {
            var param = {
                compare_field: keywords == 'q' ? '' : keywords
            };
            if (this.route.queries.course_category) {
                param.course_category = this.route.queries.course_category;
            }
            return param;
        },

        onCreate: function () {
            var self = this;
            var $main = this.$('.main');

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
                checkData: false,
                params: this.getParam(this.route.data.keywords),
                $el: this.$el,
                $content: $main.children(":first-child"),
                $scroll: $main,
                success: function (res) {
                    if (res.data.length >= 10)
                        res.total = (this.pageIndex + 1) * this.pageSize;
                    else if (!res.data || !res.data.length)
                        this.showError({
                            showReload: false,
                            msg: '搜索不到您要找的老师'
                        });

                    self.model.set(res);
                },
                append: function (res) {
                    if (res.data.length >= 10) {
                        res.total = (this.pageIndex + 1) * this.pageSize;
                    }

                    self.model.get('data').append(res.data);
                }
            });

            this.model = new model.ViewModel(this.$el, {});
            this.loading.load();
        },

        onShow: function () {
            var that = this;
        },

        onDestory: function () {
        }
    });
});
