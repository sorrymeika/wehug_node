define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/extend/loading');
    var model = require('../core/model');
    var Promise = require('../core/promise');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');


    return Activity.extend({
        events: {
            'tap .tabs_nav_con li:not(.curr)': function (e) {
                var $target = $(e.currentTarget);

                $target.addClass('curr').siblings('.curr').removeClass('curr');
                this.$panels.eq($target.index()).addClass('curr').siblings('.curr').removeClass('curr');
            },
            'tap .js_course[data-id]': function (e) {
                var $target = $(e.currentTarget);
                var id = $target.data('id');
                this.forward('/buy/' + id);
            }
        },

        onCreate: function () {
            var self = this;

            this.promise = new Promise();
            this.$main = this.$('.main');

            Scroll.bind(this.$main);

            this.$panels = this.$('.tabs_panel');

            model.Filter.precent = function (score) {
                return parseFloat(score) + '%'
            }

            model.Filter.avatar = function (item) {
                return item.head_photo ? item.head_photo : (item.sex == '女' ? 'images/default_photo_fe.png' : 'images/default_photo.png');
            }
            model.Filter.avatarError = function (item) {
                return "this.src='" + (item.sex == '女' ? 'images/default_photo_fe.png' : 'images/default_photo.png') + "'";
            }

            this.model = new model.ViewModel(this.$el, {
                title: '老师详情页',
                back: this.route.queries.from || '/index'
            });

            this.loading = new Loading({
                url: '/teacher/teacher_info',
                params: {
                    teacher_id: this.route.data.id
                },
                check: false,
                checkData: false,
                $el: this.$el,
                success: function (res) {

                    self.promise.then(function () {
                        self.model.set(res.data);
                    });
                    util.store('teacher', res.data);
                }
            });

            this.loading.load();
        },

        onLoad: function () {
            this.promise.resolve();
        },

        onDestory: function () {
        }
    });
});
