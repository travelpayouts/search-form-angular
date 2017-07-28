module.exports = angular.module('glook.travelPayoutsSearchComponent').component('passengers', {
    template: require('../templates/passengers.html'),
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
            template: require('../templates/passengers-dropdown.html'),
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
});