require('moment/locale/ru');
var pick = require('lodash/pick');

module.exports = angular.module('glook.travelPayoutsSearchComponent').component('searchForm', {
    template: require('../templates/searchFormComponent.html'),
    bindings: {
        formData: '=',
        params: '=',
        lang: '<',
    },
    controller: function ($scope, translateFactory, $timeout, $filter) {
        var self = this;

        self.translate = function (input) {
            return $filter('translate')(input);
        };


        self.submit = function () {
            var data = angular.copy(self.formData);
            var cities = pick(data, ['origin', 'destination']);
            var dates = pick(data, ['depart_date', 'return_date']);

            angular.forEach(cities, function (value, key) {
                if (typeof value === 'object') {
                    data[key] = value.obj.code;
                }
            });

            angular.forEach(dates, function (value, key) {
                if (value != null) {
                    // data[key] = value.obj.code;
                    data[key] = moment(value).format("DD-MM-YYYY");
                }
            });

        };

        self.$onInit = function () {
            translateFactory.setLocale(self.lang);
            moment.locale(self.lang);
        };

        self.$onChanges = function (changes) {
            if (changes.lang !== undefined) {
                translateFactory.setLocale(changes.lang.currentValue);
                moment.locale(self.lang);
            }
        };


    }
});