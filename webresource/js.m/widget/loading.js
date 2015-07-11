define(['$','util','bridge','./../core/view'],function (require,exports,module) {
    var $=require('$'),
        _=require('util'),
        view=require('./../core/view'),
        app=require('bridge');

    var records=[];

    var extend=['$el','url','method','headers','dataType','xhrFields','success','complete','pageIndex','pageSize','append','$content','$scroll','checkData','check','hasData','KEY_PAGE','KEY_PAGESIZE','DATAKEY_TOTAL'];

    var Loading=function (options) {
        $.extend(this,_.pick(options,extend));

        if(options.el)
            this.$el=$(options.el);
        this.el=this.$el[0];

        this.params=options.params||{};
        this.error=options.error||this.showError;
        this.$content=options.$content||this.$el;
        this.$scroll=options.$scroll||this.$el;
        this.$el.on('tap','.js_reload',$.proxy(this.reload,this));
    }

    Loading.prototype={
        KEY_PAGE: 'page',
        KEY_PAGESIZE: 'pageSize',

        DATAKEY_TOTAL: 'total',
        DATAKEY_PAGENUM: '',

        method: "GET",
        dataType: 'json',

        pageIndex: 1,
        pageSize: 10,

        template: '<div class="dataloading"></div>',
        refresh: '<div class="refreshing"><p class="msg js_msg"></p><p class="loading js_loading"></p></div>',
        errorTemplate: '<div class="server_error"><i class="msg js_msg"></i><i class="ico_reload js_reload"></i></div>',

        check: function (res) {
            var flag=!!(res&&res.success);
            return flag;
        },

        hasData: function (res) {
            return res.data&&res.data.length;
        },

        showMsg: function (msg) {
            if(this.pageIndex==1) {
                this.$loading.find('.js_msg').show().html(msg);
                this.$loading.show().find('.js_loading').hide();
            } else {
                this.$refreshing.find('.js_msg').show().html(msg);
                this.$refreshing.show().find('.js_loading').hide();
            }
        },

        complete: _.noop,

        showError: function (msg) {
            var that=this;

            if(that.isError) {
                if(this.pageIndex==1) {
                    this.$loading.animate({
                        opacity: 0
                    },300,'ease-out',function () {
                        that.$loading.hide().css({ opacity: '' });
                    });


                    var $error=(that.$error||(that.$error=$(that.errorTemplate).appendTo(that.$el)));

                    $error.find('.js_msg').html(typeof msg=='string'?msg:(msg?msg.msg:'加载失败'));
                    $error.show();

                } else {
                    that.showMsg('<div class="data-reload js_reload">加载失败，请点击重试<i class="i-refresh"></i></div>');
                }
            }
        },

        showLoading: function () {
            var that=this,
                $refreshing;

            this.$error&&this.$error.hide();

            if(that.pageIndex==1) {
                if(!that.$loading) {
                    that.$loading=$(that.template);
                }

                that.$loading.css({
                    display: 'block'
                })
                .appendTo(that.$el);

                that.$refreshing&&that.$refreshing.hide();

            } else {
                $refreshing=this.$refreshing;
                $refreshing.show().find('.js_msg').html('正在载入...');
                $refreshing.find('.js_loading').show();
                that.$loading&&that.$loading.hide();
            }
        },

        hideLoading: function () {
            this.$error&&this.$error.hide();
            this.$refreshing&&this.$refreshing.hide();
            this.$loading.hide();
        },

        setHeaders: function (key,val) {
            var attrs;
            if(!val)
                attrs=key
            else
                (attrs={})[key]=val;

            if(this.headers===undefined) this.headers={};

            for(var attr in attrs) {
                this.headers[attr]=attrs[attr];
            }
            return this;
        },

        setParam: function (key,val) {
            var attrs;
            if(!val)
                attrs=key
            else
                (attrs={})[key]=val;

            for(var attr in attrs) {
                val=attrs[attr];

                if(attr==this.KEY_PAGE)
                    this.pageIndex=val;
                else if(attr==this.KEY_PAGESIZE)
                    this.pageSize=val
                else
                    this.params[attr]=val;
            }
            return this;
        },

        getParam: function (key,val) {
            return this.params;
        },

        reload: function (options,callback) {
            if(!this.isLoading) {
                this.setParam(this.KEY_PAGE,1).load(options,callback);
            }
        },

        load: function (options,callback) {
            var that=this;

            if(that.isLoading) return;
            that.isLoading=true;

            if(typeof options=='function') callback=options,options=null;

            that.params[that.KEY_PAGE]=that.pageIndex;
            that.params[that.KEY_PAGESIZE]=that.pageSize;

            for(var i=records.length-1;i>=0;i--) {
                records[i].disableAutoRefreshing();
            }

            if(!options||options.showLoading!==false) that.showLoading();

            that._xhr=$.ajax({
                url: app.url(that.url),
                headers: that.headers,
                xhrFields: that.xhrFields,
                data: that.params,
                type: that.method,
                dataType: that.dataType,
                error: function (xhr) {
                    that._xhr=null;
                    that.isError=true;
                    that.isLoading=false;
                    that.error({ msg: '网络错误' },xhr);
                    callback&&callback.call(that,{ msg: '网络错误' },null);
                },
                success: function (res,status,xhr) {
                    that._xhr=null;
                    that.isLoading=false;

                    if(!that.check||that.check(res)) {
                        that.hideLoading();

                        if(that.checkData===false||that.hasData(res)) {
                            if(that.pageIndex==1||!that.append) that.success(res,status,xhr);
                            else that.append(res,status,xhr);

                            callback&&callback.call(that,null,res);

                            that.checkAutoRefreshing(res);
                        } else {
                            that.dataNotFound(res);
                        }
                    } else {
                        that.isError=true;
                        that.isLoading=false;
                        that.error(res);
                        callback&&callback.call(that,res,null);
                    }
                },
                complete: $.proxy(that.complete,that)
            });
        },

        _refresh: function () {
            this.abort().load();
        },

        dataNotFound: function (e,res) {
            var that=this;

            that.isError=true;
            if(that.pageIndex==1) {
                that.showError('暂无数据');
            } else {
                setTimeout(function () {
                    that.$refreshing.hide()

                },3000);
            }
        },

        _scroll: function (e,x,y) {
            var that=this;

            if(!that.isLoading
                &&that._scrollY<y
                &&y+that.$scroll.height()>=that.$refreshing[0].offsetTop) {

                that._refresh();
            }

            that._scrollY=y;
        },

        _autoRefreshingEnabled: false,

        checkAutoRefreshing: function (res) {
            var that=this,
                data=that.params;

            if(that.append&&((that.DATAKEY_PAGENUM&&res[that.DATAKEY_PAGENUM]&&res[that.DATAKEY_PAGENUM]>data[that.KEY_PAGE])||(that.DATAKEY_TOTAL&&res[that.DATAKEY_TOTAL]&&res[that.DATAKEY_TOTAL]>data[that.KEY_PAGE]*data[that.KEY_PAGESIZE]))) {

                that.pageIndex++;
                that.enableAutoRefreshing();

            } else {
                that.disableAutoRefreshing();
            }
        },

        enableAutoRefreshing: function () {
            var $refreshing=(this.$refreshing||(this.$refreshing=$(this.refresh)).appendTo(this.$content)).show();

            if(this._autoRefreshingEnabled) return;
            this._autoRefreshingEnabled=true;

            this.$scroll.on('scrollStop',$.proxy(this._scroll,this));

            this._scrollY=this.el.scrollTop;

            if(this.el.scrollTop+this.$scroll.height()>=this.$refreshing[0].offsetTop) {
                this._refresh();
            }
        },

        disableAutoRefreshing: function () {
            if(!this._autoRefreshingEnabled) return;
            this._autoRefreshingEnabled=false;

            this.$scroll.off('scrollStop',this._scroll);

            this.$refreshing&&this.$refreshing.hide();
        },

        abort: function () {
            if(this._xhr) {
                this.isLoad=false;
                this._xhr.abort();
                this._xhr=null;

                this.hideLoading();
            }
            return this;
        },

        destory: function () {
            this.abort();
            this.disableAutoRefreshing();
            this.$el.off('tap','.js_reload',this.reload);
        }
    };

    Loading.extend=_.extend;

    module.exports=Loading;
});
