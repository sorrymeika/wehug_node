var $ = require('$');
var View = require('core/view');
var model = require('core/model3');
var bridge = require('bridge');

var Share = View.extend({
	events: {
		'tap .js_weixin_timeline': function(){
			bridge.wx({
				type: 'shareLinkURL',
				linkURL: this.model.data.linkURL,
				tagName: 'abs',
				title: this.model.data.title,
				description: this.model.data.description,
				scene: 1
			},function(res){
				self.callback(res);
			})
		},
		'tap .js_weixin_session': function(){
			bridge.wx({
				type: 'shareLinkURL',
				linkURL: this.model.data.linkURL,
				tagName: 'abs',
				title: this.model.data.title,
				description: this.model.data.description,
				scene: 0
			},function(res){
				self.callback(res);
			})
		},
		'tap .js_qq': function(){
			bridge.qq({
				type: 'shareLinkURL',
				linkURL: this.model.data.linkURL,
				title: this.model.data.title,
				description: this.model.data.description
			},function(res){
				self.callback(res);
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
			<div class="hd">{{head}}</div>
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
	callback: function(){
		
	},
	initialize: function() {
		this.model=new model.ViewModel(this.$el,this.options);
	},
	
	set: function(data){
		this.model.set(data);
		return this;
	},
	show: function(){
		this.$el.show();
		return this;
	},
	hide: function(){
		this.$el.hide();
		return this;
	}

});

module.exports = Share;