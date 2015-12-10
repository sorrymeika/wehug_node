var $ = require('$');
var model = require('core/model3');

var Month = model.ViewModel.extend({
	el: <div class="uc_month_get">
		<ul class="list">
			<li><img src="http://www.absimg.com/media/product/images/79011169/168-02.jpg">
			<p class="con">
				<span class="name">食材花园系列海藻沐浴露</span>
				<em>￥99.9</em>
				<del sn-display="{{item.PRD_PRICE!=0&&item.PRD_PRICE<item.PRD_MEMBER_PRICE}}" style="display: none;">￥99.9&nbsp;</del>
				<b class="btn">免费领取</b>
			</p></li>
		</ul>
		<ul class="sp_list">
		<li sn-repeat="item in data" class="sp_list_item" data-forward="/item/402011" sn-index="0"> <img src="http://www.absimg.com/media/product/images/79011169/168-02.jpg"> 
			<p class="price"><b>￥99.9</b><del sn-display="{{item.PRD_PRICE!=0&&item.PRD_PRICE<item.PRD_MEMBER_PRICE}}" style="display: none;">￥99.9&nbsp;</del></p> 
			<p class="name">Kata卡塔时尚拼色软木沙滩拖鞋</p> </li>
		</ul>
	</div>,
	
	
	initialize: function() {
	}
});

module.exports = Month;