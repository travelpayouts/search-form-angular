module.exports = angular.module('glook.travelPayoutsSearchComponent').component('cityAutocomplete', {
    template: require('../templates/city-autocomplete.html'),
    bindings: {
        value: '=',
        label: '<'
    },
    controller: function ($http, $scope, $sce, $q, $interpolate) {
        var self = this;
        self.lang = 'ru';
        self.typedValue = '';

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

        function suggest(term) {
            var deferred = $q.defer();
            autoCompleteRequest(term).then(function (response) {
                var results = [];
                angular.forEach(response.data, function (suggestion) {
                    // new scope for current suggestion
                    var suggestionScope = $scope.$new(true);
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
            if (query !== self.newValue.value) {
                self.newValue = {};
            }
        };

        self.options = {
            suggest: suggest,
            on_select: function (selected) {
                self.newValue = selected;
            },
        };
    }
});