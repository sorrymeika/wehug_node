var Loading = require('widget/loading');

var API = Loading.extend({
	baseUri: $('meta[name="api-base-url"]').attr('content')
});
exports.API = API;

var ShopAPI = Loading.extend({
	baseUri: $('meta[name="shop-api-base-url"]').attr('content'),
	KEY_PAGE: 'currentpage'
});
exports.ShopAPI = ShopAPI;

exports.CreateOrderAPI = ShopAPI.extend({
	url: '/api/shop/CreateMOrder',
	params: {
		pspcode: '',
		mba_id: 1, //（用户收货地址）,
		pay_type: 1, //（支付方式  RPayType 具体id到时候定）,
		coupon: 'CSVCODE1, CSVCODE2, CSVCODE3', //（优惠券券号）,
		points: 0, //(积分数 100抵1块钱)
		freecoupon: 'CSVFREE1'//（免邮券券号）
	}
});

//分类列表
exports.CategoryAPI = ShopAPI.extend({
	url: '/api/prod/pcglist'
});

exports.SubCategoryAPI = ShopAPI.extend({
	url: '/api/prod/pcgitem',
	params: {
		id: 0 //父类ID
	}
});

exports.ProductDetailAPI = ShopAPI.extend({
	url: '/api/prod/detail',
	params: {
		id: 0
	}
});

exports.ProductListAPI = ShopAPI.extend({
	url: '/api/prod/pcgprd',
	params: {
		pcgid: 0 //父类ID
	}
});

exports.StewardListAPI = ShopAPI.extend({
	url: '/api/steward/list',
	params: {
		pspid: 0
	}
});

exports.StewardAPI = ShopAPI.extend({
	url: '/api/steward/item',
	params: {
		prh_id: 0
	}
});

exports.StewardDetailAPI = ShopAPI.extend({
	url: '/api/steward/detail',
	params: {
		detail_id: 0
	}
});