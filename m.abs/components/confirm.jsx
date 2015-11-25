var $ = require('$');
var model = require('core/model2');

var Confirm = model.Component.extend({
	el: <div class="cp_mask" style="display:none">
		<div class="cp_confirm">
			<div class="cp_confirm_bd" sn-html="{{content}}"></div>
			<div class="cp_confirm_ft"><b class="btn" sn-tap="this.cancel">取消</b><b class="btn js_confirm">确定</b></div>
		</div>
	</div>,
	
	cancel: function(e){
		this.hide();
		var fn=this.get('cancel');
		fn&&fn.call(this,e);
	},
	
	confirm: function(e){
		this.hide();
		var fn=this.get('confirm');
		fn&&fn.call(this,e);
	},
	
	initialize: function() {
		this.listenTo(this.$el,$.fx.transitionEnd,this._hide);
	},
	
	set: function(data){
		this.model.set(data);
	},
	show: function(){
		this.$el.show().addClass('show');
	},
	_hide: function(){
		!this.$el.hasClass('show')&&this.$el.hide();
	},
	hide: function(){
		this.$el.removeClass('show');
	}
});

module.exports = Confirm;