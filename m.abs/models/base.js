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

exports.AddressListAPI = ShopAPI.extend({
	url: '/api/user/addresslist',
	params: {
		pspcode: 0
	}
});

exports.EditAddressAPI = ShopAPI.extend({
	url: '/api/user/editaddress',
	params: {
		pspcode: 0,
		edittype: 2,//编辑类型：1.新增 2.修改
		mbaId: 0,
		mbaName: '',
		mbaMobile: 0,
		mbaCtyId: 0,
		mbaDefault: false,
		mbaRegId: 0,
		mbaAddress: ''
	}
});

exports.DeleteAddressAPI = ShopAPI.extend({
	url: '/api/user/deladdress',
	params: {
		pspcode: 0,
		mbaId: 0
	}
});

exports.ProvinceAPI = ShopAPI.extend({
	url: '/api/user/prvlist'
});

exports.CityAPI = ShopAPI.extend({
	url: '/api/user/ctylist',
	params: {
		prvId: 0
	}
});

exports.RegionAPI = ShopAPI.extend({
	url: '/api/user/reglist',
	params: {
		ctyId: 0
	}
});

exports.CouponAPI = ShopAPI.extend({
	url: '/api/user/GetCoupon',
	params: {
		pspcode: '',
		csvcode: ''
	}
});

exports.CouponShareAPI = API.extend({
	url: '/api/user/shareCoupon',
	params: {
		UserID: 0,
		Auth: ''
	}
});


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

exports.ProductSearchAPI = ShopAPI.extend({
	url: "/Prod/productlist",
	params: {
		keycodes: '',
		orderbyStr: 2,
		orderby: 'desc',
		length: 2,
		pages: 0
	}
});

exports.ProductHeadAPI = ShopAPI.extend({
	url: '/api/prod/prhitem',
	params: {
		id: 0
	}
});

exports.ProductAPI = ShopAPI.extend({
	url: '/api/prod/prditem',
	params: {
		id: 0
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

exports.CartAPI = ShopAPI.extend({
	url: '/api/shop/bag',
	params: {
		pspcode: 0 //用户code(手机号)
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