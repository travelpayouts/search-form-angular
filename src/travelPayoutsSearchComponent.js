var angular = require('angular');
// Using filter polyfill
var filter = require('array-filter');
require('bootstrap-additions/dist/modules/popover.css');
require('angular-strap/dist/modules/compiler');
require('angular-strap/dist/modules/dimensions');
require('angular-strap/dist/modules/tooltip');
require('angular-strap/dist/modules/tooltip.tpl');
require('angular-strap/dist/modules/popover');
require('angular-strap/dist/modules/popover.tpl');

function requireAll(r) {
    r.keys().forEach(r);
}

angular.module('glook.travelPayoutsSearchComponent', [
    require('angular-sanitize'),
    require('oi.select'),
    require('angular-bootstrap-datetimepicker'),
    'mgcrea.ngStrap.core',
    'mgcrea.ngStrap.helpers.dimensions',
    'mgcrea.ngStrap.tooltip',
    'mgcrea.ngStrap.popover',
]).run(['$templateCache', function ($templateCache) {
    $templateCache.put('templates/datetimepicker.html', require('./templates/datepicker.html'));
}]);

requireAll(require.context('./components/', true, /\.js$/));
requireAll(require.context('./directives/', true, /\.js$/));

module.exports = 'glook.travelPayoutsSearchComponent';