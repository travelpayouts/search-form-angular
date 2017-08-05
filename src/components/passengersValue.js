module.exports = angular.module('glook.travelPayoutsSearchComponent').component('passengersValue', {
    template: require('../templates/passengers-age-select.html'),
    bindings: {
        field: '@',
        passengers: '=',
        value: '='
    },
    controller: function ($scope) {
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
            $scope.$emit('updatePassengers');
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
            $scope.$emit('updatePassengers');
        };

    }
});