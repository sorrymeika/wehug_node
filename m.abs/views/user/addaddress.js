var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model3');
var Scroll = require('widget/scroll');
var Selector = require('widget/selector');
var animation = require('animation');
var api = require('models/base');

module.exports = Activity.extend({
    events: {
        'tap .js_submit:not(.disabled)': function () {
            this.editAddressAPI.load();
        },
        'tap .js_area': function () {
            var self = this;
            this.selector.show();
            if (self.model.data.province) {
                self.selector.eq(0).index(util.indexOf(self.provinceData, function (item) {
                    return item.PRV_ID == self.model.data.province.PRV_ID;
                }));
                self.resetCity();
            }
        }
    },

    onCreate: function () {
        var self = this;
        var $main = self.$('.main');

        self.user = util.store('user');

        self.swipeRightBackAction = self.route.query.from || '/address';

        Scroll.bind($main);

        self.model = new model.ViewModel(this.$el, {
            back: self.swipeRightBackAction,
            title: '添加地址',
            address: {
                mbaDefault: true
            },
            user: self.user
        });

        self.selector = new Selector({
            options: [{
                template: '<li><%=PRV_ABBR%></li>',
                onChange: function (e, i, data) {
                    self.filterCity(data.PRV_ID || 0);
                }
            }, {
                    template: '<li><%=CTY_ABBR%></li>',
                    onChange: function (e, i, data) {
                        self.filterRegion(data.CTY_ID || 0);
                    }
                }, {
                    template: '<li><%=REG_DESC%></li>'
                }],
            complete: function (res) {

                self.model.set({
                    province: res[0],
                    city: res[1],
                    region: res[2]
                })
            }
        });

        self.selector.eq(0).set([{
            PRV_ABBR: '省'
        }]);

        self.selector.eq(1).set([{
            CTY_ABBR: '市'
        }]);

        this.province = new api.ProvinceAPI({
            $el: self.selector.$el,
            success: function (res) {
                self.provinceData = res.data;
                res.data.unshift({
                    PRV_ABBR: '省'
                });
                self.selector.eq(0).set(res.data);
            }
        });
        this.city = new api.CityAPI({
            $el: self.selector.$el,
            success: function (res) {
                self.cityData = res.data;
            }
        });
        this.region = new api.RegionAPI({
            $el: self.selector.$el,
            success: function (res) {
                self.regionData = res.data;
            }
        });
        this.province.load();
        this.city.load();
        this.region.load();

        self.editAddressAPI = new api.EditAddressAPI({
            $el: self.$el,
            beforeSend: function () {
                var address = self.model.get('address').data;
                console.log(address);
                if (!address.mbaName) {
                    sl.tip('请填写收货人姓名');
                    return false;
                }
                if (!address.mbaMobile) {
                    sl.tip('请填写手机号码');
                    return false;
                } else if (!util.valicateMobile(address.mbaMobile)) {
                    sl.tip('请填写正确的手机号码');
                    return false;
                }
                if (!address.mbaAddress) {
                    sl.tip('请填写详细地址');
                    return false;
                }
                if (!address.region && address.region.REG_ID) {
                    sl.tip('请选择省市区');
                    return false;
                }
                address.mbaRegId = address.region.REG_ID;
                address.mbaCtyId = address.city.CTY_ID;
                address.editType = self.route.query.editType || 1;
                address.mbaId = self.route.query.id || 0;

                this.setParam(address);
            },
            success: function (res) {
                console.log(res);
                if (res.success) {
                    sl.tip('保存成功！');
                } else {
                    sl.tip(res.msg);
                }
            }
        });
    },

    resetCity: function () {
        var self = this;
        if (self.model.data.city) {
            var index = util.indexOf(this.selector.eq(1).data, function (item) {
                return item.CTY_ID == self.model.data.city.CTY_ID;
            });

            if (index != -1) {
                this.selector.eq(1).index(index);
            }
            self.resetRegion();
        }
    },

    filterCity: function (prvId) {
        var arr = util.find(this.cityData, function (item) {
            return item.CTY_PRV_ID == prvId;
        });
        arr.unshift({
            CTY_ABBR: '市'
        });
        this.selector.eq(1).set(arr);
        this.resetCity();
    },

    resetRegion: function () {
        var self = this;
        if (self.model.data.region) {
            var index = util.indexOf(this.selector.eq(2).data, function (item) {
                return item.REG_ID == self.model.data.region.REG_ID;
            });

            if (index != -1)
                this.selector.eq(2).index(index);
        }
    },

    filterRegion: function (ctyId) {
        var self = this;
        var arr = util.find(this.regionData, function (item) {
            return item.REG_CTY_ID == ctyId;
        });
        arr.unshift({
            REG_DESC: '区'
        });
        this.selector.eq(2).set(arr);
        this.resetRegion();
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
    }
});
