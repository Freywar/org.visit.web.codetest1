angular.module('TeknovisioDemo').directive('uibSelect', function() {
  return {
    restrict: 'E',
    require: '^ngModel',
    scope: {
      ngModel: '=',
      uibOptions: '=',
      ngChange: '&'
    },
    link: function(scope, element, attrs) {
      element.on('click', function(event) {
        event.preventDefault();
      });


      scope.empty = attrs.empty;

      // selection changed handler
      scope.select = function(value) {
        scope.ngModel = value;
        if (scope.ngChange) {
          scope.ngChange(value);
        }
      };
    },
    templateUrl: 'select.html'
  };
});