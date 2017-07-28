var moment = require('moment');
var angular = require('angular');
// Using filter polyfill
var filter = require('array-filter');
require('moment/locale/ru');

require('bootstrap-additions/dist/modules/popover.css');
require('angular-strap/dist/modules/compiler');
require('angular-strap/dist/modules/dimensions');
require('angular-strap/dist/modules/tooltip');
require('angular-strap/dist/modules/tooltip.tpl');
require('angular-strap/dist/modules/popover');
require('angular-strap/dist/modules/popover.tpl');

angular.module('glook.travelPayoutsSearchComponent', [
    require('angular-sanitize'),
    require('oi.select'),
    require('angular-bootstrap-datetimepicker'),
    'mgcrea.ngStrap.core',
    'mgcrea.ngStrap.helpers.dimensions',
    'mgcrea.ngStrap.tooltip',
    'mgcrea.ngStrap.popover',
]).component('searchForm', {
    template: require('./templates/searchFormComponent.html'),
    bindings: {
        formData: '=',
        params: '='
    },
    controller: function ($scope, $popover, $http, $timeout) {
        var self = this;

        //default language
        self.lang = 'en';


        self.dates = {
            rangeStart: null,
            rangeEnd: null
        };

        self.formData = {
            origin: '',
            destination: '',
            passengers: {
                adults: 1,
                children: 0,
                infants: 0,
            },
            trip_class: 0,
            depart_date: '',
            return_date: '',
            _origin_code: '',
            _destination_code: ''
        };


        Object.defineProperty(self.formData, "originData", {
            get: function () {
                return this._origin_code;
            },
            set: function (id) {
                var self = this;
                getCityById(id).then(function (result) {
                    self.origin = result;
                })
            }
        });
        Object.defineProperty(self.formData, "destinationData", {
            get: function () {
                return this._destination_code;
            },
            set: function (id) {
                var self = this;
                getCityById(id).then(function (result) {
                    self.destination = result;
                })
            }
        });


        this.$onInit = function () {
            if (self.params.lang !== undefined) {
                self.lang = self.params.lang;
            }
            self.formData.originData = 'ROV';
            self.formData.destinationData = 'MOW';

            // fetchUserLocation();
            // getCityById('ROV').then(function (cityInfo) {
            //     console.log(cityInfo);
            //
            // });

        };


        /**
         * Get city info by user location
         */
        function fetchUserLocation() {
            $http({
                method: 'GET',
                url: 'https://www.travelpayouts.com/whereami',
                params: {locale: self.lang}
            }).then(function successCallback(response) {
                return response.data;
            }, function errorCallback(response) {
                return false;
            });
        }

        /**
         * Get city info by IATA code
         * @param id
         */
        function getCityById(id) {
            return $http({
                method: 'GET',
                url: 'https://autocomplete.travelpayouts.com/jravia',
                params: {
                    locale: self.lang,
                    with_countries: false,
                    q: id
                }
            }).then(function successCallback(response) {
                var filteredData = filter(response.data, function (el, i, arr) {
                    return ('code' in el && el.code === id);
                });
                if (filteredData.length > 0) {
                    return filteredData[0];
                }
                return false;
            }, function errorCallback(response) {
                return false;
            });
        }

    }
}).component('passengers', {
    template: require('./templates/passengers.html'),
    bindings: {
        passengers: '=',
        tripClass: '='
    },
    controller: function ($element, $popover, $scope) {
        var el = $element;
        var self = this;
        self.active = false;
        self.toggle = function () {
            self.active = !self.active;
        };
        $popover(el, {
            template: require('./templates/passengers-dropdown.html'),
            autoClose: 1,
            onShow: self.toggle,
            onHide: self.toggle,
            placement: 'bottom-left',
            container: 'body',
            trigger: 'click',
            scope: $scope
        });

        /**
         * Get sum of all passengers
         * @returns {*}
         */
        self.getSum = function () {
            var sum = Object.values(self.passengers).reduce(function (pv, cv) {
                return parseInt(pv) + parseInt(cv);
            }, 0);
            if (isNaN(sum)) {
                sum = 0;
            }
            return sum;
        };


    }
}).component('passengersValue', {
    template: require('./templates/passengers-age-select.html'),
    require: '^passengers',
    bindings: {
        field: '@',
        passengers: '=',
        value: '='
    },
    controller: function () {
        var self = this;

        getPassengersSum = function () {
            var sum = Object.values(self.passengers).reduce(function (pv, cv) {
                return parseInt(pv) + parseInt(cv);
            }, 0);
            if (isNaN(sum)) {
                sum = 0;
            }
            return sum;
        };

        getMaxInfants = function () {
            var sum = Object.values([self.passengers.adults, self.passengers.children]).reduce(function (pv, cv) {
                return parseInt(pv) + parseInt(cv);
            }, 0);
            if (isNaN(sum)) {
                sum = 0;
            }
            return sum;
        };

        self.add = function () {
            if ((self.field === 'adults' || self.field === 'children') && getPassengersSum() < 9) { // max 9 passengers (adults+children)
                self.value++;
            }
            if (self.field === 'infants' && self.value < getMaxInfants() && getPassengersSum() < 9) { // max infants = current adults
                self.value++;
            }
        };

        self.remove = function () {
            var value = self.value;
            if (value > 0) {
                // Don't allow decrementing adultrs below 1
                if ((self.field === 'adults') && value === 1) {
                    return false;
                }
                self.value--;
                self.passengers[self.field] = self.value;
                if (self.field !== 'infants' && getMaxInfants() < self.passengers.infants) { // correct infants count when decrementing adults count
                    self.passengers.infants = getMaxInfants();
                }
            } else {
                self.value = 0;
            }
        };

    }
}).component('searchFormDatepickerInput', {
    template: require('./templates/datepicker-input.html'),
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
                template: require('./templates/datepicker-popup.html'),
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

        function setRange(dates) {
            if (self.dates.rangeStart && self.dates.rangeEnd) {
                var rangeStart = moment(self.dates.rangeStart);
                var rangeEnd = moment(self.dates.rangeEnd);
                var rangeDates = dates.filter(function (date) {
                    return date.localDateValue() >= rangeStart.valueOf() && date.localDateValue() <= rangeEnd.valueOf();
                });
                rangeDates.forEach(function (date, key) {
                    if (key === 0) {
                        date.rangeStart = true;
                    } else if (key === rangeDates.length - 1) {
                        date.rangeEnd = true;
                    }
                    date.range = true;
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
    }
}).directive('searchFormSelectInput', ['$window', function ($window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('click', function () {
                var input = $(element).find(document.getElementsByTagName('input'));
                if (!$window.getSelection().toString()) {
                    // Required for mobile Safari
                    $(input[0]).focus();
                    input[0].setSelectionRange(0, input[0].value.length)
                }
            });
        }
    };
}]).run(['$templateCache', function ($templateCache) {
    $templateCache.put('templates/datetimepicker.html', require('./templates/datepicker.html'));
}]);

module.exports = 'glook.travelPayoutsSearchComponent';