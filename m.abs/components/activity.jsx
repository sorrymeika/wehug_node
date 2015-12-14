var $ = require('$');
var model = require('core/model3');
var api = require("models/base");
var Scroll = require('widget/scroll');

var Month = model.ViewModel.extend({
	el: <div class="hm_shop">
		<div sn-repeat="item in activity">
			<div class="hm_shop_banner" sn-tap="this.jump(item.PrdId)"><img sn-src="{{item.PrdImg}}" /></div>
			<div class="hm_shop_scroll">
				<ul class="{{type=='H'?'hm_shop_list':'sp_list'}}">
					<li class="{{type=='H'?'hm_shop_list_item':'sp_list_item'}}" sn-repeat="prd in item.data" sn-tap="this.jump(prd.PRD_ID)">
						<img sn-src="{{prd.WPP_LIST_PIC}}" />
						<p class="price">￥{{prd.PRD_PRICE}} <del sn-display="{{prd.PRD_SPECIAL_FLAG}}">¥{{prd.PRD_MEMBER_PRICE}}</del></p>
						<p class="name">{{prd.PRD_NAME}}</p>
					</li>
				</ul>
			</div>
		</div>
	</div>,
	
	jump: function(e,id){
		if (id){
			this.view.forward('/item/'+id+'?from=/news/activity'+this.data.id);
		}
	},
	
	initialize: function() {
		var self=this;
		
		self.shopApi = new api.ActivityAPI({
            $el: self.$('.hm_shop'),
			params: {
				h5name: 'api_prod'+this.data.id
			},
            success: function (res) {
                self.set({
                    activity: res.data
                });
				
				if(self.data.type=='H')
					Scroll.bind(self.$('.hm_shop_scroll:not(.s_binded)').addClass('s_binded'), {
						vScroll: false,
						hScroll: true
					});
            }
        });

        self.shopApi.load();
	}
});

module.exports = Month;