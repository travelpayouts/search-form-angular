require('moment/locale/ru');
var pick = require('lodash/pick');

module.exports = angular.module('glook.travelPayoutsSearchComponent').component('searchForm', {
    template: require('../templates/searchFormComponent.html'),
    bindings: {
        formData: '=',
        searchUrl: '<',
        lang: '<',
        onSubmit: '&'
    },
    controller: function ($scope, translateFactory, $timeout, $filter) {
        var self = this;
        self.data = {};

        self.translate = function (input) {
            return $filter('translate')(input);
        };

        self.prepareData = function () {
            var data = angular.copy(self.data);
            var cities = pick(data, ['origin', 'destination']);
            var dates = pick(data, ['depart_date', 'return_date']);

            angular.forEach(cities, function (value, key) {
                if (typeof value === 'object') {
                    data[key] = value.obj.code;
                }
            });

            angular.forEach(dates, function (value, key) {
                if (value !== null) {
                    // data[key] = value.obj.code;
                    data[key] = moment(value).format("YYYY-MM-DD");
                }
            });

            angular.forEach(data, function (value, key) {
                if (value !== null) {
                    data[key] = value.toString();

                }
            });

            return data;
        };

        self.submit = function () {
            self.formData = self.prepareData();
            $timeout(function () {
                self.onSubmit();
            }, 100);
        };

        self.$onInit = function () {
            translateFactory.setLocale(self.lang);
            self.data = self.formData;
            moment.locale(self.lang);
        };

        self.$onChanges = function (changes) {
            if (changes.searchUrl !== undefined) {
                self.data = angular.copy(self.formData);
                console.log('newSearch');
                $scope.$broadcast('newSearch');
            }
            if (changes.lang !== undefined) {
                translateFactory.setLocale(changes.lang.currentValue);
                moment.locale(self.lang);
            }
        };


    }
});