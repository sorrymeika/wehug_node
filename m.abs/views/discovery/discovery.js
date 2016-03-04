var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model2');
var Scroll = require('widget/scroll');
var animation = require('animation');
var api = require("models/base");
var discoveryModel = require("models/discovery");
var Share = require('components/share');

module.exports = Activity.extend({
    events: {
        'tap .js_share': function () {
            this.share.show();
        }
    },

    onCreate: function () {
        var self = this;

        Scroll.bind(self.$('.main'));

        self.share = new Share({
            head: '分享'
        });
        self.share.callback = function (res) {

        }
        self.share.$el.appendTo(self.$el);

        self.swipeRightBackAction = self.route.query.from || self.route.referrer || '/';

        self.model = new model.ViewModel(this.$el, {
            back: self.swipeRightBackAction,
            url: encodeURIComponent(self.route.url)
        });

        Scroll.bind(self.model.refs.productScroll);

        var DiscoveryAddShareAPI = new api.DiscoveryAddShareAPI({
            $el: self.$el,
            params: {
                id: self.route.data.id
            }
        });

        var discoveryAPI = new api.DiscoveryAPI({
            $el: self.$el,
            params: {
                id: self.route.data.id
            },
            checkData: false,
            success: function (res) {
                console.log(res);

                self.model.set({
                    data: res.data,
                    plist: res.plist.length ? res.plist : [res.plist]
                });


                self.share.set({
                    title: res.data.DCV_TITLE,
                    linkURL: api.API.prototype.baseUri + '/dest' + sl.appVersion + '/index.html#/discovery/' + self.route.data.id,
                    description: ''
                });

                console.log(res.data.DCV_TITLE)
            },

            error: function () {

            }
        });

        discoveryAPI.load();
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
    }
});