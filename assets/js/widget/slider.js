define(function(require,exports,module) {
    var $=require('$'),
        _=require('util'),
        ScrollView=require('./scrollview');

    var Slider=function(el,options) {
        options=$.extend({
            maxDuration: 400,
            ease: 'ease-out',
            hScroll: true,
            vScroll: false,
            width: '100%'
        },options);

        $.extend(this,_.pick(options,['width','loop','render','template','itemTemplate','navTemplate']));

        var that=this,
            data=options.data,
            items=[],
            item,
            $slider;

        if(typeof that.itemTemplate==='string') that.itemTemplate=_.template(that.itemTemplate);
        if(typeof that.width=='string') that.width=parseInt(that.width.replace('%',''));

        if(!$.isArray(data)) data=[data];
        that._data=data;
        that.length=data.length;

        if(options.index!=undefined) options.index=options.index;

        for(var i=0,n=data.length;i<n;i++) {
            items.push(that.render(data[i]));
        }

        ScrollView.call(this,$(that.template({
            items: items.join(''),
            navs: ''
        })).appendTo($(el)),options);

        that.touch.on('stop',that.stop,that);

        $slider=that.$slider=that.$el.find('.js_slider');
        that.$items=$slider.children();
        that.slider=$slider[0];

        //that.index=index== -1?that.length%2==0?that.length/2-1:Math.floor(that.length/2):index;
        if(that.length<2) that.loop=false;
        else if(that.width<100) that.loop=false;

        var length;
        if(that.loop) {
            $slider.prepend(that.$items.eq(that.length-1).clone());
            $slider.append(that.$items.eq(0).clone());
        } else {
            length=that.length;
        }

        if(options.imagelazyload) {
            that.bind("Change",function() {
                that._loadImage();
            });
            that._loadImage();
        }

        if(options.arrow) {
            that._prev=$('<span class="slider-pre js_pre"></span>').appendTo(that.$el);
            that._next=$('<span class="slider-next js_next"></span>').appendTo(that.$el);

            that.listen('tap .js_pre',function(e) {
                that.index(options.index-1);
            })
                .listen('tap .js_next',function(e) {
                    that.index(options.index+1);
                });
        }

        $(window).on('ortchange',$.proxy(that._adjustWidth,that));

        that._adjustWidth();
    }

    var fn=ScrollView.prototype;

    Slider.prototype=Object.create(fn);

    $.extend(Slider.prototype,{
        loop: false,

        start: function() {
            var that=this,
                touch=that.touch,
                index=this._getIndex();


            if(!that.options.hScroll&&touch.isDirectionX||!that.options.vScroll&&touch.isDirectionY) {
                touch.stop();
                return;
            }

            that.maxX=Math.min(that.scrollerW-that.wrapperW,(index+1)*that.wrapperW);
            that.minX=Math.max(0,(index-1)*that.wrapperW);
            that._startLeft=that.startLeft=that.x
        },

        index: function(index) {
            var options=this.options,
                x;

            if(typeof index==='undefined') return options.index;

            index=index>=this._data.length?0:index<0?this._data.length-1:index;

            if(options.index!=index) {
                this.currentData=this._data[index];
                this._change();
                options.index=index;
            }

            x=index*this.wrapperW;
            //if(x!=this.x) this.animate(x,0,200);
        },
        _getIndex: function() {
            return Math.round(this.x/this.wrapperW);
        },
        data: function(index) {
            return this._data[index||this.options.index];
        },
        appendItem: function() {
            var item=$(this.renderItem(''));
            this.$slider.append(item);
            this.length++;
            this._adjustWidth();

            return item;
        },
        prependItem: function() {
            var item=$(this.renderItem(''));
            this.$slider.prepend(item);
            this.length++;
            this._adjustWidth();

            return item;
        },
        render: function(dataItem) {
            return this.renderItem(this.itemTemplate(dataItem));
        },
        renderItem: _.template('<li class="js_slide_item slider-item">$data</li>'),
        itemTemplate: '<%= %>',
        navTemplate: _.template('<ol class="js_slide_navs slider-nav"><%for(var i=0,len=items.length;i<len;i++){%><li class="slide-nav-item <%=current%> slide-nav-item"></li><%}%></ol>'),
        template: _.template('<div class="slider"><ul class="js_slider slider-con"><%=items%></ul><%=navs%></div>'),
        stop: function() {
            var that=this;
            var x=that.x;

            var index=this._getIndex();

            that.index(index);
        },
        _loadImage: function() {
            var that=this;

            var item=that.$items.eq(that.options.index);
            if(!item.prop('_detected')) {

                if(that.loop) {
                    if(that.options.index==0) {
                        item=item.add(that.$slider.children(':last-child'));
                    } else if(that.options.index==that.length-1) {
                        item=item.add(that.$slider.children(':first-child'));
                    }
                }

                item.find('img[lazyload]').each(function() {
                    this.src=this.getAttribute('lazyload');
                    this.removeAttribute('lazyload');
                });

                item.prop('_detected',true);
            }
        },

        _adjustWidth: function() {
            var that=this,
                slider=that.$slider,
                children=slider.children(),
                length=children.length;

            that.wrapperW=that.el.clientWidth*that.width/100;
            that.scrollerW=that.wrapperW*length;

            slider.css({ width: length*that.width+'%',marginLeft: (100-that.width)/2+'%' });

            that.x=that.wrapperW*that.options.index;
            that.touch.$el.css({ '-webkit-transform': 'translate('+(-that.x)+'px,0px) translateZ(0)' });
            that.divisorX=that.wrapperW;

            children.css({ width: 100/length+'%' });
        },

        _change: function() {
            var that=this,
                options=that.options;

            if(options.onChange) options.onChange.call(that,options.index);
            that.trigger('change',options.index,that.currentData);
        },

        destory: function() {
            $(window).off('ortchange',this._adjustWidth);
            this.touch.destory();
        }
    })

    module.exports=Slider;
});
