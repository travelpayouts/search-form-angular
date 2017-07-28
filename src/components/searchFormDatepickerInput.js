var moment = require('moment');
require('moment/locale/ru');

module.exports = angular.module('glook.travelPayoutsSearchComponent').component('searchFormDatepickerInput', {
    template: require('../templates/datepicker-input.html'),
    bindings: {
        dates: '=',
        showPopup: '&',
        label: '<',
        key: '<'

    },
    controller: function ($scope, $element, $popover) {
        var el = $element;
        var self = this;


        self.pickerParams = {
            options: {startView: 'day', minView: 'day'}
        };
        self.$onInit = function () {
            self.date = self.dates[self.key];
            self.pickerParams.model = self.dates[self.key];
            var dateParams;
            if (self.key === 'rangeStart') {
                dateParams = {
                    onSet: startRangeSetTime,
                    beforeRender: startRangeRender,
                    showCancel: false
                };
            } else {
                dateParams = {
                    onSet: endRangeSetTime,
                    beforeRender: endRangeRender,
                    showCancel: true
                };
            }
            angular.extend(self.pickerParams, dateParams)
        };

        self.popover = {
            show: false,
            el: $popover(el, {
                template: require('../templates/datepicker-popover.html'),
                autoClose: true,
                placement: 'bottom-left',
                container: 'body',
                trigger: 'manual',
                scope: $scope,
            }),
            toggle: function () {
                this.show = !this.show;
                return this.el.toggle();
            }
        };

        function startRangeSetTime() {
            if (self.dates.rangeEnd === null) {
                // self.showPopupById('rangeEnd');
            }
            self.popover.el.hide();
        }

        function endRangeSetTime() {
            self.popover.el.hide();
        }

        function startRangeRender($view, $dates) {
            setRange($dates);
            // Set min date
            $dates.filter(function (date) {
                return date.localDateValue() < moment().subtract(1, 'day').valueOf();
            }).forEach(function (date) {
                date.selectable = false;
            });

            if (self.dates.rangeEnd && self.dates.rangeStart) {
                var activeDate = moment(self.dates.rangeEnd);

                $dates.filter(function (date) {
                    return date.localDateValue() >= activeDate.valueOf()
                }).forEach(function (date) {
                    date.selectable = false;
                })
            }
        }

        function endRangeRender($view, $dates) {
            setRange($dates);
            // Set min date
            $dates.filter(function (date) {
                return date.localDateValue() < moment().valueOf();
            }).forEach(function (date) {
                date.selectable = false;
            });

            if (self.dates.rangeStart) {
                var activeDate = moment(self.dates.rangeStart).subtract(1, $view).add(1, 'minute');

                $dates.filter(function (date) {
                    return date.localDateValue() <= activeDate.valueOf()
                }).forEach(function (date) {
                    date.selectable = false;
                })
            }
        }

        /**
         * Mark all values between start and end as range as range
         * @param dates
         */
        function setRange(dates) {
            if (self.dates.rangeStart && self.dates.rangeEnd) {
                var rangeStart = moment(self.dates.rangeStart);
                var rangeEnd = moment(self.dates.rangeEnd);
                var rangeDates = dates.filter(function (date) {
                    return date.localDateValue() >= rangeStart.valueOf() && date.localDateValue() <= rangeEnd.valueOf();
                });
                rangeDates.forEach(function (date, key) {
                    var thisDate = moment(date.localDateValue());

                    // Getting start and End range value
                    switch (thisDate.format('"MM-DD-YYYY"')) {
                        case rangeStart.format('"MM-DD-YYYY"'):
                            date.rangeStart = true;
                            break;
                        case rangeEnd.format('"MM-DD-YYYY"'):
                            date.rangeEnd = true;
                            break
                    }

                    // Set all values between start and end as range
                    date.range = true;
                })
            }
        }

    }
});