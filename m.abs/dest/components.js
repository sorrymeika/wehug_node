define("components/share",["$","core/view","core/model2","bridge"],function(t,e,i){var r=(t("$"),t("core/view")),s=t("core/model2"),o=t("bridge"),a=r.extend({events:{"tap .js_weixin_timeline":function(){o.wx({type:"shareLinkURL",linkURL:this.model.data.linkURL,tagName:"abs",title:this.model.data.title,description:this.model.data.description,scene:1})},"tap .js_weixin_session":function(){o.wx({type:"shareLinkURL",linkURL:this.model.data.linkURL,tagName:"abs",title:this.model.data.title,description:this.model.data.description,scene:0})},"tap .js_qq":function(){o.qq({type:"shareLinkURL",linkURL:this.model.data.linkURL,title:this.model.data.title,description:this.model.data.description})},"tap .js_cancel":function(){this.hide()},tap:function(t){t.target==this.el&&this.hide()}},el:'<div class="cp_share_mask" style="display:none"> <div class="cp_share"> <div class="hd">{{head}}</div> <div class="bd"> <ul> <li class="js_weixin_timeline"><span>朋友圈</span></li> <li class="js_weixin_session"><span>微信</span></li> <li class="js_qq"><span>QQ</span></li> </ul> </div> <div class="ft"><b class="btn js_cancel">取消</b></div> </div> </div>',initialize:function(){this.model=new s.ViewModel(this.$el,this.options)},set:function(t){return this.model.set(t),this},show:function(){return this.$el.show(),this},hide:function(){return this.$el.hide(),this}});i.exports=a});define("components/confirm",["$","core/model3"],function(t,e,i){var n=t("$"),s=t("core/model3"),r=s.ViewModel.extend({el:'<div class="cp_mask" style="display:none"> <div class="cp_confirm" style="height:{{height}}px;margin-top:-{{height/2}}px"> <div class="cp_confirm_bd" sn-html="{{content}}"></div> <div class="cp_confirm_ft"><b class="btn" sn-tap="this.cancel">取消</b><b class="btn js_confirm"  sn-tap="this.confirm">确定</b></div> </div> </div>',cancel:function(t){this.hide();var e=this.get("cancel");e&&e.call(this,t)},confirm:function(t){this.hide();var e=this.get("confirm");e&&e.call(this,t)},initialize:function(){this.listenTo(this.$el,n.fx.transitionEnd,this._hide)},show:function(){this.$el.show().addClass("show"),this.set({height:this.$(".cp_confirm")[0].offsetHeight})},_hide:function(){!this.$el.hasClass("show")&&this.$el.hide()},hide:function(){this.$el.removeClass("show")}});i.exports=r});define("models/base",["widget/loading"],function(t,e,n){var i=t("widget/loading"),r=i.extend({baseUri:$('meta[name="api-base-url"]').attr("content")});e.API=r;var s=i.extend({baseUri:$('meta[name="shop-api-base-url"]').attr("content"),KEY_PAGE:"currentpage"});e.ShopAPI=s,e.AddressListAPI=s.extend({url:"/api/user/addresslist",params:{pspcode:0}}),e.EditAddressAPI=s.extend({url:"/api/user/editaddress",params:{pspcode:0,edittype:2,mbaId:0,mbaName:"",mbaMobile:0,mbaCtyId:0,mbaDefault:!1,mbaRegId:0,mbaAddress:""}}),e.DeleteAddressAPI=s.extend({url:"/api/user/deladdress",params:{pspcode:0,mbaId:0}}),e.ProvinceAPI=s.extend({url:"/api/user/prvlist"}),e.CityAPI=s.extend({url:"/api/user/ctylist",params:{prvId:0}}),e.RegionAPI=s.extend({url:"/api/user/reglist",params:{ctyId:0}}),e.CouponAPI=s.extend({url:"/api/user/GetCoupon",params:{pspcode:"",csvcode:""}}),e.CouponShareAPI=r.extend({url:"/api/user/shareCoupon",params:{UserID:0,Auth:""}}),e.CreateOrderAPI=s.extend({url:"/api/shop/CreateMOrder",params:{pspcode:"",mba_id:1,pay_type:1,coupon:"CSVCODE1, CSVCODE2, CSVCODE3",points:0,freecoupon:"CSVFREE1"}}),e.CategoryAPI=s.extend({url:"/api/prod/pcglist"}),e.SubCategoryAPI=s.extend({url:"/api/prod/pcgitem",params:{id:0}}),e.ProductSearchAPI=s.extend({url:"/Prod/productlist",params:{keycodes:"",orderbyStr:2,orderby:"desc",length:2,pages:0}}),e.ProductHeadAPI=s.extend({url:"/api/prod/prhitem",params:{id:0}}),e.ProductAPI=s.extend({url:"/api/prod/prditem",params:{id:0}}),e.ProductColorAndSpec=s.extend({url:"/api/prod/getsizebyprh",params:{id:0}}),e.ProductDetailAPI=s.extend({url:"/api/prod/prddetail",params:{id:0}}),e.ProductListAPI=s.extend({url:"/api/prod/pcgprd",params:{pcgid:0}}),e.CartAPI=s.extend({url:"/api/shop/bag",params:{pspcode:0}}),e.CartAddAPI=s.extend({url:"/api/shop/addbag",params:{pspcode:0,prd:0,qty:1}}),e.StewardListAPI=s.extend({url:"/api/steward/list",params:{pspid:0}}),e.StewardAPI=s.extend({url:"/api/steward/item",params:{prh_id:0}}),e.StewardDetailAPI=s.extend({url:"/api/steward/detail",params:{detail_id:0}})});define("core/model3",["$","util","./base","./event","./component"],function(t,e,n){var i=t("$"),r=t("util"),o=(t("./base"),t("./event")),a=t("./component"),h=/^((-)*\d+|true|false|undefined|null|'(?:\\'|[^'])*')$/,u=/([a-zA-Z_0-9]+)(?:\s*,(\s*[a-zA-Z_0-9]+)){0,1}\s+in\s+([a-zA-Z_0-9]+(?:\.[a-zA-Z_0-9]+){0,})(?:\s*\|\s*filter\s*\:\s*(.+?)){0,1}(?:\s*\|\s*orderBy\:(.+)){0,1}(\s|$)/,p=/\{\{(.+?)\}\}/g,d=/'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/[img]*|\/\/.*|(^|[\!\=\>\<\?\s\:\(\),\%&\|\+\-\*\/\[\]]+)([a-zA-Z_0-9]+(?:\.[a-zA-Z_0-9]+)*(?![a-zA-Z_0-9]*\())/g,f=/([a-zA-Z_0-9]+(?:\.[a-zA-Z_0-9]+)*)\s*=\s*((?:\((?:'(?:\\'|[^'])*'|[^\)])+\)|'(?:\\'|[^'])*'|[^;])+)(?=\;|\,|$)/g,m=/\b(this\.[\.\w]+\()((?:'(?:\\'|[^'])*'|[^\)])*)\)/g,v=function(t){for(var e=t.split("."),n=[],i=0;i<e.length;i++)n[i]=(0==i?"$data":n[i-1])+"."+e[i];for(var i=0;i<n.length;i++)n[i]=n[i]+"!==null&&"+n[i]+"!==undefined";return"("+n.join("&&")+"?"+t+':"")'},g=function(t,e){for(var n=t.length?t:[t],i=0,r=n.length;r>i;i++){var s=n[i];e(s,i,n),1==s.nodeType&&s.childNodes.length&&g(s.childNodes,e)}},y={contains:function(t,e){return-1!=t.indexOf(e)},like:function(t,e){return-1!=t.indexOf(e)||-1!=e.indexOf(t)},util:r,closestModelData:function(t,e){for(var n=t.parentNode;null!=n;n=n.parentNode)if(n.repeat&&(!e||n.repeat.repeat.alias==e))return n.repeat.parentModel.data}},x=function(t,e,n,r){if(t instanceof x)this.key=t.key?t.key+"."+e:e;else{if(!(t instanceof A))throw new Error("Model's parent mast be Collection or Model");this.key=t.key+"^child"}if(this.type=i.isPlainObject(n)?"object":"value",t.data[e]=this.data="object"==this.type?{}:n,this._key=e,this.model={},this.parent=t,this.root=t.root,r)for(var s=0,o=r.length;o>s;s++)r[s].add(this);this.set(n)},w={getModel:function(t){if("string"==typeof t&&-1!=t.indexOf(".")&&(t=t.split(".")),i.isArray(t)){var e=this;if("this"==t[0]){for(var n=1,r=t.length;r>n;n++)if(!(e=e[t[n]]))return null}else for(var n=0,r=t.length;r>n;n++)if(e instanceof x)e=e.model[t[n]];else{if(!(e instanceof A))return null;e=e.models[t[n]]}return e}return"this"==t?this:""==t?this.data:this.model[t]},get:function(t){var e=this.getModel(t);return e instanceof x||e instanceof A?e.data:e},cover:function(t,e){return this.set(!0,t,e)},set:function(t,e,n){var s,a,c,r=this,l=r.model;if(t!==!0&&(n=e,e=t,t=!1),i.isPlainObject(e))a=e;else if(null===e)!t&&(t=!0),a={};else{if("undefined"==typeof n)return n=e,e="",c=this.parent,c.data[c instanceof A?c.models.indexOf(this):this._key]=n,void(this.data=n);(a={})[e]=n}if(i.isPlainObject(this.data)||(this.data={}),t)for(var h in this.data)void 0===a[h]&&(a[h]=null);i.extend(this.data,a);for(var h in a)if(s=l[h],value=a[h],s!==value){var u=h.split(".");if(u.length>1){e=u.pop(),l=this;for(var f,p=0,d=u.length;d>p;p++)if(h=u[p],f=l,l instanceof x)l=l.model[h],l||(l=f.model[h]=new x(f,h,null),f.data[h]=l.data);else if(l instanceof A&&(l=l.models[h],!l))throw new Error("[Collection index is bigger than length!]");l.set(e,value)}else if(s instanceof x)null===value||void 0===value?s.clear():s.set(value);else if(s instanceof A){if(!i.isArray(value)){if(null!=value)throw new Error("[Array to "+typeof value+" error]不可改变"+h+"的数据类型");value=[]}s.set(value)}else i.isPlainObject(value)?l[h]=new x(this,h,value):i.isArray(value)?l[h]=new A(this,h,value):(l[h]=value,this.root.init||(this.trigger("change:"+h,value),this.root.trigger("sync:"+(this.key?this.key+"."+h:h).replace(/\./g,"/"),this,h,value)))}return r},clear:function(){var t={};for(var e in this.data)t[e]=null;this.set(t)},closest:function(t){for(var e=this.parent;null!=e;e=e.parent)if(e.key==t)return e},contains:function(t){for(t=t.parent;null!=t;t=t.parent)if(t==this)return!0;return!1},_eachEl:function(t,e,n){for(var i;null!=t;t=t.parentNode){if(void 0!==(i=e(t)))return i;if(1==t.nodeType&&t.getAttribute("sn-viewmodel"))break}return void 0===n?this:n},isRelativeToEl:function(t){for(var e=!0,n=this,i=this;null!=i;i=i.parent)if(i instanceof A){e=!1;break}return e?!0:n._eachEl(t,function(t){return t.model&&t.model==n?!0:void 0},!1)}};w.reset=w.clear,x.prototype=i.extend(Object.create(o),w);var _=function(t){i.extend(this,t);for(var e=this,n=this.collectionName.split("."),r=this.parent;r;){if(r.alias==n[0]){n[0]=r.collectionName+"^child",this.collectionName=n.join("."),this.isChild=!0;break}r=r.parent}var s=document.createComment(this.collectionName);if(s.repeat=this,this.replacement=s,this.el.parentNode.insertBefore(s,this.el),this.el.parentNode.removeChild(this.el),this.collectionRepeats=[],this.filters){var o=this.viewModel._compile("{{"+this.filters+"}}",this,function(t,n){for(var i=0;i<e.collectionRepeats.length;i++){var r=e.collectionRepeats[i];(n.parent==r.collection||n.contains(r.collection))&&r.update()}});this.filter=this.viewModel.fns.length+this.viewModel._fns.length,this.viewModel._fns.push(o)}},b=function(t,e,n){var i=this;if(this.collection=t,this.repeat=e,this.children=[],this.parentModel=n,e.collectionRepeats[e.collectionRepeats.length]=this,e.parent)if(e.isChild||n)this.type="children",this.replacement=this.findReplacement(n||t.parent);else{this.type="inset";for(var r=0;r<e.parent.collectionRepeats.length;r++){var s=e.parent.collectionRepeats[r];s.collection.on("add",function(n,r){for(var s=new b(t,e,r),o=0;o<t.models.length;o++)s.add(t.models[o]);i.children.push(s),s.update()}).each(function(n){i.children.push(new b(t,e,n))}),s.children.push(this)}}else this.type="normal",this.replacement=e.replacement;this.el=this.cloneNode(e.el),this.elements=[]};b.prototype.findReplacement=function(t){for(;null!=t&&t!=t.root;t=t.parent)if(t instanceof x&&t.replacement)for(var e=0;e<t.replacement.length;e++)if(t.replacement[e].repeat==this.repeat)return t.replacement[e]},b.prototype.update=function(){if("inset"!=this.type){var n=document.createDocumentFragment(),i=0,r=this.elements,s=this.repeat,o=s.orderBy,a=this.collection.root;o&&r.sort(function(t,e){return t=t.model.data[o],e=e.model.data[o],t>e?1:e>t?-1:0});for(var t=0,e=r.length;e>t;t++){var l=r[t];void 0===s.filter||a.fns[s.filter].call(a,y,l.model)?(n.appendChild(l),l.setAttribute("sn-index",i),s.indexAlias&&(l.setAttribute("sn-index-alias",s.indexAlias),a.trigger("sync:"+s.collectionName+"/"+s.alias+"/"+s.indexAlias,l.model)),i++):l.parentNode&&l.parentNode.removeChild(l)}this.replacement.parentNode.insertBefore(n,this.replacement)}else for(var t=0,e=this.children.length;e>t;t++)this.children[t].update()},b.prototype.cloneNode=function(t,e,n){var r,i=t.cloneNode(!1);if(t==this.el&&(i.repeat=this,i.model=e),n&&n.appendChild(i),8==t.nodeType&&t.repeat)i.repeat=t.repeat,e&&(e.replacement||(e.replacement=[])).push(i);else if(t.bindings&&(i.bindings=t.bindings,e?(t._origin._elements.push(i),e.root._setElAttr(i)):i._origin=t),1==t.nodeType&&(r=t.childNodes.length))for(var s=0;r>s;s++)this.cloneNode(t.childNodes[s],e,i);return i},b.prototype.each=function(t){for(var e=0;e<this.children.length;e++)t.call(this,this.children[e]);return this},b.prototype.remove=function(t,e){if("inset"==this.type)for(var n=0,r=this.children.length;r>n;n++)this.children[n].remove(t,e);else this.elements.splice(t,e||1).forEach(function(t){i(t).remove()})},b.prototype.add=function(t){if("inset"==this.type)for(var e=0,n=this.children.length;n>e;e++)this.children[e].add(t);else this.elements[this.elements.length]=this.cloneNode(this.el,t)},b.prototype.clear=function(){if("inset"==this.type)for(var t=0,e=this.children.length;e>t;t++)this.children[t].clear();else{for(var t=this.elements.length-1;t>=0;t--)this.elements[t].parentNode.removeChild(this.elements[t]);this.elements.length=0}};var A=function(t,e,n){var i;if(this.models=[],this.parent=t,this.key=t.key?t.key+"."+e:e,this._key=e,this.root=t.root,this.repeats=[],i=t.root.repeats[this.key])for(var r=0;r<i.length;r++)this.repeats[this.repeats.length]=new b(this,i[r]);this.data=[],t.data[e]=this.data,this.add(n)};A.prototype=Object.create(o),A.prototype.each=function(t){for(var e=0;e<this.models.length;e++)t.call(this,this.models[e]);return this},A.prototype.add=function(t){var e,n;i.isArray(t)||(t=[t]);for(var r=0,s=t.length;s>r;r++){var o=t[r];n=this.data.length,e=new x(this,n,o,this.repeats),this.models[n]=e,this.data[n]=o,this.trigger("add",e)}for(var r=0,a=this.repeats.length;a>r;r++)this.repeats[r].update();var l=this.key.replace(/\./g,"/");this.root.trigger("sync:"+l,this.parent,this._key,this.data).trigger("sync:"+l+"/length",this.parent,this._key,this.data)},A.prototype.remove=function(t,e){this.models.splice(t,e||1),this.data.splice(t,e||1);for(var n=0,i=this.repeats.length;i>n;n++)this.repeats[n].remove(t,e)},A.prototype.clear=function(t){this.models.length=this.data.length=0;for(var e=0,n=this.repeats.length;n>e;e++)this.repeats[e].clear()},A.prototype.set=function(t){if(0==t.length)this.clear();else{t.length<this.data.length&&this.remove(t.length,this.data.length-t.length);var e=0;this.each(function(n){n.set(!0,t[e]),e++}),this.add(t.slice(e,t.length))}return this},A.prototype.get=function(t){return this.models[t]};var E=["tap","click","change","focus","blur","transition-end"],$=function(t){for(var e="{",n=t.parent,i=t;null!=n;i=n,n=n.parent)e+=n.alias+":"+(i.isChild?"model.closest('"+n.collectionName+"^child').data":'global.closestModelData(el,"'+n.alias+'")')+",",n.indexAlias&&(e+=n.indexAlias+":$el.closest('[sn-index-alias=\""+n.indexAlias+'"]\').attr("sn-index"),');return e+=t.alias+":model.data",t.indexAlias&&(e+=","+t.indexAlias+":$el.closest('[sn-index-alias=\""+t.indexAlias+'"]\').attr("sn-index")'),e+="}"},T=function(t,e){"undefined"==typeof e&&i.isPlainObject(t)&&(e=t,t=this.el),this.cid=r.guid(),this.data=i.extend({},e),this.model={},this.repeats={},this._fns=[],this.fns=[],this.root=this,this.scan(t),this.init=!0,this.set(this.data),this.init=!1,this.on("Destroy",this.onDestroy),this.initialize.call(this,arguments)};T.prototype=i.extend(Object.create(x.prototype),{key:"",initialize:r.noop,_compile:function(t,e,n){var i=this,r="function(global,model,el){var $el=$(el),$data=$.extend({},global,model.root.data";return e&&(r+=","+$(e)),r+=");with($data){try{return '"+t.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(p,function(t,r){return"'+("+r.replace(/\\\\/g,"\\").replace(/\\'/g,"'").replace(d,function(t,r,s){if(!s)return t;var o=s.split("."),a=o[0];if(!a||"Math"==a||"$"==a||"this"==a||"window"==a||"document"==a||h.test(s)||y[a])return r+s;var l;if(e)for(;null!=e;e=e.parent){if(a==e.alias){o[0]=e.collectionName+"^child";break}if(a==e.indexAlias){l=e;break}}return i.on("sync:"+(l?l.collectionName+"/"+l.alias+"/"+l.indexAlias:o.join("/")),n),r+v(s)})+")+'"}),r+="';}catch(e){return '';}}}",r.replace("return ''+","return ").replace(/\+\'\'/g,"")},_setElAttr:function(t,e){var n=this;if(t.bindings){e?[e]:t.bindings;for(var e in t.bindings){var s=n.fns[t.bindings[e]].call(n,y,n._closestByEl(t),t);switch(e){case"textContent":t.textContent!==s+""&&(t.textContent=s);break;case"value":"INPUT"==t.tagName||"SELECT"==t.tagName||"TEXTAREA"==t.tagName?t.value!=s&&(t.value=s):t.setAttribute(e,s);break;case"html":case"sn-html":t.innerHTML=s;break;case"display":case"sn-display":t.style.display=r.isFalse(s)?"none":"block"==s||"inline"==s||"inline-block"==s?s:"";break;case"style":t.style.cssText+=s;break;default:t.setAttribute(e,s)}}}},_bindAttr:function(t,e,n,i){var r=this;if(p.test(n)){var s=function(n,s){if(i)for(var o=0;o<t._elements.length;o++){var a=t._elements[o];(s==r||s.isRelativeToEl(a))&&r._setElAttr(a,e)}else r._setElAttr(t,e)};(t.bindings||(t._elements=[],t.bindings={}))[e]=r.fns.length+r._fns.length;var o=this._compile(n,i,s);r._fns.push(o)}},_closestByEl:function(t){return this._eachEl(t,function(t){return t.model?t.model:void 0})},_getByEl:function(t,e){var n=this,i=e.split("."),r=i[0];return"this"==r?n:this._eachEl(t,function(t){return t.repeat&&t.repeat.repeat.alias==r?t.model:void 0})},_getVal:function(t,e){var t=t==this||t instanceof x?t:this._getByEl(t,e);return t.get(t==this?e:e.replace(/^[^\.]+\./,""))},_setByEl:function(t,e,n){var i=this._getByEl(t,e);i.set(i==this?e:e.replace(/^[^\.]+\./,""),n)},scan:function(t){var e=this,n=[],r=i(t).attr("sn-viewmodel",this.cid).on("input change","[sn-model]",function(t){if(1!=t._stopModelEvent){var n=t.currentTarget,i=n.getAttribute("sn-model");e._setByEl(n,i,n.value),t._stopModelEvent=!0}});e.$el=e.$el?e.$el.add(r):r;for(var s=0;s<E.length;s++)r.on("transition-end"==E[s]?i.fx.transitionEnd:E[s],"[sn-"+E[s]+"]",function(t){if(1!=t._stopModelEvent){var a,l,n=t.currentTarget,i=n.getAttribute("sn-"+t.type),r=i.split(":"),o=[t];if(/^\d+$/.test(i))e.fns[i].call(e,t,e._closestByEl(n),y);else{for(var c=0;c<r.length;c++){var h=r[c];0==c?(l=e._getByEl(n,h),a=e._getVal(l,h),t.model=e._closestByEl(n,h)):o.push(e._getVal(n,h))}a.apply(l,o)}t._stopModelEvent=!0}});g(r,function(t,i,r){if(1==t.nodeType){var s=t.getAttribute("sn-repeat");if(null!=s){var o=s.match(u);s=new _({viewModel:e,parent:r.repeat,alias:o[1],indexAlias:o[2],collectionName:o[3],filters:o[4],orderBy:o[5],el:t}),(e.repeats[s.collectionName]||(e.repeats[s.collectionName]=[])).push(s)}else s=r.repeat;s&&(t.childNodes.repeat=s);for(var a=0;a<t.attributes.length;a++){var l=t.attributes[a].name,c=t.attributes[a].value;if("sn-error"==l?l="onerror":"sn-src"==l&&(l="src"),"sn-display"==l||"sn-html"==l||0!=l.indexOf("sn-"))e._bindAttr(t,l,c,s);else if(-1!=E.indexOf(l.replace(/^sn-/,""))&&(f.test(c)||m.test(c))){var h="function(e,model,global){var el=e.currentTarget,$data=$.extend({},global,model.root.data";s&&(h+=","+$(s)),h+=");with($data){"+c.replace(m,function(t,e,n){return e+"e"+(n?",":"")+n+")"}).replace(f,'this._setByEl(e.currentTarget,"$1",$2)')+"}}",t.setAttribute(l,e.fns.length+e._fns.length),e._fns.push(h)}}!s&&t.bindings&&(n[n.length]=t)}else 3==t.nodeType&&(e._bindAttr(t,"textContent",t.textContent,r.repeat),!r.repeat&&t.bindings&&(n[n.length]=t))}),[].push.apply(this.fns,window.eval("["+this._fns.join(",")+"]")),this._fns.length=0;for(var s=0,o=n.length;o>s;s++)e._setElAttr(n[s])}},r.pick(a.prototype,["destroy","undelegateEvents","listenTo","listen","onDestroy","$"])),T.extend=r.extend,e.ViewModel=T,e.Filters=y});