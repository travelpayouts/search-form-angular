module.exports = angular.module('glook.travelPayoutsSearchComponent').component('passengers', {
    template: require('../templates/passengers.html'),
    bindings: {
        passengers: '=',
        tripClass: '='
    },
    require: {
        parent: '^^searchForm'
    },
    controller: function ($element, $popover, $scope,$filter) {
        var el = $element;
        var self = this;
        self.active = false;
        self.toggle = function () {
            self.active = !self.active;
        };

        self.$onInit = function () {
            if (self.passengers === undefined) {

                self.passengers = {
                    adults: 1,
                    children: 0,
                    infants: 0
                };
                self.tripClass = 0;
            } else {

            }
        }
        $popover(el, {
            template: require('../templates/passengers-dropdown.html'),
            autoClose: 1,
            onShow: self.toggle,
            onHide: self.toggle,
            placement: 'bottom-left',
            container: 'body',
            trigger: 'click',
            scope: $scope
        });

        self.getTripClass = function (tripClass) {
            var tripClasses = [
                'avia_passengers_economy_class',
                'avia_passengers_business_class'
            ];
            return self.parent.translate(tripClasses[tripClass]);
        };

        self.passengersPlural = function () {
            var result = $filter('plural')(
                self.getSum(),
                'avia_passengers_caption_1',
                'avia_passengers_caption_2',
                'avia_passengers_caption_5'
            );
            return self.parent.translate(result);
        };

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
});