/// <reference path="tradecensus.js" />
/// <reference path="tc.outletAPI.js" />
/// <reference path="tc.appAPI.js" />
/// <reference path="tc.mapAPI.js" />

var __isSync = false;
function outletStatusControlle($scope, $http, $mdDialog) {
    $scope.closeOutletStatusForm = function () {
        hideDialog(false);
    }
    $scope.queryOutlet = function () {
        if ($scope.currentOutletDate != null)
            queryUserOulet($scope.currentOutletDate);
    }
    $scope.syncAllPending = function () {
        if (!networkReady()) {
            showError(R.check_network_connection);
            return;
        }

        $("#ovdatePicker").prop('disabled', true);
        $("#ovqueryButton").prop('disabled', true);
        $("#ovsyncButton").prop('disabled', true);
        $("#syncingStatusText").html();
        $("#syncingText").show();

        __isSync = true;
        syncOutlets(0, function (error) {
            __isSync = true;
            $("#ovdatePicker").prop('disabled', false);
            $("#ovqueryButton").prop('disabled', false);
            $("#ovsyncButton").prop('disabled', false);
            $("#syncingText").hide();
            queryUserOulet($scope.currentOutletDate);
        });
    }

    function hideDialog(answer) {
        __isSync = false;
        $mdDialog.hide(answer);
        OUTLET.dialog.close(answer, null);
    };
    function queryUserOulet(date) {
        $("#statusText").html('Query outlet...');
        $("#outletTable").hide();
        $("#noOutletText").show();
        OUTLET.queryUserOutlets(date, function (error, outlets) {
            if (error !== null) {
                $("#statusText").html(error);
            } else {
                if (outlets.length == 0) {
                    $("#statusText").html('No outlet found!');
                } else {
                    $("#noOutletText").hide();
                    $("#outletTable").show();
                    _outlets = outlets;
                    _pendingOutlets = [];
                    $("#outletTableBody").empty();
                    var hasPending = false;
                    var html = '';
                    for (var i in outlets) {
                        var outlet = outlets[i];
                        var syncStatus = 'Synced';
                        var style = '';
                        if (outlet.PSynced == 0) {
                            syncStatus = 'Pending';
                            hasPending = true;
                            style = 'color:#F44336;"';
                            _pendingOutlets.push(outlet);
                        }
                        html +=
                            '<tr>' +
                                '<td style="width:100px;">' + outlet.ID + '</td>' +
                                '<td style="width:320px; text-overflow: ellipsis;">' + outlet.Name + '</td>' +
                                '<td style="width:100px;">' + tcutils.formatTime(outlet.LastModifiedTS) + '</td>' +
                                '<td style="width:100px; text-align:right; ' + style + '"' + outlet.positionIndex.toString() + '">' + syncStatus + '</td>' +
                            '</tr>';
                    }
                    $("#outletTableBody").html(html);
                    $scope.canSync = hasPending;
                }
            }
        });
    }
    function syncOutlets(startIndex, callback) {
        if (!networkReady()) {
            showError(R.check_network_connection);
            return;
        }

        $("#syncingStatusText").html((((startIndex) / _pendingOutlets.length) * 100).toFixed(2).toString() + '%');
        var unsyncedOutlets = [];
        var nextStartIndex = startIndex + 10;
        for (var i = startIndex; i < _pendingOutlets.length && i < nextStartIndex; i++) {
            unsyncedOutlets.push(_pendingOutlets[i]);
        }

        var url = baseURL + '/outlet/saveoutlets/' + userID + '/' + pass;
        log('Call service api: ' + url);
        $http({
            method: config.http_method,
            data: unsyncedOutlets,
            url: url,
            headers: { 'Content-Type': 'application/json' }
        }).then(function (resp) {
            var data = resp.data;
            if (data.Status == -1 || data.Status == 1) { // error
                console.error(data.ErrorMessage);
                callback("Error while synchronizing outlets to server! (#3201)");
            } else {
                setSyncStatusDB($scope.config.tbl_outlet, data.Outlets, true,
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
                    });
            }
        }, function (err) {
            console.error(err);
            callback("Cannot connect to server, please try again! (#3203)");
        });
    }

    var _currentDate = new Date();
    var _outlets = [];
    var _pendingOutlets = [];
    $scope.canSync = false;
    $scope.currentOutletDate = _currentDate;

    queryUserOulet($scope.currentOutletDate);
}