var moment = require('moment');
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


        /**
         * Get summ of all passengers
         * @returns {*}
         */
        self.getPassengersSum = function () {
            var sum = Object.values(self.formData.passengers).reduce(function (pv, cv) {
                return parseInt(pv) + parseInt(cv);
            }, 0);
            if (isNaN(sum)) {
                sum = 0;
            }
            return sum;
        };


        this.$onInit = function () {
            if (self.params.lang !== undefined) {
                self.lang = self.params.lang;
            }
            console.log(self.formData);
            self.formData.originData = 'ROV';
            self.formData.destinationData = 'MOW';

            // fetchUserLocation();
            // getCityById('ROV').then(function (cityInfo) {
            //     console.log(cityInfo);
            //
            // });

        };


        self.passengersActive = false;
        self.passengersToggle = function () {
            self.passengersActive = !self.passengersActive;
        };


        self.popups = {
            rangeStart: createDatepickerPopup('rangeStart'),
            rangeEnd: createDatepickerPopup('rangeEnd')
        };

        /**
         * Create datepicker popup
         * @param id
         * @returns {*}
         */
        function createDatepickerPopup(id) {
            if (document.querySelector('#' + id) !== undefined) {
                var elem = angular.element(document.querySelector('#' + id));



                return $popover($(elem).parent(), {
                    template: require('./templates/datepicker-popup.html'),
                    trigger: 'manual',
                    autoClose: true,
                    placement: 'bottom-left',
                    container: 'body',
                    scope: $scope
                });
            }
            return null;
        }

        self.showPopupById = function (id) {
            self.popups[id].show();
        };


        self.startDateOnSetTime = function () {
            if (self.dates.rangeEnd === null) {
                self.showPopupById('rangeEnd');
            }
            self.popups.rangeStart.hide();
        };

        self.endDateOnSetTime = function () {
            self.popups.rangeEnd.hide();
        };

        self.startDateBeforeRender = function ($dates) {
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
        };

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

        self.endDateBeforeRender = function ($view, $dates) {
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
}).component('passengersValue', {
    template: require('./templates/passengers-age-select.html'),
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
        date: '=',
        showPopup: '&',
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