# TavoCalendar

Display calendar and pick dates (singular or range).

## Setup

**HTML**
```html

<div class="calendar"></div>
```
**JS**
```js
const options = {
    date: '2019-12-21'
}

const my_calendar = new TavoCalendar('.calendar', options);
```

**Available options:**

* `format` (*optional*) -- defaults to `YYYY-MM-DD`
* `locale` (*optional*) -- display of weekday names, month  (defaults `en`)
* `date` (*optional*) -- calendar focus date (defaults to absolute date),
* `date_start` (*optional*) -- range end date (defaults to `null`),
* `date_end` (*optional*) -- range start date (defaults to `null`),
* `selected` (*optional*) -- mark dates selected (defaults to `[]`) 
* `highlight` (*optional*) -- special dates (defaults to `[]`) 
* `blacklist` (*optional*) -- disable dates (defaults to `[]`) 
* `range_select` (*optional*) -- range select mode (defaults to `false`)
* `multi_select` (*optional*) -- mltiple date mode (defaults to `false`)
* `future_select` (*optional*) -- disable selecting days after `date` (defaults to `true`)
* `past_select` (*optional*) -- disable selecting days before `date` (defaults to `false`)
* `frozen` (*optional*) -- disable all interactions (defaults to `false`)
* `highligh_sunday` (*optional*) -- highlight sundays (defaults to `true`)

**Available methods**

* `getSelected()` -- returns an array of selected dates (in multiselect mode) or single
* `getStartDate()` -- range start
* `getEndDate()` -- range end
* `getRange()` - range object { start: '2012-12-10', end: '2012-12-15'}
* `getFocusYear()` -- calendar focus year
* `getFocusMonth()` -- calendar focus month
* `getFocusDay()` -- calendar focus day
* `getConfig()` - current config object
* `getState()` - current state object
* `sync(obj)` -- sync two or more calendars `calendarA.sync({ config: calendarB.getConfig(), state: calendarB.getState() })`

**Events**

* `calendar-change` -- fired when month changes
* `calendar-range` -- fired on day change
* `calendar-select` -- fired on day change
* `calendar-reset` -- fired on range reset

## Example

Select range from future date.

```js
const options = {
    range_select: true
}

const calendar_el = document.querySelector('.calendar');

const my_calendar = new TavoCalendar(calendar_el, options)

calendar_el.addEventListener('calendar-range', (ev) => {
    const range = my_calendar.getRange();

    console.log('Start', range.start)
    console.log('End', range.end)
});
```

## Depends on:

* [moment](https://github.com/moment/moment/)

## Todo

* `setSelected()` -- given an array of dates select them in calendar
* `setStartDate()` -- range select start
* `setEndDate()` -- range select end
* `setRange()` - set range object { start: '2012-12-10', end: '2012-12-15'}
* `setFocusYear()` -- set calendar focus year
* `setFocusMonth()` -- set calendar focus month
* `setFocusDay()` -- set calendar focus day
* `setConfig()` - set current config object
* `setState()` - set current state object