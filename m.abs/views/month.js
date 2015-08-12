﻿define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/loading');
    var model = require('../core/model');
    var Promise = require('../core/promise');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');


    return Activity.extend({
        events: {
            'tap .js_comment': function () {
                this.forward('/destcomment/' + this.route.data.id);
            }
        },

        swipeRightBackAction: '/',

        onCreate: function () {
            var self = this;

            this.promise = new Promise();
            this.$main = this.$('.main');

            Scroll.bind(this.$main);

            this.model = new model.ViewModel(this.$el, {
                title: '我的月礼',
                back: this.route.query.from || '/'
            });

            this.loading = new Loading({
                url: '/api/destination/get',
                params: {
                    id: this.route.data.id
                },
                check: false,
                checkData: false,
                $el: this.$el,
                $content: this.$main.children(":first-child"),
                $scroll: this.$main,
                success: function (res) {
                }
            });

            //this.loading.load();
        },

        onLoad: function () {
        },

        onDestory: function () {
        }
    });
});