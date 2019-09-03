/*!
 * calendar 0.0.1
 *
 * @license MIT
 * @author Justinas Bei
 */
(function( root, window, document, factory, undefined) {
    if( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define( function() {
            root.fullpage = factory(window, document);
            return root.fullpage;
        } );
    } else if( typeof exports === 'object' ) {
        // Node. Does not work with strict CommonJS.
        module.exports = factory(window, document);
    } else {
        // Browser globals.
        window.calendar = factory(window, document);
    }
})(this, window, document, function(window, document){
    'use strict';

    var CLASS_CALENDAR_INFO = "calendar__info";
    var CLASS_CALENDAR_CODE = "calendar__code";
    var CLASS_CALENDAR_CODE_LOCK = "calendar__code--lock";
    var CLASS_CALENDAR_HEADER = "calendar__header";
    var CLASS_CALENDAR_NAV = "calendar__nav";
    var CLASS_CALENDAR_NAV_PREV = "calendar__nav--prev";
    var CLASS_CALENDAR_NAV_NEXT = "calendar__nav--next";
    var CLASS_CALENDAR_RESET = "calendar__reset";
    var CLASS_CALENDAR_SELECT_START = "calendar__select-start";
    var CLASS_CALENDAR_SELECT_END = "calendar__select-end";
    var CLASS_CALENDAR_WEEK_NAMES = "calendar__week-names";
    var CLASS_CALENDAR_WEEKDAY = 'calendar__weekday'
    var CLASS_CALENDAR_MONTH = "calendar__month";
    var CLASS_CALENDAR_DAYS = "calendar__days";
    var CLASS_CALENDAR_DAY = "calendar__day";
    var CLASS_CALENDAR_DAY_OFF = "calendar__day--off";
    var CLASS_CALENDAR_DAY_DIFFERENT_MONTH = "calendar__day--different-month";
    var CLASS_CALENDAR_DAY_EXP = "calendar__day--exp";
    var CLASS_CALENDAR_DAY_TODAY = "calendar__day--today";
    var CLASS_CALENDAR_DAY_HIGHTLIGHT = "calendar__day--highlight";
    var CLASS_CALENDAR_DAY_SELECT = "calendar__day--select";
    var CLASS_CALENDAR_DAY_SELECT_START = "calendar__day--select-start";
    var CLASS_CALENDAR_DAY_SELECT_END = "calendar__day--select-end";
    var CLASS_CALENDAR_DAY_SELECT_NO_PAST = "calendar__day--select-lock";

    var MOMENT_F_MONTH = "MMMM, YYYY";

    var options = {}
    var elements = {}

    var calendar_moment = null;
    var today_moment = null;

    var locale_data = null;

    function initialise(container_selector, user_options) {
        var options_default = {
            date: '2012-12-21',
            format: 'YYYY-MM-DD',
            locale: 'en',
            highlights: [],
            blacklist: [],
            selected: {},
            lock: false
        }

        options = user_options;

        if (container_selector instanceof Element) {
            elements.wrapper = container_selector;
        } else {
            elements.wrapper =  document.querySelector(container_selector)
        }

        setOptionsFromDOM();

        // Extend defaults with user preference
        options = Object.assign({}, options_default, options);
        
        displayWarnings();

        options.moment.locale(options.locale);

        calendar_moment = options.moment(options.date, options.format);
        today_moment = options.moment();

        locale_data = calendar_moment.localeData();

        calendar_moment.startOf('month');

        mount();
        bindEvents();
    }

    function destroy() {
        elements.wrapper.innerHTML = '';
    }

    function mount(){
        var calendar_info, calendar_code;

        // Info
        var calendar_reset, calendar_select_start, calendar_select_end;

        // Code Header
        var calendar_header, calendar_month, calendar_nav_prev, calendar_nav_next;
        
        // Code Days
        var calendar_week_names, calendar_days;

        calendar_info = document.createElement('div')
        calendar_info.className = CLASS_CALENDAR_INFO;

        if (options.selected && options.selected.start) {
            calendar_info.style.display = "block";
        } else {
            calendar_info.style.display = "none";
        }

        calendar_code =document.createElement('div');

        if (options.lock) {
            calendar_code.className = CLASS_CALENDAR_CODE + " " + CLASS_CALENDAR_CODE_LOCK;
            calendar_code.addEventListener('click', removeLock);
        } else {
            calendar_code.className = CLASS_CALENDAR_CODE;
        }


        calendar_header =document.createElement('div');
        calendar_header.className = CLASS_CALENDAR_HEADER;
        
        calendar_month = document.createElement('span');
        calendar_month.className = CLASS_CALENDAR_MONTH;
        calendar_month.textContent = calendar_moment.format(MOMENT_F_MONTH);
        
        calendar_nav_prev = document.createElement('i');
        calendar_nav_prev.className = "fa fa-angle-left" + " " + CLASS_CALENDAR_NAV_PREV + " " + CLASS_CALENDAR_NAV;

        calendar_nav_next = document.createElement('i');
        calendar_nav_next.className = "fa fa-angle-right" + " " + CLASS_CALENDAR_NAV_NEXT + " " + CLASS_CALENDAR_NAV;

        calendar_header.appendChild(calendar_nav_prev)
        calendar_header.appendChild(calendar_month)
        calendar_header.appendChild(calendar_nav_next)

        calendar_week_names = document.createElement('div');
        calendar_week_names.className = CLASS_CALENDAR_WEEK_NAMES;

        var weekdays = [];

        for (var i = 1; i <= 6; i++) {
            var weekday;
            
            weekday = document.createElement("span");
            weekday.className = CLASS_CALENDAR_WEEKDAY;
            weekday.textContent = locale_data.weekdaysShort()[i];

            weekdays.push(weekday);
        }

        var sunday;
        
        sunday = document.createElement("span");
        sunday.className = CLASS_CALENDAR_WEEKDAY;
        sunday.textContent = locale_data.weekdaysShort()[0];

        if (locale_data.firstDayOfWeek() == 0) {
            weekdays.unshift(sunday)
        } else {
            weekdays.push(sunday);
        }

        weekdays.map(function(weekday){
            calendar_week_names.appendChild(weekday)
        });

        calendar_days = document.createElement("div");
        calendar_days.className = CLASS_CALENDAR_DAYS;

        calendar_moment.startOf('month');

        // Not always start of the month matches start of the week
        let offset = calendar_moment.isoWeekday() % (7 + locale_data.firstDayOfWeek());

        if (offset > 0) {
            for (var i = locale_data.firstDayOfWeek(); i < offset; i++) {
                calendar_days.appendChild(getDummyDay());
            }
        }

        var _calendar_year = calendar_moment.year();
        var _calendar_month = calendar_moment.month();
        var _calendar_days_in_month = calendar_moment.daysInMonth();

        for (var d = 1; d <= _calendar_days_in_month; d++) {
            var day, day_wrapper;

            day_wrapper = document.createElement("span");
            day_wrapper.className = CLASS_CALENDAR_DAY;

            day = document.createElement("day");

            day_wrapper.addEventListener('click', dayClick);

            if (calendar_moment.month() == _calendar_month) {
                day.textContent = d;

                if (calendar_moment.isSame(today_moment, "day")) {
                    day_wrapper.className =  day_wrapper.className + " " + CLASS_CALENDAR_DAY_TODAY;
                } else if (calendar_moment.isBefore(today_moment, "day")) {
                    day_wrapper.className =  day_wrapper.className + " " + CLASS_CALENDAR_DAY_EXP;
                } else if (options.highlights.indexOf(calendar_moment.format(options.format)) > -1) {
                    day_wrapper.className =  day_wrapper.className + " " + CLASS_CALENDAR_DAY_HIGHTLIGHT;
                } else if (options.blacklist.indexOf(calendar_moment.format(options.format)) > -1) {
                    day_wrapper.className = day_wrapper.className + " " + CLASS_CALENDAR_DAY_OFF;
                } 

                if (options.selected) {
                    if (options.selected && options.selected.start && !options.selected.end && calendar_moment.isBefore(options.selected.start, "day")) {
                        day_wrapper.className = day_wrapper.className + " " + CLASS_CALENDAR_DAY_SELECT_NO_PAST;
                    }

                    if (options.selected.start && calendar_moment.isSame(options.selected.start, 'day')) {
                        day_wrapper.className = day_wrapper.className + " " + CLASS_CALENDAR_DAY_SELECT_START + " " + CLASS_CALENDAR_DAY_SELECT;
                    }

                    if (options.selected.end && calendar_moment.isSame(options.selected.end, 'day')) {
                        day_wrapper.className = day_wrapper.className + " " + CLASS_CALENDAR_DAY_SELECT_END + " " + CLASS_CALENDAR_DAY_SELECT;
                    }

                    if (options.selected.start && options.selected.end && calendar_moment.isBetween(options.selected.start, options.selected.end, 'day')) {
                        day_wrapper.className = day_wrapper.className + " " + CLASS_CALENDAR_DAY_SELECT
                    }
                }
            } else {
                day.textContent = "-";
                day_wrapper.className =  day_wrapper.className + " " + CLASS_CALENDAR_DAY_DIFFERENT_MONTH;
            }
            
            day_wrapper.setAttribute("data-date", calendar_moment.format(options.format));
            day_wrapper.setAttribute("data-title", calendar_moment.format(options.format));

            day_wrapper.appendChild(day);
            calendar_days.appendChild(day_wrapper);

            calendar_moment.add(1, "d");
        }

         // set back fot future use
        calendar_moment.year(_calendar_year).month(_calendar_month);
        calendar_moment.startOf('month');

        // not all months end on the final day of a week
        if (calendar_moment.day() < 6 + locale_data.firstDayOfWeek()) {
            for (var i = 0; i < 6 + locale_data.firstDayOfWeek() - calendar_moment.day(); i++) {
            calendar_days.appendChild(getDummyDay());
            }
        }

        calendar_code.appendChild(calendar_header);
        calendar_code.appendChild(calendar_week_names);
        calendar_code.appendChild(calendar_days);

        calendar_select_start = document.createElement("span");
        calendar_select_end = document.createElement("span");
        calendar_reset= document.createElement("button");

        calendar_select_start.className = CLASS_CALENDAR_SELECT_START;
        calendar_select_end.className = CLASS_CALENDAR_SELECT_END;

        calendar_reset.className = CLASS_CALENDAR_RESET;
        calendar_reset.innerHTML = "<i class='fa fa-calendar-times'></i>";       

        calendar_info.appendChild(calendar_select_start);
        calendar_info.appendChild(document.createTextNode(" - "));
        calendar_info.appendChild(calendar_select_end);
        calendar_info.appendChild(calendar_reset);

        elements.wrapper.appendChild(calendar_info)
        elements.wrapper.appendChild(calendar_code);

        elements.calendar_select_start = calendar_select_start
        elements.calendar_select_end =  calendar_select_end
        elements.calendar_info =    calendar_info;
        elements.calendar_code =  calendar_code;
        elements.calendar_reset = calendar_reset;
        elements.calendar_nav_prev = calendar_nav_prev;
        elements.calendar_nav_next = calendar_nav_next;
    }

    function dayClick(e) {
        if (e.currentTarget.classList.contains(CLASS_CALENDAR_DAY_OFF)) return;
        if (e.currentTarget.classList.contains(CLASS_CALENDAR_DAY_EXP)) return;
        if (e.currentTarget.classList.contains(CLASS_CALENDAR_DAY_DIFFERENT_MONTH)) return;
        if (e.currentTarget.classList.contains(CLASS_CALENDAR_DAY_SELECT_NO_PAST)) return;

        var date = e.currentTarget.getAttribute("data-date");

       if ((typeof options.selected.start === "undefined" && typeof options.selected.end === "undefined" )
            || (options.selected.start && options.selected.end) ) {

           options.selected = {
               start: date
           }

           elements.wrapper.setAttribute("data-date-start", date);
       }  else {
           if (typeof options.selected.end === "undefined") {
                options.selected.end = date

            options.lock = true;

              elements.wrapper.setAttribute("data-date-end", date);

              elements.wrapper.dispatchEvent(
                  new CustomEvent("calendar-range",
                  {
                      detail: {
                        date_selected:  options.selected
                      }
                }))
           } else {
            options.lock = true;
           }
       }

       destroy()
       mount()
       bindEvents();

       elements.calendar_select_start.textContent = options.selected.start ? options.selected.start  : '';
       elements.calendar_select_end.textContent = options.selected.end ? options.selected.end : '';
    }

    function navNext(e) {
        console.log(calendar_moment)
        calendar_moment.add(1, 'month');

        destroy();
        mount()
        bindEvents();
    }


    function navPrev(e) {
        calendar_moment.subtract(1, 'month');

        destroy();
        mount()
        bindEvents();
    }

    function reset() {
        options.selected = {};
        options.lock = false; 

        destroy();
        mount()
        bindEvents();
    }

    function removeLock(e) {
        if (elements.calendar_code.classList.contains(CLASS_CALENDAR_CODE_LOCK)) {
            elements.calendar_code.classList.remove(CLASS_CALENDAR_CODE_LOCK);
            options.lock = false;
        }
    }

    function bindEvents() {
        elements.calendar_nav_next.addEventListener('click', navNext);
        elements.calendar_nav_prev.addEventListener('click', navPrev);
        elements.calendar_reset.addEventListener('click', reset);
    }

    function displayWarnings() {
        if(typeof options.moment === "undefined"){
             showError('warn', 'momentjs not found');
         }

         if(typeof options.$ === "undefined"){
            showError('warn', 'jquery not found');
        }

        if (!options.moment(options.date, options.format).isValid()) {
            showError('warn', 'date is not valid');
        }
    }

    function getDummyDay() {
        var dummy_day, dummy_day_wrapper;
                
        dummy_day_wrapper = document.createElement('span');
        dummy_day_wrapper.className = CLASS_CALENDAR_DAY + " " + CLASS_CALENDAR_DAY_DIFFERENT_MONTH;

        dummy_day = document.createElement("day");
        dummy_day.textContent = "-";

        dummy_day_wrapper.appendChild(dummy_day);

        return dummy_day_wrapper;
    }

    /**
    * Setting options from DOM elements if they are not provided.
    */
    function setOptionsFromDOM(){
        if (typeof options === "undefined") options = {}

        //no date option? Checking for them in the DOM attributes
        if(!options.date && elements.wrapper.hasAttribute('data-date')){
            console.log('date')
            options.date = elements.wrapper.getAttribute('data-date');
        }

        //no date format? Checking for them in the DOM attributes
        if(!options.format && elements.wrapper.hasAttribute('data-format')){
            options.format = elements.wrapper.getAttribute('data-format');
        }

        //no locale? Checking for them in the DOM attributes
        if(!options.locale && elements.wrapper.hasAttribute('data-locale')){
            options.locale = elements.wrapper.getAttribute('data-locale');
        }

        console.log(options)
    }

    //utils
    /**
    * Shows a message in the console of the given type.
    */
   function showError(type, text){
        window.console && window.console[type] && window.console[type]('calendar: ' + text);
    }

    window.calendar_utils = {
        showError: showError
    }

    return initialise;
});


/**
 * jQuery adapter for calendar
 */
if(window.jQuery && window.calendar && window.moment){
    (function ($, calendar, moment) {
        'use strict';

        // No jQuery No Go
        if (!$ || !calendar) {
            window.calendar_utils.showError('error', 'jQuery is required to use the jQuery calendar adapter!');
            return;
        }

        // No momentjs No Go
        if (!$ || !moment) {
            window.calendar_utils.showError('error', 'momentjs is required to use the jQuery calendar adapter!');
            return;
        }

        $.fn.calendar = function(options) {
            options = $.extend({}, options, {'$': $, moment: moment});
            new calendar(this[0], options);
        };
    })(window.jQuery, window.calendar, window.moment);
}
