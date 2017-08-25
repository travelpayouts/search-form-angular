# tp-ng-search
A simple component which helps you integrate [TravelPayouts](https://www.travelpayouts.com/) search form into your angularjs app. **[Demo](https://rawgit.com/travelpayouts/search-form-angular/master/demo.html)**.

## Installation
1. You can install this component via bower, npm or clone this repository into your project folder.
	*  via [Bower](http://bower.io/): by running `$ bower install tp-ng-search` from your terminal
	*  via [npm](https://www.npmjs.org/): by running `$ npm install tp-ng-search` from your terminal

2. Include scripts on your page:

	```
	<!doctype html>
	<html ng-app="myApp">
	<head>
	  <link rel="stylesheet" href="/bower_components/tp-ng-search/dist/tpSearchComponent.styles.css">
	</head>
	<body>   
		...
	    <script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.5/
	    <script src="/bower_components/tp-ng-search/dist/tpSearchComponent.js"></script>
	    <script>
	        var myApp = angular.module('myApp', ['glook.travelPayoutsSearchComponent']);
	    </script>
	    ...
	</body>
	</html>
	```
	
	2.1. Or just include it using [webpack](https://webpack.js.org/):
	
	```
		
	//require stylesheets
	require('tp-ng-search/dist/tpSearchComponent.styles.css');
	// seting app dependencies
	var app = angular.module('myApp', [
		require('tp-ng-search')
	]);
		
	```
	  	
3. Set object with searching data and callback function on your controller:

  	```
  	// You can set initial params or pass empty object via $scope.formData = {};
  	 $scope.formData = {
                    origin: 'MOW',
                    destination: 'NYC',
                    adults: 1,
                    children: 2,
                    infants: 3
                };
                
    // Don't forget to set callback function
     $scope.submit = function () {
                    var data = JSON.stringify($scope.formData);
                    alert('Form data:' + data);
        			};	
  	```
4. Pass component to your controller template:
		```<search-form lang="en" form-data="formData" on-submit="submit()"></search-form>```

