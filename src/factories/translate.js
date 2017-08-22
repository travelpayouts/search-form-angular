module.exports = angular.module('glook.travelPayoutsSearchComponent').factory('translateFactory', function () {
    var messages = {
        'en': require('../messages/en'),
        'ru': require('../messages/ru')
    };
    return {
        locale: 'en',
        setLocale: function (locale) {
            if (messages[locale] !== undefined) {
                this.locale = locale;
            }
        },
        getTranslate: function (message, locale) {
            var self = this;
            if (messages[locale] === undefined) {
                locale = 'en';
            }

            if (messages[self.locale][message] !== undefined) {
                return messages[self.locale][message];
            }
            return false;
        }


    };

}).filter('translate', function (translateFactory, $sce) {
    function translateFilter(input) {
        var message = translateFactory.getTranslate(input);
        return $sce.trustAsHtml(message);
    }
    return translateFilter;
}).filter('plural', function () {
    return function (number, str1, str2, str3) {

        number = Math.abs(number);
        number %= 100;
        if (number >= 5 && number <= 20) {
            return str3;
        }
        number %= 10;
        if (number === 1) {
            return str1;
        }
        if (number >= 2 && number <= 4) {
            return str2;
        }
        return str3;

    }
});