var $ = require('$');
var util = require('util');
var Loading = require('widget/loading');
var model = require('core/model2');
var Scroll = require('widget/scroll');
var animation = require('animation');
var api = require("models/base");
var discoveryModel = require("models/discovery");

module.exports = model.ViewModel.extend({
    el: <div class="discovery">
        <ul class="disc_nav">
            <li><p><em>全部ALL</em></p></li>
            <li sn-repeat="item in typeList"><p data-forward="/discovery/list/{{item.DCT_ID}}"><em>{{item.DCT_DESC}}</em><img src="{{item.DCT_PIC}}" /></p></li>
        </ul>
        <ul class="disc_list">
            <li sn-repeat="item in data" data-forward="/discovery/{{item.DCV_ID}}"><img src="{{item.DCV_SUBTITLE_PIC}}" /></li>
        </ul>
    </div>,
    
    initialize: function () {
        var self = this;
        
        var discoverTypeAPI = new api.DiscoverTypeAPI({
            $el: self.$el,
            success: function(res) {
                
                self.set({
                    typeList: res.data
                });
            },
            
            error: function() {
                
            }
        });
        
        discoverTypeAPI.load();
        
        var discoverListAPI = new api.DiscoverListAPI({
            $el: self.$el,
            showLoading: false,
           
            success: function(res) {
                console.log(res);
                
                discoveryModel.add(res.data);
                
                self.set({
                    data: res.data
                });
            },
            
            append: function(res) {
                if (res.data.length == 10) res.total = (this.pageIndex + 1) * parseInt(this.pageSize);

                self.model.getModel('data').add(res.data);
            },
            
            error: function() {
            }
        });
        
        discoverListAPI.load();
    }
});
