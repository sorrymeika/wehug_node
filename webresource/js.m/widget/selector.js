define(function (require, exports, module) {
    var $ = require('$'),
        util = require('util'),
        Scroll = require('./scrollview');

    var SelectorItem = function (options) {
        var that = this;

        Scroll.call(this, this.el, options);

        $.extend(this, util.pick(options, ['itemHeight', 'template']));

        options = this.options;
        var data = options.data || [];
        !data.length && data.push({ text: '无数据' });

        options.onChange && this.on("Change", options.onChange);

        this.$scroller.addClass('selectorcon');
        this.$content = $('<ul></ul>').appendTo(this.$scroller);

        this.set(data);
    };

    $.extend(SelectorItem.prototype, Scroll.prototype, {
        options: {
            bounce: false,
            hScroll: false,
            vScroll: true
        },

        init: function () {
        },

        el: '<div class="selector"></div>',

        template: util.template('<li><%=text%></li>'),

        set: function (data) {
            var that = this;
            var html = '';
            $.each(data, function (i, item) {
                html += that.template(item);
            });

            this.data = data;
            this.currentData = data && data.length ? data[0] : {};
            this.$content.html(html);
        },

        beforeMomentum: function () {
            this.touch.addMomentumOptions(this._startTop, this.y, this.minY, this.maxY, this.wrapperH, this.itemHeight);
        },

        momentum: function (a) {
            this.y = a.current;
            this.$scroller.css({ '-webkit-transform': 'translate(' + (-this.x) + 'px,' + (-this.y) + 'px) translateZ(0)' });
        },

        stop: function () {
            this.index(Math.round(this.y / this.itemHeight));
        },

        itemHeight: 30,
        minDelta: 0,

        _index: 0,
        index: function (index) {
            if (typeof index === 'undefined') return this._index;
            if (this._index != index) {
                this.currentData = this.data[index];
                this.trigger('Change', [index, this.currentData]);
                this._index = index;

                var y = index * this.itemHeight;
                y != this.y && this.scrollTo(0, y, 200);
            }
        },

        val: function (val) {
            if (typeof val === 'undefined')
                return this.currentData.value;

            var index = util.indexOf(this.data, typeof val !== "function" ? function (item) {
                return item.value == val;
            } : val);

            this.index(index);
        }

    });

    var Selector = function (options) {
        options = $.extend({
            complete: function () { },
            options: []
        }, options);

        var that = this;
        var $container = $('<div style="position:fixed;top:0px;bottom:0px;left:0px;right:0px;width:100%;background: rgba(0,0,0,0);z-index:1000;display:none;overflow:hidden;"></div>').on('touchmove', false).appendTo('body');
        this.$container = $container;

        this.$mask = $('<div style="position:fixed;top:0px;bottom:0px;right:0px;width:100%;background: rgba(0,0,0,.3);z-index:999;display:none"></div>').appendTo('body');
        this.$el = $('<div class="selectorwrap" style="display:none"><div class="selectorbar"><b class="js_click">完成</b></div></div>').appendTo($container);
        this.selectors = [];

        $container.on('tap', function (e) {
            if (e.target === $container[0])
                that.hide();
        });

        if (!$.isArray(options.options)) {
            options.options = [options.options];
        }

        $.each(options.options, function (i, item) {
            that.add(item);
        });

        this.$click = this.$el.find('.js_click').on('tap', function () {
            var result = [];
            $.each(that.selectors, function (i, sel) {
                result.push(sel.currentData);
            });

            options.complete && options.complete.call(that, result);
            that.hide();
        });
    };

    Selector.prototype = {
        _visible: false,
        eq: function (i) {
            return this.selectors[i];
        },
        each: function (fn) {
            $.each(this.selectors, fn);
        },
        add: function (options) {
            var sel = new SelectorItem(options);
            this.selectors.push(sel);
            this.$el.append(sel.$el);
        },
        hide: function () {
            var that = this;

            if (this._visible) {
                that.$mask.animate({
                    backgroundColor: 'rgba(0,0,0,0)'
                }, 350, function () {
                    that.$mask.hide().css({ backgroundColor: 'rgba(0,0,0,.3)' });
                });

                this.$el.css({
                    '-webkit-transform': 'translate(0px,0%)'
                })
                .animate({
                    'translate': '0px,100%'
                }, 300, 'ease-out', function () {
                    that._visible = false;
                    that.$el.hide();
                    that.$container.hide();
                });
            }

            return that;
        },
        show: function () {
            var that = this;

            !that._visible && (that.$container.show(), that.$mask.show(), that.$el.css({
                'display': 'block',
                '-webkit-transform': 'translate(0px,100%)'
            })
            .animate({
                'translate': '0px,0%'
            }, 300, 'ease-out', function () {
                that._visible = true;
                that.each(function () {
                    this.scrollTo(0, this._index * this.itemHeight);
                });
            }));

            return that;
        },
        destory: function () {
            this.$click.off('click').off('tap')
        }
    };

    return Selector;
});
