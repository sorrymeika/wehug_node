var $ = require('$');
var model = require('core/model3');
var Share = require('components/share');

var Month = model.ViewModel.extend({
	el: <div class="od_share">
		<h1>支付成功</h1>
		<h2>感谢在ABS购买商品</h2>
		<div class="con">
			<h3>恭喜您获得</h3>
			<h4>纳米净颜美容巾免费领取兑换券</h4>
			<h3>赶快呼唤好友来领取吧!</h3>
			<h5>*分享的礼物券中有3张被好友成功领取，就可以获得<em>500积分</em>（全场通用，可直接抵扣现金）</h5>
			<div class="btn" sn-tap="this.showShare()">发礼物，抢500积分</div>
		</div>
	</div>,
	
	showShare: function(){
		this.share.show();
	},
	
	initialize: function() {
		var self=this;
		
		self.share = new Share({
			head: '分享礼物',
			title: '',
			linkURL: 'http://m.abs.cn/',
			description: ''
		});
		self.share.callback=function(res){
			
		}
		self.share.$el.appendTo(self.$el);
	}
});

module.exports = Month;