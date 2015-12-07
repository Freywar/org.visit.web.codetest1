angular.module('TeknovisioDemo').directive('bubbleChart', function($window) {
  return {
    restrict: 'E',
    require: '^ngModel',
    scope: {
      ngModel: '=',
      ngDblclick: '&'
    },
    link: function(scope, element, attrs) {
      var canvas = element[0].children[0];

      var chart;

      var resizeTimeout = null;
      var onResizeTimeout = function() {
        resizeTimeout = null;
        if (!chart)
          return;
        canvas.style.width = canvas.style.height = '100%';
        canvas.style.width = (canvas.width = Math.max(canvas.offsetWidth, canvas.parentNode.parentNode.offsetWidth)) + 'px';
        canvas.style.height = (canvas.height = Math.max(canvas.offsetHeight, canvas.parentNode.parentNode.offsetHeight) - 30) + 'px';
        chart.setWidth(canvas.width);
        chart.setHeight(canvas.height);
        chart.invalidate(true, true);
      };


      var w = angular.element($window);
      scope.getWindowDimensions = function() {
        return {
          'h': w.innerHeight,
          'w': w.innerWidth
        };
      };
      scope.$watch(scope.getWindowDimensions, function(newValue, oldValue) {
        if (resizeTimeout)
          clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(onResizeTimeout, 100);
      }, true);

      w.bind('resize', function() {
        scope.$apply();
      });

      scope.$watch('ngModel', function(newValue, oldValue) {
        if (!newValue)
          return;

        if (newValue.bubbles)
          for (var i = 0; i < newValue.bubbles.length; i++)
            newValue.bubbles[i].dblClick = delegate(function(sender, args) {
              scope.ngDblclick({
                sender: sender,
                args: args
              });
            }, this);

        if (chart)
          chart.update(newValue);
        else {
          chart = new B.Chart(newValue);
          chart.setContext(canvas.getContext('2d'));
          chart.setHAlign(B.HAlign.none);
          chart.setVAlign(B.VAlign.none);
        }

        onResizeTimeout();
      });
    },
    templateUrl: 'bubblechart.html'
  };
})
;