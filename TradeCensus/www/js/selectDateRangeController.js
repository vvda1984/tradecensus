/// <reference path="tradecensus.js" />
/// <reference path="tc.outletAPI.js" />
/// <reference path="tc.appAPI.js" />
/// <reference path="tc.mapAPI.js" />

function selectDateRangeController($scope, $mdDialog) {
  __isOutletDlgOpen = true;
  $scope.R = R;

  var now = new Date();

  $scope.dateFrom = now; //new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  $scope.dateTo = now;

  $scope.cancel = function () {
    $mdDialog.cancel();
  };

  $scope.ok = function () {
    try {
      if (t_level == 0) {
        t_selected_border_0 = b;
      } else if (t_level == 1) {
        t_selected_border_1 = b;
      } else if (t_level == 2) {
        t_selected_border_2 = b;
      }

      $("#loading-border").css("display", "block");
      var url = baseURL + "/border/getsubborders/" + b.ID.toString();
      log("Call service api: " + url);
      cordova.plugin.http.sendRequest(
        url,
        {
          method: config.http_method,
          data: {},
          headers: {},
        },
        function (response) {
          try {
            const data = JSON.parse(response.data);
            if (data.Status == -1) {
              // error
              showError(data.ErrorMessage);
            } else {
              t_level++;
              set_t_borders(data.Items, t_level);
              $scope.borders = get_t_borders(t_level);
              $scope.allowBack = t_level > 0;
            }
          } catch (err) {
            showError(err.message);
          }
          $("#loading-border").css("display", "none");
        },
        function (response) {
          handleHttpError(response.error);
          log("HTTP error...");
          log(response.error);
          //var msg = err.statusText == "" ? $scope.R.text_ConnectionTimeout : err.statusText;
          showError("" + response.status + ":" + response.error);
          $("#loading-border").css("display", "none");
        }
      );
    } catch (ex) {
      showError(ex.message);
      $("#loading-border").css("display", "none");
    }
  };
}
