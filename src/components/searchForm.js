module.exports = angular.module('glook.travelPayoutsSearchComponent').component('searchForm', {
    template: require('../templates/searchFormComponent.html'),
    bindings: {
        formData: '=',
        params: '='
    },
    controller: function ($scope, $popover, $http, $timeout) {
        var self = this;

        //default language
        self.lang = 'en';


        self.dates = {
            rangeStart: "2017-07-29T21:00:00.000Z",
            rangeEnd: "2017-08-20T21:00:00.000Z"
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
            return autoCompleteRequest(id).then(function successCallback(response) {
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

        /**
         *
         * @param query
         * @returns {*}
         */
        function autoCompleteRequest(query) {
            return $http({
                method: 'GET',
                url: 'https://autocomplete.travelpayouts.com/jravia',
                params: {
                    locale: self.lang,
                    with_countries: false,
                    q: query
                }
            });
        }

    }
});