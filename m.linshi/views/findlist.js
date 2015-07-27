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
            'tap .pianolist_bd>li[data-id]': function (e) {
                var id = e.currentTarget.getAttribute('data-id');
                var item = util.first(this.model.data.data, function (item) {
                    return item.ID == id;
                });
                util.store('find_data', item);
                this.forward('/find/' + id);
            }
        },
        swipeRightBackAction: '/',
        className: 'piano_bg',

        onCreate: function () {
            var self = this;

            var $main = this.$('.pianolist');

            Scroll.bind(this.$el);

            this.model = new model.ViewModel(this.$el, {});

            this.loading = new Loading({
                $el: this.$el
            });

            this.loading.showLoading();
            $.get('data/find.json', function (res) {
                self.model.set(res);
                self.loading.hideLoading();
            }, 'json');

        },

        onShow: function () {
            var self = this;
        },

        onDestory: function () {
        }
    });
});
