angular.module('TeknovisioDemo').factory('visitAPI', function($http, $q) {

  var oauth = OAuth({
    consumer: {
      public: 'anonymous',
      secret: 'anonymous'
    },
    signature_method: 'HMAC-SHA1'
  });
  var token = {
    public: 'cdquLXK5',
    secret: 'k8vWbX6qJ87Zje8UtBNMAC4Z'
  };

  /**
   * Calculate detalization by dates so there are at least 3 ticks.
   * @param from Start date.
   * @param to End date.
   * @returns {steps} Detalization.
   */
  function assumeDetalization(from, to) {
    var length = to - from,
      minD = 'D',
      minT = Infinity;
    for (var d in API.steps) {
      var ticks = length / API.steps[d];
      if (ticks > 2 && ticks < minT) {
        minD = d;
        minT = ticks;
      }
    }
    return minD;
  }

  /**
   * Prepare to drill down.
   * @returns {boolean} True if prepare was successfull.
   */
  function setupDrillDown(id) {
    if (!API.subfolders || !API.subfolders[id])
      return false;
    API.parentFolders.push(API.folder);
    API.parentFoldersNames.push(API.folderName);
    API.folder = API.subfolders[id];
    API.folderName = API.subfoldersNames[id];
    return true;
  }

  /**
   * Prepare to drill up.
   * @returns {boolean} True if prepare was successfull.
   */
  function setupDrillUp() {
    if (!API.parentFolders || !API.parentFolders.length)
      return false;
    API.folder = API.parentFolders.pop();
    API.folderName = API.parentFoldersNames.pop();
    return true;
  }

  var runningRequests = {};

  /**
   * Data obtaining API.
   * @method load {@link load}
   */
  var API = {
    /**
     * @enum steps Possible detalization steps with length in ms.
     */
    steps: {
      'y': 1000 * 60 * 60 * 24 * 365,
      'Q': 1000 * 60 * 60 * 24 * 31 * 3,
      'M': 1000 * 60 * 60 * 24 * 31,
      'w': 1000 * 60 * 60 * 24 * 7,
      'D': 1000 * 60 * 60 * 24/*,
       'H': 1000*60*60*/
    },
    /**
     * @enum types Possible data types with names.
     */
    types: {
      '1': 'Visitors',
      '2': 'Transactions',
      '3': 'Conversion'
    },

    /**
     * @property folder Current folder.
     */
    folder: '12501',
    /**
     * @property folderName Current folder name.
     */
    folderName: 'World',
    /**
     * @property subfolders Associative array of subfolders ids by items ids.
     */
    subfolders: {},
    /**
     * @property subfoldersNames Associative array of subfolders names by items ids.
     */
    subfoldersNames: {},
    /**
     * @property parentFolders Array of parent folders ids from top to bottom.
     */
    parentFolders: [],
    /**
     * @property parentFolders Array of parent folders names from top to bottom.
     */
    parentFoldersNames: [],

    /**
     * @param {Date|null} from Start date. If null sets to current date on update.
     */
    from: null,
    /**
     * @param {Date} to End date.  If null sets to 30 days past start date on update.
     */
    to: null,
    /**
     * @property {steps|null} step Date step. If null, calculates automatically on update.
     */
    step: null,
    /**
     * @property {types|types[]|null} type Type or array of types. If null, calculates automatically on update.
     */
    type: null,

    /**
     * @property data Loaded data.
     */
    data: null,

    /**
     * @method update Load data according to current properties.
     * @returns {HttpPromise} Promise that returns self extended with obtained data on resolve and default arguments on reject.
     */
    update: function() {
      API.from = API.from || new Date();
      API.to = API.to || new Date(+API.from + 30 * API.steps.D);
      API.step = API.step || assumeDetalization(API.from, API.to);
      API.type = API.type || Object.keys(API.types);

      var toInc = new Date(+API.to + API.steps.D);
      var req = {
        method: 'GET',
        url: 'http://customers.visitintelligence.com/api/v1/dataquery/folder/' + API.folder + '/regions;' +
        API.type.filter(function(t, i, a) {
          return a.indexOf(t) === i
        }).map(function(t) {
          return 'dataType=' + t;
        }).join(';') +
        '?from=' + API.from.toISOString().replace(/.\d+Z/, '') + '' +
        '&to=' + toInc.toISOString().replace(/.\d+Z/, '') + '' +
        '&spacing=' + API.step
      };
      if (runningRequests[req.url])
        return runningRequests[req.url];

      req.headers = oauth.toHeader(oauth.authorize(req, token));

      return runningRequests[req.url] = $http(req).then(function(response) {

        runningRequests[req.url] = null;

        API.subfolders = {};
        API.subfoldersNames = {};

        var data = response.data[0].body.row;
        for (var i = 0; i < data.length; i++) {
          var row = data[i].cells;
          for (var j = 0; j < row.length; j++) {
            switch (true) {
              case !!row[j].from:
                var from = row[j].from,
                  fromType = Object.keys(from)[0],
                  tFrom = from[fromType];

                if (tFrom.folder) {
                  API.subfolders[tFrom.id] = tFrom.folder.id;
                  API.subfoldersNames[tFrom.id] = from.value;
                }
                break;
            }
          }
        }

        API.data = response.data;
      }, function(reason) {
        runningRequests[req.url] = null;
        return $q.reject(reason);
      });
    },
    /**
     * @method drillDown Drill down to an item.
     * @param id Id of item to drill down.
     * @returns {HttpPromise|null} Promise that returns self extended with obtained data on resolve and default arguments on reject. Null if there is nowhere to drill.
     */
    drillDown: function(id) {
      if (setupDrillDown(id))
        return API.update().then(null, setupDrillUp);
    },
    /**
     * @method drillDown Drill up.
     * @returns {HttpPromise|null} Promise that returns self extended with obtained data on resolve and default arguments on reject. Null if there is nowhere to drill.
     */
    drillUp: function() {
      var currentFolder = API.folder;
      var currentFolderName = API.folderName;
      if (setupDrillUp())
        return API.update().then(null, function() {
          API.parentFolders.push(API.folder);
          API.parentFoldersNames.push(API.folderName);
          API.folder = currentFolder;
          API.folderName = currentFolderName;
        });
    }
  };

  return API;
});