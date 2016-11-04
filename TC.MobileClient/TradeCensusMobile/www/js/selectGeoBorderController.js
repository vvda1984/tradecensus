/// <reference path="tradecensus.js" />
/// <reference path="tc.outletAPI.js" />
/// <reference path="tc.appAPI.js" />
/// <reference path="tc.mapAPI.js" />

var userSelectedBorder;
function selectGeoBorderController($scope, $http, $mdDialog) {
    isOutletDlgOpen = true;
    var t_level = border_level;
    var t_borders_0 = borders_0;
    var t_borders_1 = borders_1;
    var t_borders_2 = borders_2;
    var t_borders_3 = borders_3;
    var t_borders_4 = borders_4;
    var t_borders_5 = borders_5;
    var t_borders_6 = borders_6;
    var t_selected_border_0 = selected_border_0;
    var t_selected_border_1 = selected_border_1;
    var t_selected_border_2 = selected_border_2;

    function set_t_borders(items, level) {
        if (level == 0) {
            t_borders_0 = items;
        } else if (level == 1) {
            t_borders_1 = items;
        } else if (level == 2) {
            t_borders_2 = items;
        } else if (level == 3) {
            t_borders_3 = items;
        } else if (level == 4) {
            t_borders_4 = items;
        } else if (level == 5) {
            t_borders_5 = items;
        } else if (level == 6) {
            t_borders_6 = items;
        }
    }
    function get_t_borders(level) {
        if (level == 0) {
            return t_borders_0;
        } else if (level == 1) {
            return t_borders_1;
        } else if (level == 2) {
            return t_borders_2;
        } else if (level == 3) {
            return t_borders_3;
        } else if (level == 4) {
            return t_borders_4;
        } else if (level == 5) {
            return t_borders_5;
        } else if (level == 6) {
            return t_borders_6;
        }
        return [];
    }

    $scope.title = '';
    $scope.R = R;  
    $scope.borders = get_t_borders(t_level);
    $scope.allowBack = t_level > 0;
    $scope.userSelectedBorer = userSelectedBorder;

    if (t_level > 0) {
        try { $scope.title = $scope.userSelectedBorer.Name; }
        catch(er){}
    }
    
    $scope.selectBorder = function (b) {
        $scope.userSelectedBorer = b;
        if (t_level > 0) {
            try { $scope.title = $scope.userSelectedBorer.Name; }
            catch (er) { }
        }
        
        if (t_level == 0) {
            t_selected_border_0 = $scope.userSelectedBorer;
            t_selected_border_1 = null;
        } else if (t_level == 1) {
            t_selected_border_1 = $scope.userSelectedBorer;
            t_selected_border_2 = null;
        } else if (t_level == 2) {
            t_selected_border_2 = $scope.userSelectedBorer;
        }

        borders_0 = t_borders_0;
        borders_1 = t_borders_1;
        borders_2 = t_borders_2;
        borders_3 = t_borders_3;
        borders_4 = t_borders_4;
        borders_5 = t_borders_5;
        borders_6 = t_borders_6;
        border_level = t_level;

        selected_border_0 = t_selected_border_0;
        selected_border_1 = t_selected_border_1;
        selected_border_2 = t_selected_border_2;

        addressModel.update(selected_border_0, selected_border_1, selected_border_2, borders_1, borders_2);

        userSelectedBorder = b;
        $mdDialog.hide(true);
    }

    $scope.nextBorder = function (b) {
        try {
            if (t_level == 0) {
                t_selected_border_0 = b;
            } else if (t_level == 1) {
                t_selected_border_1 = b;
            } else if (t_level == 2) {
                t_selected_border_2 = b;
            }

            $("#loading-border").css("display", "block");
            var url = baseURL + '/border/getsubborders/' + b.ID.toString();
            log('Call service api: ' + url);
            $http({
                method: config.http_method,
                url: url
            }).then(function (resp) {
                try {
                    var data = resp.data;
                    if (data.Status == -1) { // error
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
            }, function (err) {
                log('HTTP error...');
                log(err);
                var msg = err.statusText == '' ? $scope.R.text_ConnectionTimeout : err.statusText;
                showError(msg);
                $("#loading-border").css("display", "none");
            });
        } catch (ex) {
            showError(ex.message);
            $("#loading-border").css("display", "none");
        }
    }

    $scope.backBorder = function () {
        t_level--;
        $scope.borders = get_t_borders(t_level);
        $scope.allowBack = t_level > 0;

        if (t_level == 0) {
            t_selected_border_0 = null;
        } else if (t_level == 1) {
            t_selected_border_1 = null;
        } else if (t_level == 2) {
            t_selected_border_2 = null;
        }
    }
}