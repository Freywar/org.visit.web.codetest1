angular.module('TeknovisioDemo').controller('MainCtrl', ['$scope', '$http', '$timeout', 'visitAPI', function($scope, $http, $timeout, visitAPI) {

  $scope.dataTypes = visitAPI.types;

  $scope.xDataType = '1';
  $scope.yDataType = '2';
  $scope.cDataType = '';
  $scope.rDataType = '3';
  $scope.from = new Date('2015-05-01T00:00:00');
  $scope.to = new Date('2015-05-08T00:00:00');

  $scope.loading = false;
  $scope.error = false;
  $scope.bubbleChartData = null;

  function formatDate(date) {
    date = new Date(date);
    date = new Date(Math.round(date / visitAPI.steps[visitAPI.step]) * visitAPI.steps[visitAPI.step]);
    switch (visitAPI.step) {
      default:
      case 'D':
        return date.toLocaleDateString();
      case 'w':
        return date.toLocaleDateString({}, {
            year: 'numeric',
            month: 'numeric'
          }) + ', Week ' + ((0 | date.getDate() / 7) + 1);
      case 'M':
        return date.toLocaleDateString({}, {
          year: 'numeric',
          month: 'numeric'
        });
      case 'Q':
        var m = Math.floor(date.getMonth() / 3) + 2;
        var q = m > 4 ? m - 4 : m;
        return date.toLocaleDateString({}, {
            year: 'numeric'
          }) + ', Quarter ' + q;
      case 'y':
        return date.toLocaleDateString({}, {
          year: 'numeric'
        });
    }
  }

  function convert(data) {

    data = data[0].body.row;
    var dates = [];
    var typesNames = {};
    var regionsNames = {};
    var values = {};
    var det;
    for (var i = 0; i < data.length; i++) {
      var row = data[i].cells;
      var type = '';
      var region = '';
      for (var j = 0; j < row.length; j++) {
        switch (true) {
          case !!row[j].type:
            type = row[j].type.id;
            typesNames[type] = row[j].type.value;
            break;
          case !!row[j].from:
            var t = Object.keys(row[j].from)[0];
            det = Utils.String.toUpperFirst(t) + 's';
            region = row[j].from[t].id;
            regionsNames[region] = row[j].from.value;
            break;
          case !!(row[j].data && row[j].data.interval):
            values[type] = values[type] || {};
            values[type][region] = values[type][region] || [];
            var date = row[j].data.interval.from, fDate = formatDate(date);


            var index = dates.indexOf(fDate);
            if (index === -1) {
              dates.push(fDate);
              index = dates.length - 1;
            }
            values[type][region][index] = row[j].data.data;
            break;
        }
      }
    }

    var regionsIds = Object.keys(regionsNames);

    var options = JSON.parse(JSON.stringify(B.Chart.default));

    options.bubbles = regionsIds.map(function(id) {
      return {path: [id]}
    });

    options.title.text = visitAPI.folderName;

    var items = {};
    for (type in typesNames) {
      items[type] = items[type] || {};
      for (var id  in regionsNames) {
        items[type][id] = ((values[type] || {})[id] || []).map(function(a) {
          return +a
        })
      }
    }

    options.data = {
      items: items,
      names: [
        typesNames,
        regionsNames,
        dates
      ]
    };

    options.xTransformer = $scope.xDataType ? {path: [$scope.xDataType]} : {};
    options.yTransformer = $scope.yDataType ? {path: [$scope.yDataType]} : {};
    options.rTransformer = $scope.rDataType ? {
      min: 0.1,
      nodata: 0.05,
      path: [$scope.rDataType]
    } : null;
    options.cTransformer = $scope.cDataType ? {path: [$scope.cDataType]} : null;

    options.bubblesLegend.title.text = det;

    options.slider.ticks = dates.map(function(d, i) {
      return {text: d, path: [i]}
    });

    return options;
  }

  function onDataLoad() {
    $scope.bubbleChartData = convert(visitAPI.data);

    //console.log(visitAPI.data, $scope.bubbleChartData);

    $scope.loading = false;
  }

  $scope.update = function() {
    $scope.loading = true;
    $scope.error = false;

    visitAPI.from = $scope.from = $scope.from || visitAPI.from;
    visitAPI.to = $scope.to = $scope.to || visitAPI.to;
    visitAPI.step = null;
    visitAPI.type = [$scope.xDataType, $scope.yDataType, $scope.cDataType, $scope.rDataType].filter(function(t) {
      return t;
    });

    visitAPI.update().then(onDataLoad, function() {
      $scope.error = true;
      $scope.loading = false;
    });
  };

  $scope.drillDown = function(id) {
    var promise = visitAPI.drillDown(id);
    if (promise) {
      $scope.loading = true;
      promise.then(onDataLoad);
    }
  };

  $scope.drillUp = function() {
    var promise = visitAPI.drillUp();
    if (promise) {
      $scope.loading = true;
      promise.then(onDataLoad);
    }
  };

  $scope.update();
}]);