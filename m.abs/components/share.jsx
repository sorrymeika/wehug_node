var $ = require('$');
var View = require('core/view');
var model = require('core/model2');
var bridge = require('bridge');

var Share = View.extend({
	events: {
		'tap .js_weixin_timeline': function(){
			bridge.wx({
				type: 'shareLinkURL',
				linkURL: 'http://www.abs.cn',
				tagName: 'abs',
				title: 'abs',
				description: 'abs',
				scene: 1
			})
		},
		'tap .js_weixin_session': function(){
			bridge.wx({
				type: 'shareLinkURL',
				linkURL: 'http://www.abs.cn',
				tagName: 'abs',
				title: 'abs',
				description: 'abs',
				scene: 0
			})
		},
		'tap .js_qq': function(){
			bridge.qq({
				type: 'shareLinkURL',
				linkURL: 'http://www.abs.cn',
				title: 'abs',
				description: 'abs'
			})
		},
		
		'tap .js_cancel': function() {
			this.hide();
		},
		'tap': function(e){
			if (e.target==this.el){
				this.hide();
			}
		}
	},
	el: <div class="cp_share_mask" style="display:none">
		<div class="cp_share">
			<div class="hd">{{title}}</div>
			<div class="bd">
				<ul>
					<li class="js_weixin_timeline"><span>朋友圈</span></li>
					<li class="js_weixin_session"><span>微信</span></li>
					<li class="js_qq"><span>QQ</span></li>
				</ul>
			</div>
			<div class="ft"><b class="btn js_cancel">取消</b></div>
		</div>
	</div>,
	
	initialize: function() {
		this.model=new model.ViewModel(this.$el,this.options);
	},
	
	set: function(data){
		this.model.set(data);
	},
	show: function(){
		this.$el.show();
	},
	hide: function(){
		this.$el.hide();
	}

});

module.exports = Share;