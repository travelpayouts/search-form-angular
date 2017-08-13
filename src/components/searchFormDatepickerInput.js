module.exports = angular.module('glook.travelPayoutsSearchComponent').component('searchFormDatepickerInput', {
    template: require('../templates/datepicker-input.html'),
    bindings: {
        dates: '=',
        value: '=',
        showPopup: '&',
        label: '<',
        key: '<'

    },
    require: {
        parent: '^^searchForm'
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
            if (self.value !== undefined && typeof self.value === 'string') {
                self.value = moment(self.value, "YYYY-MM-DD").valueOf();
            }
            // Set default min value
            if (self.value === undefined && self.key === 'rangeStart') {
                self.value = moment().startOf('day').valueOf();
            }

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
                // container: 'body',
                trigger: 'manual',
                scope: $scope,
            }),
            toggle: function () {
                this.show = !this.show;
                return this.el.toggle();
            }
        };

        function startRangeSetTime() {
            if (self.dates.return_date === null) {
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

            if (self.dates.return_date && self.dates.depart_date) {
                var activeDate = moment(self.dates.return_date);

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

            if (self.dates.depart_date) {
                var activeDate = moment(self.dates.depart_date).subtract(1, $view).add(1, 'minute');

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
            if (self.dates.depart_date && self.dates.return_date) {
                var rangeStart = moment(self.dates.depart_date);
                var rangeEnd = moment(self.dates.return_date);
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