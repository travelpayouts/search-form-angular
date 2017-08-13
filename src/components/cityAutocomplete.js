 // Using filter polyfill
var filter = require('array-filter');

module.exports = angular.module('glook.travelPayoutsSearchComponent').component('cityAutocomplete', {
    template: require('../templates/city-autocomplete.html'),
    bindings: {
        value: '=',
        label: '=',
        key: '<'
    },
    require: {
        parent: '^^searchForm'
    },
    controller: function ($http, $scope, $sce, $q, $interpolate, $timeout, translateFactory) {
        var self = this;
        self.typedValue = '';

        /**
         * Get city info by user location
         */
        function fetchUserLocation() {
            return $http({
                method: 'GET',
                url: 'https://www.travelpayouts.com/whereami',
                params: {locale: translateFactory.locale}
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
                    locale: translateFactory.locale,
                    with_countries: false,
                    q: query
                }
            });
        }

        function suggest(term) {
            var deferred = $q.defer();
            autoCompleteRequest(term).then(function (response) {
                var results = [];
                angular.forEach(response.data, function (suggestion) {
                    // new scope for current suggestion
                    var suggestionScope = $scope.$new(true);
                    if(suggestion.name === null){
                        suggestion.name = self.parent.translate('avia_all_airports_caption');
                    }
                    suggestionScope.suggestion = suggestion;
                    // Complile template to html string
                    var suggestionLabel = $interpolate(require('../templates/autocomplete-suggestion.html'))(suggestionScope);
                    results.push({
                        value: suggestion.city_name,
                        obj: suggestion,
                        label: $sce.trustAsHtml(suggestionLabel)
                    });
                });
                deferred.resolve(results);
            });
            return deferred.promise;
        };

        self.newValue = {};

        self.onChange = function (query) {
            if (self.value !== undefined && query !== self.value.value) {
                self.value = {};
            }
        };

        self.options = {
            suggest: suggest,
            on_select: function (selected) {
                self.value = selected;
            },
        };

        self.initValues = function () {
            if (self.value !== undefined && typeof self.value === 'string') {
                getCityById(self.value).then(function (cityInfo) {
                    self.typedValue = cityInfo.city_name;
                    self.value = {
                        title: cityInfo.city_name,
                        obj: cityInfo
                    };
                });
            } else {
                if (self.key !== undefined && self.key === 'origin') {
                    /**
                     * Set default origin by user location
                     */
                    fetchUserLocation().then(function (cityInfo) {
                        self.typedValue = cityInfo.data.name;
                        self.value = {
                            title: cityInfo.data.name,
                            obj: {
                                code: cityInfo.data.iata,
                                country_name: cityInfo.data.country_name,
                                city_name: cityInfo.data.name,
                            }
                        };
                    });

                }
            }
        };

        self.$onChanges = function (changes) {
            if (self.value !== undefined && typeof self.value !== 'string') {
                getCityById(self.value.obj.code).then(function (cityInfo) {
                    self.typedValue = cityInfo.city_name;
                    self.value = {
                        title: cityInfo.city_name,
                        obj: cityInfo
                    };
                });
            }
        };

        self.$onInit = function () {
            self.initValues();
        };

        $scope.$on('newSearch', function () {
            $timeout(function () {
                self.initValues();
            }, 200);
        });
    }
});