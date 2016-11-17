var app = angular.module('starter.directives', []);

//Esta directiva es FUNDAMENTAL ya que los ng-click o ng-submit se estaban haciendo 2 veces a causa del ngMaterial
app.directive('myclick', function() {
    return function(scope, element, attrs) {
        element.bind('touchstart click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            scope.$apply(attrs['myclick']);
        });
    };
});
app.controller('Main', function ($scope) {

    $scope.anything = function() {

        alert('Anything');
    };
});