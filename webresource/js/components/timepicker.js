define(function (require, exports, module) {
    var $ = require('$'),
        util = require('util');

    var optionHeight = 20;

    util.style('.calendar.curr{z-index:5001;}.calendar{height:22px;padding:1px;zoom:1;display:inline-block;*display:inline;position:relative;overflow:visible;z-index:0;color:#000;}\
        .calendar span {cursor:pointer;border:0;margin:0;padding:0 2px;height:20px;line-height:20px;display:inline-block;position:relative;color:#000;background-color:#f1f1f1;}\
        .calendar span.calendar-year {}\
        .calendar-icon{margin: -4px 0 0 -2px;_margin-top: 0px;display: inline-block;vertical-align: middle;position: relative;font-size: 12px;width: 10px;height: 4px;overflow: hidden;line-height: 12px;font-family: "SimSun";}\
        .calendar-icon em {display: inline-block;height: 19px;overflow: hidden;font-family: "SimSun";position: absolute;top: -7px;left: 0px;}\
        .calendar-up .calendar-icon em {top: 0px;left: 0px;}\
        .calendar-up,.calendar-down {cursor:pointer;}\
        .calendar-bd {display:none;position:absolute;border:1px solid #cdcdcd;background:#fff;width:35px;text-align:center;top:0;left:0;}\
        .calendar-bd i { display: block; height: ' + optionHeight + 'px;font-style:normal; }\
        .calendar-bd i.curr { background:#ddd; }');


    var contentTmpl = '<%for(var i=0,len=$data.length,item;i<len;i++){item=$data[i];%><div class="calendar-bd <%=item.css%>"><div class="calendar-up"><em class="calendar-icon"><em>◆</em></em></div><div class="calendar-con"><%=item.content%></div><i class="js_calendar_now"><%=item.text%></i><div class="calendar-down"><em class="calendar-icon"><em>◆</em></em></div></div><%}%>',
        calendarTmpl = '<div class="calendar"><span class="calendar-year" style="z-index:10;"><em data-val="<%=year%>"><%=yyyy%></em></span>/<span style="z-index:9;"><em data-val="<%=month%>"><%=MM%></em></span>/<span style="z-index:8;"><em data-val="<%=day%>"><%=dd%></em></span> <span style="z-index:7;"><em data-val="<%=hour%>"><%=hh%></em></span>:<span style="z-index:6;"><em data-val="<%=minutes%>"><%=mm%></em></span>:<span style="z-index:5;"><em data-val="<%=seconds%>"><%=ss%></em></span></div>';


    var getTimeItems = function (from, to, pad) {
        var result = "";
        for (var i = from; i <= to; i++) {
            result += '<i data-val="' + util.pad(i, pad) + '">' + util.pad(i, pad) + '</i>';
        }
        if (to - from >= 10) {
            return '<div style="height:200px;overflow:hidden;">' + result + '</div>';
        }
        return result;
    };

    var TimePicker = function ($input, options) {
        var now = new Date();
        var self = this;

        options = $.extend({
            yearFrom: now.getFullYear() - 30,
            yearTo: now.getFullYear() + 5
        }, options);

        this.$input = $input;

        var $calendar = $(util.template(calendarTmpl, {
            yyyy: '----', MM: '--', dd: '--', hh: '--', mm: '--', ss: '--',
            year: now.getFullYear(),
            day: now.getDate(),
            month: now.getMonth() + 1,
            hour: now.getHours(),
            minutes: now.getMinutes(),
            seconds: now.getSeconds(),
        }))
        .insertBefore($input);

        var textList = $calendar.find('span em'),
            calendarSelectors = $(util.template(contentTmpl, [{
                css: 'js_calendar_year',
                content: getTimeItems(options.yearFrom, options.yearTo, 4),
                text: '今天'
            }, {
                css: 'js_calendar_month',
                content: getTimeItems(1, 12),
                text: '今天'
            }, {
                css: 'js_calendar_day',
                text: '今天'
            }, {
                css: 'js_calendar_hours',
                content: getTimeItems(0, 23),
                text: '现在'
            }, {
                css: 'js_calendar_minutes',
                content: getTimeItems(0, 59),
                text: '现在'
            }, {
                css: 'js_calendar_seconds',
                content: getTimeItems(0, 59),
                text: '现在'
            }])),
            timeStore = [0, 0, 0, 0, 0, 0],
            aDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        this.timeStore = timeStore;

        $input.on('timeChange', function () {
            var value = this.value;
            if (!value) {
                textList.html('--');
                textList.eq(0).html('----');
                calendarSelectors.eq(2).find('.calendar-con').html('');
                return;
            }

            $.each(value.split(/\s|\:|-|\//), function (i, item) {
                item = parseInt(item.replace(/^0+/, '')) || 0;
                timeStore[i] = item;
                textList.eq(i).text(item || item === 0 ? util.pad(item, i == 0 ? 4 : 2) : '--');
            });
            var val = timeStore[0], day;
            if (val % 4 == 0 && (val % 100 != 0 || val % 400 == 0)) {
                day = aDays[1] = 29;
            } else {
                day = aDays[1] = 28;
            }
            val = timeStore[1];
            day = aDays[val - 1];
            if (timeStore[2] > day) {
                timeStore[2] = day;
                textList.eq(2).text(util.pad(day));
            };
            calendarSelectors.eq(2).find('.calendar-con').html(getTimeItems(1, day, 2));

            self._update();
        });

        $calendar.children('span').each(function (j) {
            var item = $(this),
                itemText = item.find('em'),
                selector = calendarSelectors.eq(j);

            item.click(function (e) {

                var val = itemText.text();
                if (val[0] == '-') val = itemText.data('val');

                var selectorItems = selector.find('.calendar-con i'),
                    firstSelectorItem = selectorItems.eq(0),
                    selectorItem = selectorItems.filter('[data-val="' + val + '"]'),
                    index = selectorItem.index();

                selectorItems.filter('.curr').removeClass('curr');
                if (index != -1) {
                    selectorItem.addClass('curr');
                    var top = (5 - index) * optionHeight;
                    top = Math.max(top, (selectorItems.length - 10) * optionHeight * -1);
                    top = Math.min(top, 0);

                    firstSelectorItem.css({ 'margin-top': top });
                    selector.css({ 'margin-top': Math.max(item.offset().top * -1, -1 * index * optionHeight - top - 20) });
                } else {
                    selector.css({ 'margin-top': Math.max(item.offset().top * -1, -1 * 5 * optionHeight - 20) });
                }
                selector.show();

                $calendar.addClass('curr');

                $(document.body).on('mouseup', function (e) {
                    if (selector.has(e.target).length == 0) {
                        selector.hide();
                        $calendar.removeClass('curr');
                        $(this).off('mouseup', arguments.callee);
                    }
                });

                e.preventDefault();
                return false;
            })
            .append(selector);

            selector.delegate('.calendar-con i', 'click', function (e) {
                var val = $(this).attr('data-val'),
                    day;
                selector.hide();
                itemText.text(val);
                val = parseInt(val.replace(/^0+/, '')) || 0;
                timeStore[j] = val;

                if (selector.hasClass('js_calendar_year')) {
                    if (val % 4 == 0 && (val % 100 != 0 || val % 400 == 0)) {
                        day = aDays[1] = 29;
                    } else {
                        day = aDays[1] = 28;
                    }
                    if (timeStore[1] == 2 && timeStore[2] > day) {
                        timeStore[2] = day;
                        textList.eq(2).text(util.pad(day));
                    }
                } else if (selector.hasClass('js_calendar_month')) {
                    day = aDays[val - 1];
                    if (timeStore[2] > day) {
                        timeStore[2] = day;
                        textList.eq(2).text(util.pad(day));
                    };
                    calendarSelectors.eq(2).find('.calendar-con').html(getTimeItems(1, day, 2));
                }

                $input.trigger('onTimeChange');
                e.preventDefault();
                return false;
            });

            selector.find('.calendar-down').click(function (e) {
                var selectorItems = selector.find('.calendar-con i'),
                    firstSelectorItem = selectorItems.eq(0);

                var top = parseInt(firstSelectorItem.css('margin-top'));
                top -= optionHeight * 10;
                firstSelectorItem.css({ 'margin-top': Math.max(top, (selectorItems.length - 10) * optionHeight * -1) });
                return false;
            });

            selector.find('.calendar-up').click(function (e) {
                var selectorItems = selector.find('.calendar-con i'),
                    firstSelectorItem = selectorItems.eq(0),
                    top = parseInt(firstSelectorItem.css('margin-top'));
                top += optionHeight * 10;
                firstSelectorItem.css({ 'margin-top': Math.min(top, 0) });
                return false;
            });
        });
        $calendar.find('.js_calendar_now').click(function (e) {
            var d = new Date();
            timeStore[0] = d.getFullYear();
            timeStore[1] = d.getMonth() + 1;
            timeStore[2] = d.getDate();
            if ($(this).text() == '现在') {
                timeStore[3] = d.getHours();
                timeStore[4] = d.getMinutes();
                timeStore[5] = d.getSeconds();
            }

            self._update();
            $calendar.find('.calendar-bd').hide();
            return false;
        });

        if ($input.val() != '') $input.trigger('timeChange');
    }

    TimePicker.prototype = {
        _update: function () {
            var timeStore = this.timeStore;
            this.$input.val(util.pad(timeStore[0], 4) + '-' + util.pad(timeStore[1]) + '-' + util.pad(timeStore[2]) + ' ' + util.pad(timeStore[3]) + ':' + util.pad(timeStore[4]) + ':' + util.pad(timeStore[5])).trigger('change');
        },
        val: function (dt) {
            this.$input.val(dt).trigger('timeChange');
        }
    };

    module.exports = TimePicker;

});