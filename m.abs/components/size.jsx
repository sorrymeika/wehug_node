var $ = require('$');
var model = require('core/model3');
var api = require('models/base');
var util = require('util');

var Month = model.ViewModel.extend({
	el: <div class="pd_size_wrap js_size {{isShowSize?'':'out'}}" style="display:none" sn-tap="this.tap()">
			<div class="pd_size">
				<div class="pd_size_close" sn-tap="isShowSize=false"></div>
				<div class="base_info">
					<div class="img"><img src="{{data.WPP_M_PIC}}" /></div>
					<div class="info">
						<h2 class="price">¥{{data.PRD_PRICE}}</h2>
						<div class="qty">库存{{data.PRD_NUM}}件</div>
						<p class="other">
							<em>选择</em>
							<em>尺码</em>
							<em>颜色分类</em>
						</p>
					</div>
				</div>
				<div class="pd_size_con">
					<div class="pd_size_select">
						<div class="hd">尺码</div>
						<ul>
							<li sn-repeat="item in spec" class="{{data.PRD_SPEC==item?'curr':''}}" sn-tap="data.PRD_SPEC=item">{{item.split('|')[0]}}</li>
						</ul>
					</div>
					<div class="pd_size_select">
						<div class="hd">颜色分类</div>
						<ul>
							<li sn-repeat="item in color" class="{{data.PRD_COLOR==item?'curr':''}}" sn-tap="data.PRD_COLOR=item">{{item}}</li>
						</ul>
					</div>
				</div>
				<div class="pd_size_buy">
					<p class="hd">购买数量</p>
					<p class="qty"><em sn-tap="qty=Math.max(1,qty-1)">-</em>
						<input type="text" class="qty" value="{{qty}}" />
						<em sn-tap="qty=qty+1">+</em>
					</p>
				</div>
				<b class="btn_large btn_confirm" sn-tap="this.confirm()">确认</b>
			</div>
		</div>,
	
	show: function(){
		this.$el.show();
		this.set({               
			isShowSize: true
		});
	},
	confirm :function (e) {
		var self = this;
		var colorSpec = self.get('colorSpec');
		var data = self.get('data');
		var item = util.first(colorSpec, function (item) {
			return item.PRD_SPEC == data.PRD_SPEC && item.PRD_COLOR == data.PRD_COLOR;
		});

		self.cartAddAPI.setParam({
			prd: item.PRD_ID,
			qty: self.get('qty')

		}).load();

	},
	hide: function(){
		this.set({
			isShowSize: false
		});
	},
	
	tap:function (e) {
		if ($(e.target).hasClass('js_size')) {
			this.hide();
		}
	},
	
	initialize: function() {
		var self = this;
		self.user = util.store('user');

		self.listenTo(self.$el, $.fx.transitionEnd, function (e) {
			if (self.$el.hasClass('out')) {
				self.$el.hide();
			}
		});
		
		self.cartAddAPI = new api.CartAddAPI({
			$el: self.$el,
			checkData: false,
			check: false,
			beforeSend: function () {
				this.setParam({
					prd: self.get('data').PRD_ID
				})
				self.$('.js_buy').addClass('disabled');
			},
			params: {
				pspcode: self.user.Mobile
			},
			success: function (res) {
				if (res.success) {
					sl.tip('加入购物车成功！');
					self.hide();
					//self.forward('/cart?from=' + self.route.url);
				}
			},
			complete: function () {
				self.$('.js_buy').removeClass('disabled');
			}
		});
	}
});

module.exports = Month;