define(function (require, exports, module) {
    var $ = require('$'),
        util = require('util'),
        animation = require('animation'),
        CubicBezier = require('../graphics/cubicBezier'),
        events = require('./event');

    var slice = Array.prototype.slice;
    var cb = new CubicBezier(.15, .68, .15, .96);

    var Touch = function (el, options) {
        var self = this,
            $el = $(el);

        self.$el = $el;
        self.el = $el[0];
        self.options = $.extend({
            enableVertical: true,
            enableHorizontal: true

        }, options);

        $el.on('touchstart', $.proxy(self._start, self))
            .on('touchmove', $.proxy(self._move, self))
            .on('touchend', $.proxy(self._end, self));
    }

    Touch.prototype = Object.create(events);

    $.extend(Touch.prototype, {
        minDelta: 0,
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0,
        x: 0,
        y: 0,

        _stopMomentum: function () {
            if (this.momentum) {
                this.momentum.stop && this.momentum.stop();
                this._isClickStopAni = true;
                return true;
            }
            else
                return false;
        },

        _start: function (e) {
            var self = this,
                point = e.touches[0];

            self.pointX = self.startPointX = self.sx = point.pageX;
            self.pointY = self.startPointY = self.sy = point.pageY;

            self.isTouchStop = false;
            self.isTouchStart = false;
            self.isTouchMoved = false;

            self.startTime = e.timeStamp || Date.now();

            self.startX = self.x;
            self.startY = self.y;

            self.isClickStopMomentum = self._stopMomentum();

            self.timestamp = Date.now();
        },

        _move: function (e) {
            if (this.isTouchStop) return;

            var self = this,
                point = e.touches[0],
                deltaX = self.startPointX - point.pageX,
                deltaY = self.startPointY - point.pageY;

            self.deltaX = deltaX;
            self.deltaY = deltaY;

            if (!self.isTouchStart) {
                var isDirectionX = Math.abs(deltaX) >= self.minDelta && Math.abs(deltaX) > Math.abs(deltaY),
                    isDirectionY = !isDirectionX;

                if (isDirectionY || isDirectionX) {

                    self.isTouchStart = true;
                    self.isDirectionY = isDirectionY;
                    self.isDirectionX = isDirectionX;
                    self.dir = isDirectionX;

                    if (!self.isInit) {
                        self.trigger('init');
                        self.isInit = true;
                    }
                    self.trigger('start');

                    if (self.isTouchStop) {
                        return;
                    }
                } else {
                    return false;
                }
            }

            var x = self.startX + deltaX;
            var y = self.startY + deltaY;

            self.x = x < self.minX ? self.minX + (x - self.minX) / 2 : x > self.maxX ? self.maxX + (x - self.maxX) / 2 : x;
            self.y = y < self.minY ? self.minY + (y - self.minY) / 2 : y > self.maxY ? self.maxY + (y - self.maxY) / 2 : y;

            self.el.scrollTop = self.y;

            self.trigger('move');

            self.isTouchMoved = true;

            self.isMoveLeft = self.pointX - point.pageX > 0 ? true : self.pointX == point.pageX ? self.isMoveLeft : false;
            self.isMoveTop = self.pointY - point.pageY > 0 ? true : self.pointY == point.pageY ? self.isMoveTop : false;

            self.oldPointX = self.pointX;
            self.oldPointY = self.pointY;

            self.pointX = point.pageX;
            self.pointY = point.pageY;

            self.timestamp = Date.now();

            return false;
        },

        _end: function (e) {
            var self = this;

            if ((!self.isTouchMoved || self.isTouchStop) && self._isClickStopAni) {
                self.momentum.stop();
                self._isClickStopAni = false;
                e.cancelTap = true;
                return;
            }

            if (!self.isTouchMoved) return;
            self.isTouchMoved = false;

            if (self.isTouchStop) return;
            self.isTouchStop = true;

            $(e.target).trigger('touchcancel');


            if (self.options.enableHorizontal && (x < self.minX || x) > self.maxX || self.options.enableVertical && (y < self.minY || y > self.maxY)) {
                self.bounceBack();
                return;
            }

            var point = e.changedTouches[0],
                changeX,
                changeY,
                currentX = self.x,
                currentY = self.y,
                distX,
                distY,
                x,
                y,
                duration;

            if (Date.now() - self.timestamp < 50) {
                changeX = point.pageX - self.oldPointX;
                changeY = point.pageY - self.oldPointY;

                distX = changeX * Math.abs(changeX);
                distY = changeY * Math.abs(changeY);

                duration = Math.abs(Math.max(changeX, changeY)) * 80;

                self.momentum = animation.animate(function (d, current, duration) {
                    d = cb.get(current / duration);
                    x = currentX + distX * d * -1;
                    y = currentY + distY * d * -1;

                    if (self.options.enableVertical && (y < self.minY || y > self.maxY) || (self.options.enableHorizontal && !self.options.enableVertical && (x < self.minX || x > self.maxX))) {
                        self.momentum.stop();
                        distX += currentX;
                        distY += currentY;

                        distX = distX < self.minX ? Math.max(-100, (distX - self.minX) / 4) : distY > self.maxX ? Math.max(100, (distX - self.maxX) / 4) : distX;
                        distY = distY < self.minY ? Math.max(-100, (distY - self.minY) / 4) : distY > self.maxY ? Math.max(100, (distY - self.maxY) / 4) : distY;

                        self.momentum = animation.animate(function (d) {

                        }, Math.max(200, (duration - current) / 4), 'ease', function () {

                        });

                    } else {
                        self.x = x < self.minX ? self.minX : x > self.maxX ? self.maxX : x;
                        self.y = y;
                        self.el.scrollTop = self.y;
                    }

                }, duration, 'ease', function () {

                });
            }

            return false;
        },

        bounceBack: function () {
        },

        stop: function () {
            this.isTouchStop = true;
        },

        _stop: function () {
            this.momentum = null;
            this._isClickStopAni = false;
            this.trigger('stop');
        },

        destory: function () {
            this.$el.off('touchstart', this._start)
                .off('touchmove', this._move)
                .off('touchend', this._end)
        }
    })

    return Touch;

});
