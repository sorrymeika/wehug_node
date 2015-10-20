define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util'),
        Page = require('core/page'),
        Model = require('core/model2').ViewModel;

    return Page.extend({
        events: {},

        onCreate: function () {
            var self = this;

            var model = new Model(this.$el, {
                data: [{
                    name: 'test',
                    data: [{
                        name: 'test_child'
                    }],
                }, {
                    name: '1test',
                    data: [{
                        name: 'test_child2'
                    }],
                }]
            });

            model.set({
                data: [{
                    name: 'test1'
                }, {
                    name: 'test3'
                }]
            })

            model.set({
                data1: [{
                    name: 'test1'
                }, {
                    name: 'test21'
                }]
            })
        },

        onShow: function () {
        },

        onDestory: function () {
        }
    });
});

