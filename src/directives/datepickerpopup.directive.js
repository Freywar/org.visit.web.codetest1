angular.module('TeknovisioDemo').directive('uibDatepickerSmall', function() {
  return {
    restrict: 'E',
    require: '^ngModel',
    scope: {
      ngModel: '=',
      minDate: '=',
      maxDate: '=',
      format: '=',
      ngChange: '&'
    },
    link: function(scope, element, attrs) {
      element.on('click', function(event) {
        event.preventDefault();
      });

      scope.opened = false;
    },
    templateUrl: 'datepickerpopup.html'
  };
});