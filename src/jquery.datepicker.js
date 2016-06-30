;
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery', 'moment', './jquery.datepicker.css'], factory);
    } else if (typeof exports === 'object') {

        require("./jquery.datepicker.css");

        // Node, CommonJS之类的
        module.exports = factory(require('jquery'), reqire('moment'));
    } else {
        // 浏览器全局变量(root 即 window)
        root.returnExports = factory(root.jQuery);
    }
}(this, function($) {

    var i18nWeeks = ['日', '一', '二', '三', '四', '五', '六', ];
    var i18nMonths = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一', '十二'];

    var tpl = '\
            <div class="x-datepicker-head fix">\
                <div class="head-inner lt">\
                    <span class="icon-item prev-year lt"><<</span>\
                    <span class="icon-item prev-month lt"><</span>\
                    <span class="current-month"></span>\
                </div>\
                <div class="head-inner rt">\
                    <span class="icon-item next-year rt">>></span>\
                    <span class="icon-item next-month rt">></span>\
                    <span class="current-year"></span>\
                </div>\
            </div>\
            <div class="x-datepicker-body">\
                <div class="x-datepicker-days">\
                    <div class="x-datepicker-divider"></div>\
                    <table cellspacing=0 cellpadding=0><tbody></tbody></table>\
                </div>\
                <div class="x-datepicker-months">\
                    <div class="x-datepicker-divider"></div>\
                    <table cellspacing=0 cellpadding=0><tbody></tbody></table>\
                    <table cellspacing=0 cellpadding=0>\
                        <tbody>\
                            <tr class="row-action">\
                                <td class="holder">&nbsp;</td>\
                                <td class="hide-month">x</td>\
                                <td class="holder">&nbsp;</td>\
                            </tr>\
                        </tbody>\
                    </table>\
                </div>\
                <div class="x-datepicker-years">\
                    <div class="x-datepicker-divider"></div>\
                    <table cellspacing=0 cellpadding=0><tbody></tbody></table>\
                    <table cellspacing=0 cellpadding=0>\
                        <tbody>\
                            <tr class="row-action">\
                                <td class="less-year"><-</td>\
                                <td class="hide-year">x</td>\
                                <td class="more-year">-></td>\
                            </tr>\
                        </tbody>\
                    </table>\
                </div>\
            </div>\
            <div class="x-datepicker-foot"></div>\
    ';
    /**
     * options=>{container:document.body,inline:false,firstDay:0,showWeekNum:true,showWeek:true,rpad:true,value:new Date()}
     */
    function DatePicker($el, options) {

        options = options || {};
        options.firstDay = options.firstDay || 0;

        this.options = options;

        //销毁了
        this.date = options.date || new Date();

        this.$el = $el.addClass('x-datepicker').html(tpl);

        options.inline && $el.addClass('x-datepicker-inline');
        options.cls && $el.addClass(options.cls);

        this.init();
    }

    DatePicker.prototype.init = function() {
        var self = this,
            $el = this.$el;

        this.$elDays = $el.find('.x-datepicker-days');
        this.$elMonths = $el.find('.x-datepicker-months');
        this.$elYears = $el.find('.x-datepicker-years');

        this.$elYear = $el.find('.current-year');
        this.$elMonth = $el.find('.current-month');

        this.$elYear.text(this.date.getFullYear());
        this.$elMonth.text(i18nMonths[this.date.getMonth()]);

        this.renderDays();
        this.renderMonths();
        this.renderYears(this.date.getFullYear());

        // 鼠标在导航月份上移动
        $el.on('mouseenter', '.current-month', function(e) {
            var from = e.relatedTarget;
            if (self.$elMonths[0] == from || self.$elMonths.find(from).length)
                return self.clearTimeout('hide_month') && false;

            self.setTimeout('show_month', function() {
                this.showMonths();
            }, 100);
        }).on('mouseleave', '.current-month', function(e) {
            self.clearTimeout('show_month').setTimeout('hide_month', function() {
                this.hideMonths();
            }, 100);
        });

        // 鼠标移动到月份面板上
        $el.on('mouseenter', '.x-datepicker-months', function(e) {
            self.clearTimeout('hide_month');
        }).on('mouseleave', '.x-datepicker-months', function(e) {
            self.clearTimeout('show_month').setTimeout('hide_month', function() {
                self.hideMonths();
            }, 100);
        });

        // 鼠标在导航年份上移动
        $el.on('mouseenter', '.current-year', function(e) {
            var from = e.relatedTarget;
            if (self.$elYears[0] == from || self.$elYears.find(from).length)
                return self.clearTimeout('hide_year') && false;

            self.setTimeout('show_year', function() {
                this.showYears();
            }, 100);
        }).on('mouseleave', '.current-year', function(e) {
            self.clearTimeout('show_year').setTimeout('hide_year', function() {
                this.hideYears();
            }, 100);
        });

        // 鼠标移动到年份面板上
        $el.on('mouseenter', '.x-datepicker-years', function() {
            self.clearTimeout('hide_year');
        }).on('mouseleave', '.x-datepicker-years', function() {
            self.clearTimeout('show_year').setTimeout('hide_year', function() {
                self.hideYears();
            }, 100);
        });

        // 鼠标悬浮效果
        $el.on('mouseenter', '.day:not(.disabled),.year:not(.disabled),.month:not(.disabled)', function() {
            $(this).addClass('hover');
        }).on('mouseleave', '.day:not(.disabled),.year:not(.disabled),.month:not(.disabled)', function() {
            $(this).removeClass('hover');
        });

        // 点击月份视图/年份视图x操作
        $el.on('click', '.row-action .hide-month', function() {
            self.clearTimeout('show_month').clearTimeout('hide_month').hideMonths();
        }).on('click', '.row-action .hide-year', function() {
            self.clearTimeout('show_year').clearTimeout('hide_year').hideYears();
        });

        // 点击年份视图增减操作
        $el.on('click', '.row-action .more-year', function() {
            self.renderYears(self.cntYear += 12);
        }).on('click', '.row-action .less-year', function() {
            self.renderYears(self.cntYear -= 12);
        });

        // 点击导航栏视图年
        $el.on('click', '.current-year', function() {
            self.date.getFullYear() !== self.cntYear && self.renderYears();
        });

        // 点击导航栏视图月
        $el.on('click', '.current-month', function() {
            self.renderMonths();
        });

        // 点击导航栏视图上一年
        $el.on('click', '.prev-year', function() {
            var date = self.date;
            date.setFullYear(date.getFullYear() - 1);

            self.$elYear.text(date.getFullYear());
            self.$elMonth.text(i18nMonths[date.getMonth()]);

            self.renderDays();

            setTimeout(function() {
                self.renderYears().renderMonths();
            }, 0);
        });

        // 点击导航栏视图下一年
        $el.on('click', '.next-year', function() {
            var date = self.date;
            date.setFullYear(date.getFullYear() + 1);

            self.$elYear.text(date.getFullYear());
            self.$elMonth.text(i18nMonths[date.getMonth()]);

            self.renderDays();

            setTimeout(function() {
                self.renderYears().renderMonths();
            }, 0);
        });

        // 点击导航栏视图上一月
        $el.on('click', '.prev-month', function() {
            var date = self.date,
                year = date.getFullYear();

            date.setMonth(date.getMonth() - 1);

            self.$elYear.text(date.getFullYear());
            self.$elMonth.text(i18nMonths[date.getMonth()]);

            self.renderDays();

            setTimeout(function() {
                self.renderMonths();
            }, 0);

            date.getFullYear() !== year && setTimeout(function() {
                self.renderYears();
            }, 0);
        });

        // 点击导航栏视图下一月
        $el.on('click', '.next-month', function() {
            var date = self.date,
                year = date.getFullYear();

            date.setMonth(date.getMonth() + 1);

            self.$elYear.text(date.getFullYear());
            self.$elMonth.text(i18nMonths[date.getMonth()]);

            self.renderDays();

            setTimeout(function() {
                self.renderMonths();
            }, 0);

            date.getFullYear() !== year && setTimeout(function() {
                self.renderYears();
            }, 0);
        });

        // 点击具体年份，选中
        $el.on('click', '.year:not(".disabled")', function() {
            var $td = $(this);
            if ($td.hasClass('active'))
                return;

            var date = self.date;
            date.setFullYear(+$td.text());
            self.$elYear.text(date.getFullYear());

            self.renderYears();

            setTimeout(function() {
                self.renderDays().renderMonths();
            }, 0);
        });

        // 点击具体月份，选中
        $el.on('click', '.month:not(".disabled")', function() {
            var $td = $(this);
            if ($td.hasClass('active'))
                return;

            var date = self.date;
            date.setMonth(+$td.data('value'));
            self.$elMonth.text(i18nMonths[date.getMonth()]);

            self.renderMonths();

            setTimeout(function() {
                self.renderDays();
            }, 0);
        });

        // 点击具体日期，选中
        $el.on('click', '.day:not(".disabled")', function() {
            var $td = $(this);
            if ($td.hasClass('active'))
                return;

            var date = self.date;

            if ($td.hasClass('day-next-month')) {
                date.setMonth(date.getMonth() + 1);
                date.setDate(+$td.text());
                self.$elYear.text(date.getFullYear());
                self.$elMonth.text(i18nMonths[date.getMonth()]);
                return self.renderDays();
            }

            if ($td.hasClass('day-prev-month')) {
                date.setMonth(date.getMonth() - 1);
                date.setDate(+$td.text());
                self.$elYear.text(date.getFullYear());
                self.$elMonth.text(i18nMonths[date.getMonth()]);
                return self.renderDays();
            }

            date.setDate(+$td.text());
            $td.closest('tbody').find('.active').removeClass('active');
            $td.addClass('active');
        });
    };

    DatePicker.prototype.rpad = function(v) {
        return v < 10 ? '0' + v : v;
    };

    DatePicker.prototype.setTimeout = function(timerKey, callback, timeout) {
        var self = this;
        var key = '_timer_' + timerKey;
        this[key] && clearTimeout(this[key]);
        this[key] = setTimeout(function() {
            callback.call(self);
        }, timeout || 0);
        return this;
    };

    DatePicker.prototype.clearTimeout = function(timerKey, callback, timeout) {
        var self = this;
        var key = '_timer_' + timerKey;
        this[key] && clearTimeout(this[key]);
        this[key] = null;
        return this;
    };

    DatePicker.prototype.renderHead = function() {
        this.$el.find('.x-datepicker-head');
    };

    DatePicker.prototype.show = function(event) {
        console.log(event)

    };

    DatePicker.prototype.hide = function(event) {
        console.log(event)

    };

    DatePicker.prototype.showYears = function() {
        this.$elYears.stop().slideDown(200);
        return this;
    };

    DatePicker.prototype.hideYears = function() {
        this.$elYears.stop().slideUp(200);
        return this;
    };

    DatePicker.prototype.showMonths = function() {
        this.$elMonths.stop().slideDown(200);
        return this;
    };

    DatePicker.prototype.hideMonths = function() {
        this.$elMonths.stop().slideUp(200);
        return this;
    };

    DatePicker.prototype.showHours = function() {
        console.log(event)

    };

    DatePicker.prototype.showMinutes = function() {
        console.log(event)

    };

    DatePicker.prototype.showSeconds = function() {
        console.log(event)

    };

    DatePicker.prototype.renderDays = function(date) {
        date = date || this.date;

        var html = [];
        var opts = this.options;

        // 具体日期单元格
        var concatDay = function(currentDate, renderDate, html) {
            var date = currentDate.getDate();

            // 当前计算的单元格日期201605
            var current = '' + currentDate.getFullYear() + this.rpad(currentDate.getMonth() + 1);

            // 准备渲染的月份日期201606
            var render = '' + renderDate.getFullYear() + this.rpad(renderDate.getMonth() + 1);

            // 今天20160613
            var todayDate = new Date();
            var today = '' + todayDate.getFullYear() + this.rpad(todayDate.getMonth() + 1);

            html.push('<td class="day');

            // 前一个月日期
            + current < +render && html.push(' day-other-month day-prev-month');

            // 后一个月日期
            + current > +render && html.push(' day-other-month day-next-month');

            // 今天
            current === today && currentDate.getDate() === todayDate.getDate() && html.push(' current');

            // 当前选中天
            current === render && currentDate.getDate() === renderDate.getDate() && html.push(' active');

            html.push('">', this.options.rpad !== false ? this.rpad(date) : date, '</td>');
        };

        var totalMonthDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
            firstMonthDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay(),
            lastMonthDay = new Date(date.getFullYear(), date.getMonth(), totalMonthDays).getDay(),
            daysFromPevMonth = firstMonthDay - opts.firstDay,
            daysFromNextMonth = 6 - lastMonthDay + opts.firstDay;

        daysFromPevMonth = daysFromPevMonth < 0 ? daysFromPevMonth + 7 : daysFromPevMonth;
        daysFromNextMonth = daysFromNextMonth > 6 ? daysFromNextMonth - 7 : daysFromNextMonth;

        // 显示周
        if (opts.showWeek !== false) {
            var firstDay = opts.firstDay % 7;

            html.push('<tr>');

            // 显示每年中第几周
            opts.showWeekNum !== false && html.push('<td class="weekday weekday-title">周</td>');

            // 星期几序号
            for (var i = 0; i < 7; i++)
                html.push('<td class="weekday">', i18nWeeks[firstDay + i], '</td>');

            html.push('</tr>');
        }

        // 一定要渲染42个日期
        var delta = 42 - (totalMonthDays + daysFromNextMonth + daysFromPevMonth);

        // 计算日期
        for (var i = -daysFromPevMonth + 1, count = 0, max = totalMonthDays + daysFromNextMonth + delta; i <= max; i++, count++) {
            var cellDate = new Date(date.getFullYear(), date.getMonth(), i);
            count % 7 == 0 && count !== 0 && html.push('</tr>');
            count % 7 == 0 && html.push('<tr>');
            // 显示每年第几周
            opts.showWeekNum !== false && count % 7 == 0 && html.push('<td class="weeknum">', this.rpad(moment(cellDate).week()), '</td>');
            concatDay.call(this, cellDate, date, html);
        }
        html.push('</tr>');
        this.$elDays.find('> table > tbody').html(html.join(''));
        return this;
    };

    DatePicker.prototype.renderMonths = function() {
        var html = [];
        var stdMonth = this.date.getMonth();
        var cntMonth = new Date().getMonth();

        for (var i = 0; i < 4; i++) {
            html.push('<tr>');

            html.push('<td class="month');
            cntMonth === i * 3 + 0 && html.push(' current');
            stdMonth === i * 3 + 0 && html.push(' active');
            html.push('" data-value="', i * 3 + 0, '">', i18nMonths[i * 3 + 0], '</td>');

            html.push('<td class="month');
            cntMonth === i * 3 + 1 && html.push(' current');
            stdMonth === i * 3 + 1 && html.push(' active');
            html.push('" data-value="', i * 3 + 1, '">', i18nMonths[i * 3 + 1], '</td>');

            html.push('<td class="month');
            cntMonth === i * 3 + 2 && html.push(' current');
            stdMonth === i * 3 + 2 && html.push(' active');
            html.push('" data-value="', i * 3 + 2, '">', i18nMonths[i * 3 + 2], '</td>');

            html.push('</tr>');
        }
        this.$elMonths.find('> table:eq(0) > tbody').html(html.join(''));
        return this;
    };

    DatePicker.prototype.renderYears = function(year) {
        var stdYear = this.date.getFullYear();
        year = year || stdYear;
        year -= 4;

        this.cntYear = year;
        var nowYear = new Date().getFullYear();

        var tmp, html = [];
        for (var i = 0; i < 4; i++) {
            html.push('<tr>');
            for (var j = 0; j < 3; j++) {
                tmp = year + 3 * i + j;
                html.push('<td class="year');
                tmp === nowYear && html.push(' current');
                tmp === stdYear && html.push(' active');
                html.push('">', tmp, '</td>');
            }
            html.push('</tr>');
        }
        this.$elYears.find('> table:eq(0) > tbody').html(html.join(''));
        return this;
    };

    DatePicker.prototype.setMaxDate = function() {

    };

    DatePicker.prototype.setMinDate = function() {

    };

    DatePicker.prototype.setDisableDates = function() {

    };

    DatePicker.prototype.setDisableDays = function() {

    };

    DatePicker.prototype.on = function(evt, cb) {
        this.$el.on('datepicker.' + evt, cb);
    };

    DatePicker.prototype.once = function(evt, cb) {
        this.$el.once('datepicker.' + evt, cb);
    };

    DatePicker.prototype.off = function(evt, cb) {
        this.$el.off('datepicker.' + evt, cb);
    };

    DatePicker.prototype.trigger = function(evt) {
        this.$el.trigger('datepicker.' + evt, this.date);
    };

    $.fn.datepicker = function(options) {

        options = options || {};

        $(this).each(function() {
            new DatePicker($(this), options);
        });
    };

    return $;

}));
