require('moment/locale/ru');
module.exports = angular.module('glook.travelPayoutsSearchComponent').component('searchForm', {
    template: require('../templates/searchFormComponent.html'),
    bindings: {
        formData: '=',
        params: '=',
        lang: '<',
    },
    controller: function ($scope, translateFactory, $timeout,$filter) {
        var self = this;


        self.formData = {
            origin: '',
            destination: '',
            passengers: {
                adults: 1,
                children: 0,
                infants: 0,
            },
            trip_class: 0,
            depart_date: null,
            return_date: null,
            _origin_code: '',
            _destination_code: ''
        };

        self.translate = function(input) {
            return $filter('translate')(input);
        };

        this.$onInit = function () {
            translateFactory.setLocale(self.lang);
            moment.locale(self.lang);
        };

        this.$onChanges = function (changes) {
            if (changes.lang !== undefined) {
                translateFactory.setLocale(changes.lang.currentValue);
                moment.locale(self.lang);
            }
        };


    }
});