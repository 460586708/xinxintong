define(['require'], function() {
	'use strict';
	var ngApp = angular.module('app', ['ngRoute', 'ui.tms', 'ui.xxt']);
	ngApp.config(['$routeProvider', '$locationProvider', '$controllerProvider', function($routeProvider, $locationProvider, $controllerProvider) {
		var RouteParam = function(name) {
			var baseURL = '/views/default/pl/fe/template/';
			this.templateUrl = baseURL + name + '.html?_=' + (new Date() * 1);
			this.controller = 'ctrl' + name[0].toUpperCase() + name.substr(1);
			this.resolve = {
				load: function($q) {
					var defer = $q.defer();
					require([baseURL + name + '.js'], function() {
						defer.resolve();
					});
					return defer.promise;
				}
			};
		};
		ngApp.provider = {
			controller: $controllerProvider.register
		};
		$routeProvider
			.when('/rest/pl/fe/template/shop/show', new RouteParam('show'))
			.otherwise(new RouteParam('shop'));

		$locationProvider.html5Mode(true);
	}]);
	ngApp.controller('ctrlTemplate', ['$scope', '$location', 'http2', function($scope, $location, http2) {
		$scope.siteId = $location.search().site;
	}]);
	/***/
	require(['domReady!'], function(document) {
		angular.bootstrap(document, ["app"]);
	});
	/***/
	return ngApp;
});