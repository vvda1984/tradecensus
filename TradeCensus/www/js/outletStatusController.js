/// <reference path="tradecensus.js" />
/// <reference path="tc.outletAPI.js" />
/// <reference path="tc.appAPI.js" />
/// <reference path="tc.mapAPI.js" />

var __isSync = false;

function outletStatusController($scope, $mdDialog, $timeout) {
  var ngtimeout = $timeout;
  var currentDate = new Date();
  var _curSyncIndex = 0;
  var _curSyncTimeout = null;
  var _curSyncOutlet = null;
  var _outlets;
  var _pendingOutlets = [];

  $scope.syncButtonCaption = "Sync all Pending";

  $scope.closeOutletStatusForm = function () {
    hideDialog(false);
  };
  $scope.queryOutlet = function () {
    if ($scope.currentOutletDate != null) queryUserOulet($scope.currentOutletDate);
  };
  $scope.syncAllPending = function () {
    if (__isSync === true) {
      __isSync = false;
      _stopSync();
      $scope.syncButtonCaption = "Sync all Pending";
      return;
    }

    if (!networkReady()) {
      showError(R.check_network_connection);
      return;
    }

    $("#ovdatePicker").prop("disabled", true);
    $("#ovqueryButton").prop("disabled", true);
    $("#syncingStatusText").html();
    $("#syncingText").show();

    __isSync = true;
    $scope.syncButtonCaption = "Stop";

    if (config.sync_batch_size > 1 || config.manual_sync_time_out == 0) {
      syncOutlets(0, function () {
        __isSync = false;
        $("#ovdatePicker").prop("disabled", false);
        $("#ovqueryButton").prop("disabled", false);
        $("#syncingText").hide();
        queryUserOulet($scope.currentOutletDate);
      });
    } else {
      _curSyncIndex = 0;
      _curSyncTimeout = null;
      _curSyncOutlet = null;
      _syncOutlet();
    }
  };

  function hideDialog(answer) {
    __isSync = false;
    $mdDialog.hide(answer);
    OUTLET.dialog.close(answer, null);
  }

  function queryUserOulet(date) {
    $("#statusText").html("Query outlet...");
    $("#outletTable").hide();
    $("#noOutletText").show();
    OUTLET.queryUserOutlets(date, function (error, outlets) {
      if (error !== null) {
        $("#statusText").html(error);
      } else {
        if (outlets.length == 0) {
          $("#statusText").html("No outlet found!");
        } else {
          $("#noOutletText").hide();
          $("#outletTable").show();
          _outlets = outlets;
          _pendingOutlets = [];
          $("#outletTableBody").empty();
          var hasPending = false;
          var html = "";
          for (var i in outlets) {
            var outlet = outlets[i];
            var syncStatus = "Synced";
            var style = "";
            if (outlet.PSynced == 0) {
              syncStatus = "Pending";
              hasPending = true;
              style = "color:#F44336;";
              _pendingOutlets.push(outlet);
            }
            html +=
              "<tr>" +
              '<td style="width:100px;">' +
              outlet.ID +
              "</td>" +
              '<td style="width:320px; text-overflow: ellipsis;">' +
              outlet.Name +
              "</td>" +
              '<td style="width:100px;">' +
              tcutils.formatTime(outlet.LastModifiedTS) +
              "</td>" +
              '<td id="syncStatus' +
              outlet.positionIndex.toString() +
              '" style="width:100px; text-align:right; ' +
              style +
              '">' +
              syncStatus +
              "</td>" +
              "</tr>";
          }
          $("#outletTableBody").html(html);
          $scope.canSync = hasPending;

          if (hasPending) {
            $("#ovsyncButton").show();
          } else {
            $("#ovsyncButton").hide();
          }
        }
      }
    });
  }

  function syncOutlets(startIndex, callback) {
    if (!networkReady()) {
      __isSync = false;
      showError(R.check_network_connection);
      return;
    }

    if (!__isSync) {
      callback();
      return; // stopped
    }

    $("#syncingStatusText").html(((startIndex / _pendingOutlets.length) * 100).toFixed(2).toString() + "%");
    var unsyncedOutlets = [];
    var nextStartIndex = startIndex + config.sync_batch_size;
    for (var i = startIndex; i < _pendingOutlets.length && i < nextStartIndex; i++) {
      unsyncedOutlets.push(_pendingOutlets[i]);
    }

    var url = baseURL + "/outlet/saveoutlets/" + userID + "/" + pass;
    log("Call service api: " + url);
    cordova.plugin.http.sendRequest(
      url,
      {
        method: config.http_method,
        data: unsyncedOutlets,
        headers: {},
      },
      function (response) {
        const data = JSON.parse(response.data);
        if (data.Status == -1 || data.Status == 1) {
          // error
          console.error(data.ErrorMessage);
          //callback("Error while synchronizing outlets to server! (#3201)");

          if (nextStartIndex >= _pendingOutlets.length) {
            callback();
          } else {
            syncOutlets(nextStartIndex, callback);
          }
        } else {
          setSyncStatusDB(
            $scope.config.tbl_outlet,
            data.Outlets,
            true,
            function () {
              if (nextStartIndex >= _pendingOutlets.length) {
                callback();
              } else {
                syncOutlets(nextStartIndex, callback);
              }
            },
            function (err) {
              console.error(err);
              callback("Error while synchronizing outlets to server! (#3202)");
            }
          );
        }
      },
      function (response) {
        console.error(response.error);
        callback("Cannot connect to server, please try again! (#3203)");
      }
    );
  }

  function _stopSync() {
    if (_curSyncTimeout != undefined && _curSyncTimeout != null) {
      ngtimeout.cancel(_curSyncTimeout);
      _curSyncTimeout = null;
    }
    queryUserOulet($scope.currentOutletDate);
  }

  function _syncAllOutletsComplete() {
    $("#ovdatePicker").prop("disabled", false);
    $("#ovqueryButton").prop("disabled", false);
    $("#syncingText").hide();
    $scope.syncButtonCaption = "Sync all Pending";
    queryUserOulet($scope.currentOutletDate);
  }

  function _syncOutletComplete() {
    if (_curSyncTimeout != undefined && _curSyncTimeout != null) {
      ngtimeout.cancel(_curSyncTimeout);
      _curSyncTimeout = null;
    }
    _syncOutlet();
  }

  function _syncOutlet() {
    if (_curSyncIndex < _pendingOutlets.length && __isSync) {
      _curSyncOutlet = _pendingOutlets[_curSyncIndex];
      _curSyncIndex++;
      $("#syncingStatusText").html(_curSyncIndex.toString() + "/" + _pendingOutlets.length.toString());
      _curSyncTimeout = ngtimeout(function () {
        $("#syncStatus" + _curSyncOutlet.positionIndex.toString()).html("Error");
        _syncOutletComplete();
      }, config.sync_time_out);
      _submitOutlet();
    } else {
      _syncAllOutletsComplete();
    }
  }

  function _submitOutlet() {
    $("#syncStatus" + _curSyncOutlet.positionIndex.toString()).html("Synchronizing");
    if (!networkReady()) {
      $("#syncStatus" + _curSyncOutlet.positionIndex.toString()).html("No network");
      _syncOutletComplete();
      return;
    }
    var unsyncedOutlets = [];
    unsyncedOutlets.push(_curSyncOutlet);
    var url = baseURL + "/outlet/saveoutlets/" + userID + "/" + pass;
    log("Call service api: " + url);
    cordova.plugin.http.sendRequest(
      url,
      {
        method: config.http_method,
        data: unsyncedOutlets,
        headers: {},
      },
      function (response) {
        const data = JSON.parse(response.data);
        if (data.Status == -1 || data.Status == 1) {
          // error
          console.error(data.ErrorMessage);
          _syncOutletComplete();
        } else {
          setSyncStatusDB(
            $scope.config.tbl_outlet,
            data.Outlets,
            true,
            function () {
              _syncOutletComplete();
            },
            function (err) {
              console.error(err);
              $("#syncStatus" + _curSyncOutlet.positionIndex.toString()).html("Error");
              _syncOutletComplete();
            }
          );
        }
      },
      function (response) {
        console.error(response.error);
        $("#syncStatus" + _curSyncOutlet.positionIndex.toString()).html("Error");
        _syncOutletComplete();
      }
    );
  }

  $("#ovsyncButton").hide();
  $scope.currentOutletDate = currentDate;
  queryUserOulet($scope.currentOutletDate);
}
