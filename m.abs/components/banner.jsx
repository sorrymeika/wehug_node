var $ = require('$');
var model = require('core/model3');
var api = require('models/base');
var Size = require('components/size');
var util = require('util');

var Banner = model.ViewModel.extend({
	el: <div class="main banner2">
		<img src="http://appuser.abs.cn/dest/images/banner.jpg" data-forward="/news/activity2" />
		<div class="banner2_text">
			1.本次活动仅限新用户参与，每手机账号限领取一次礼物兑换券。<br />
2.礼物兑换券可在“我的卡券”中查看，凭券可兑换纳米净颜美容巾1条。（商品加入购物车-去结算-选择优惠券-点击购买）<br />
3.请在礼物兑换券有效期内及时兑换，逾期作废。<br />
4.本次活动商品数量有限，领完即止。<br />
*本活动最终解释权归上海爱彼此家居用品股份有限公司所有。<br />
		</div>
	</div>,
	
	initialize: function() {
		var self=this;
		
		self.user=util.store('user');
		
		self.set({
			url: encodeURIComponent(location.hash)
		});
		
	}
});

module.exports = Banner;