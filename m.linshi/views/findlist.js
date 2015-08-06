define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/extend/loading');
    var wxshare = require('../widget/extend/wxshare');
    var model = require('../core/model');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');
    var bridge = require('bridge');


    return Activity.extend({
        events: {
            'tap .pianolist_bd>li[data-id]': function (e) {
                var id = e.currentTarget.getAttribute('data-id');
                var item = util.first(this.model.data.data, function (item) {
                    return item.ID == id;
                });
                util.store('find_data', item);

                this.forward('/find/' + (this.id ? this.id + '/' : '') + id);
            },
            'tap .js_back': function () {
                if (sl.isInApp) {
                    alert("linshi://" + JSON.stringify({ method: 'back' }));
                } else {
                    this.back('/brand');
                }
            },
            'tap .js_share': function (e) {
                alert('linshi://' + JSON.stringify({
                    method: "share",
                    params: $.extend(wxshare.getShareData(this.id || 0), {
                        shareUrl: location.href
                    })
                }));
            }
        },
        swipeRightBackAction: sl.isInApp ? null : '/brand',
        className: 'piano_bg',

        onCreate: function () {
            var self = this;

            $(window).on('setMember', function (e, params) {
                if (params && params.member_id) {
                    util.store('member', params);
                }
            });

            if (sl.hasStatusBar) {
                this.$el.find('header').css({ borderTop: '20px solid #f90', 'box-sizing': 'content-box' });
                this.$el.find('.main').css({ top: 67 });
            }

            Scroll.bind(this.$el.find('.main'));

            this.$share = this.$el.find('.js_share');
            if (!sl.isInApp) {
                this.$share.hide();

                if (util.isInWechat) {
                    wxshare($.extend(wxshare.getShareData(this.id || 0), {
                        shareUrl: location.href
                    }));
                }
            }

            this.model = new model.ViewModel(this.$el, {
                title: '发现老师'
            });

            this.loading = new Loading({
                $el: this.$el
            });

            this.loading.showLoading();

            this.id = !this.route.data.id || this.route.data.id == 0 ? '' : this.route.data.id;
            if (this.id) {
                this.$('.pianolist_hd').css({ backgroundImage: getComputedStyle(this.$('.pianolist_hd')[0]).backgroundImage.replace('.jpg', this.id + '.jpg') });
            }

            $.get('data/find' + this.id + '.json', function (res) {
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
