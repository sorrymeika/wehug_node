define(['$','util','bridge','./../core/view'],function(require,exports,module) {
    var $=require('$'),
        _=require('util'),
        view=require('./../core/view'),
        app=require('bridge');

    var records=[];

    var Loading=view.extend({
        events: {
            'tap .js_reload': function() {
                this.reload();
            }
        },
        options: {},

        pageIndex: 1,
        pageSize: 10,
        params: {},

        KEY_PAGE: 'page',
        KEY_PAGESIZE: 'pageSize',

        DATAKEY_TOTAL: 'total',
        DATAKEY_PAGENUM: '',

        check: function(res) {
            var flag=!!(res&&res.success);
            return flag;
        },

        hasData: function(res) {
            return res.data&&res.data.length;
        },

        initialize: function() {
            $.extend(this,_.pick(this.options,['check','hasData','$list','$scroll','KEY_PAGE','KEY_PAGESIZE','DATAKEY_TOTAL']));

            if(!this.$list)
                this.$list=this.$el;

            if(!this.$scroll)
                this.$scroll=this.$el;
        },

        showMsg: function(msg) {
            if(this.pageIndex==1) {
                this.$loading.find('.js_msg').show().html(msg);
                this.$loading.show().find('.js_loading').hide();
            } else {
                this.$refreshing.find('.js_msg').show().html(msg);
                this.$refreshing.show().find('.js_loading').hide();
            }
        },

        showError: function(msg) {
            var that=this;

            if(that.isError) {
                if(this.pageIndex==1) {
                    this.$loading.animate({
                        opacity: 0
                    },300,'ease-out',function() {
                        that.$loading.hide().css({ opacity: '' });
                    });

                    var $error=(that.$error||(that.$error=$(that.error)).appendTo(that.$el));
                    $error.find('.js_msg').html(msg||'加载失败');
                    $error.show();

                } else {
                    that.showMsg('<div class="data-reload js_reload">加载失败，请点击重试<i class="i-refresh"></i></div>');
                }
            }
        },

        template: '<div class="dataloading"></div>',
        refresh: '<div class="refreshing"><p class="msg js_msg"></p><p class="loading js_loading"></p></div>',
        error: '<div class="server_error"><i class="msg js_msg"></i><i class="ico_reload js_reload"></i></div>',

        showLoading: function() {
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

        hideLoading: function() {
            this.$error&&this.$error.hide();
            this.$refreshing&&this.$refreshing.hide();
            this.$loading.hide();
        },

        reload: function(resolve,reject,showLoading) {
            var that=this;

            if(that.isLoading) {
                resolve&&resolve();
                return;
            }
            that.isLoading=true;

            if(resolve) that.loadingOptions.success=resolve;
            if(reject) that.loadingOptions.error=reject;
            if(showLoading) that.loadingOptions.showLoading=showLoading;

            that.pageIndex=1;
            that.params[that.KEY_PAGE]=1;

            that._load();
        },

        load: function(options) {
            var that=this;

            if(that.isLoading) return;
            that.isLoading=true;

            options=$.extend({
                url: '',
                headers: (navigator.platform!="Win32"&&navigator.platform!="Win64")&&localStorage.authCookies?{
                    Cookie: localStorage.authCookies
                }:null,
                type: 'GET',
                data: {},
                pageIndex: that.pageIndex,
                pageSize: that.pageSize,
                timeout: 15,
                success: _.noop,
                refresh: null,
                error: function() {
                    that.showError();
                },
                complete: _.noop

            },options);

            that.loadingOptions=options;

            that.params=options.data;
            that.pageIndex=options.pageIndex;
            that.pageSize=options.pageSize;

            that.params[that.KEY_PAGESIZE]=that.pageSize;

            that._load();
        },

        _load: function(isShowLoading) {
            var that=this;

            for(var i=records.length-1;i>=0;i--) {
                records[i].disableAutoRefreshing();
            }

            that.params[that.KEY_PAGE]=that.pageIndex;

            that.abort();

            if(that.loadingOptions.showLoading) that.loadingOptions.showLoading();
            else that.showLoading();

            that._xhr=$.ajax({
                url: app.url(that.loadingOptions.url),
                headers: that.loadingOptions.headers,
                data: that.params,
                type: that.loadingOptions.type,
                dataType: that.loadingOptions.dataType||'json',
                error: function(xhr) {
                    that._xhr=null;
                    that.isError=true;
                    that.isLoading=false;
                    that.loadingOptions.error.call(that,{ msg: '网络错误' },xhr);
                },
                success: function(res,status,xhr) {
                    that._xhr=null;
                    that.isLoading=false;

                    if(that.loadingOptions.check===false||that.check(res)) {
                        that.hideLoading();

                        if(that.loadingOptions.checkData===false||that.hasData(res)) {
                            if(that.pageIndex==1||!that.loadingOptions.refresh) that.loadingOptions.success.call(that,res,status,xhr);
                            else that.loadingOptions.refresh.call(that,res,status,xhr);

                            that.checkAutoRefreshing(res);
                        } else {
                            that.dataNotFound(res);
                        }
                    } else {
                        that.isError=true;
                        that.isLoading=false;
                        that.loadingOptions.error.call(that,res);
                    }
                },
                complete: $.proxy(that.loadingOptions.complete)
            });
        },

        _refresh: function() {
            this._load();
        },

        dataNotFound: function(e,res) {
            var that=this;

            if(that.pageIndex==1) {
                that.showError('暂无数据');
            } else {
                setTimeout(function() {
                    that.$refreshing.hide()

                },3000);
            }
        },

        _scroll: function(e,x,y) {
            var that=this;

            if(!that.isLoading
                &&that._scrollY<y
                &&y+that.$scroll.height()>=that.$refreshing[0].offsetTop) {

                that._refresh();
            }

            that._scrollY=y;
        },

        _autoRefreshingEnabled: false,

        checkAutoRefreshing: function(res) {
            var that=this,
                data=that.params;

            if(that.loadingOptions.refresh&&((that.DATAKEY_PAGENUM&&res[that.DATAKEY_PAGENUM]&&res[that.DATAKEY_PAGENUM]>data[that.KEY_PAGE])||(that.DATAKEY_TOTAL&&res[that.DATAKEY_TOTAL]&&res[that.DATAKEY_TOTAL]>data[that.KEY_PAGE]*data[that.KEY_PAGESIZE]))) {

                that.pageIndex++;
                that.enableAutoRefreshing();

            } else {
                that.disableAutoRefreshing();
            }
        },

        enableAutoRefreshing: function() {
            var $refreshing=(this.$refreshing||(this.$refreshing=$(this.refresh)).appendTo(this.$list)).show();

            if(this._autoRefreshingEnabled) return;
            this._autoRefreshingEnabled=true;

            this.$scroll.on('scrollStop',$.proxy(this._scroll,this));

            this._scrollY=this.el.scrollTop;

            if(this.el.scrollTop+this.$list.height()-this.$list.matrix().ty>=this.$refreshing.offset().top) {
                this._refresh();
            }
        },

        disableAutoRefreshing: function() {
            if(!this._autoRefreshingEnabled) return;
            this._autoRefreshingEnabled=false;

            this.$scroll.off('scrollStop',this._scroll);

            this.$refreshing&&this.$refreshing.hide();
        },

        abort: function() {
            if(this._xhr) {
                this.isLoad=false;
                this._xhr.abort();
                this._xhr=null;

                this.hideLoading();
            }
        },

        destory: function() {
            this.abort();

            view.fn.destory.apply(this,arguments);
        }

    });

    module.exports=Loading;
});
