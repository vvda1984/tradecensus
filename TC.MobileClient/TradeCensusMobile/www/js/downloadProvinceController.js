/// <reference path="tradecensus.js" />

function downloadProvinceController($scope, $http, $mdDialog) {
    $scope.R = R;
    $scope.close = function () {
        $mdDialog.hide(isDirty);
    };   
    
    var maxDownload = $scope.config.max_oulet_download;
    var cancelDownload = false;
    var curProvince;
    var isDirty = false;

    //*************************************************************************    
    $scope.delete = function (p) {
        showConfirm(R.confirm, R.delete_offline_outlets_of + p.name + '?', function () {
            selectUnsyncedOutletsOfProvince($scope.config.tbl_outlet, p.id, function (dbres) {
                if (dbres.rows.length > 0) {
                    showDlg(R.error, R.unsynced_outlet_in_province);
                    return;
                }

                p.download = 0;
                try {
                    $scope.$apply();
                } catch (err) {
                }
                deleleDownloadProvinceDB($scope.config.tbl_outlet, $scope.config.tbl_downloadProvince, p.id, function () {

                }, function (dberr) {
                    showError(dberr.message);
                });
            }, function (dberr) {
                showError(dberr.message);
            });           
        }, function () { });
    }

    //*************************************************************************    
    $scope.download = function (p) {
        var downloadedCount = 0;
        for (var i = 0; i < $scope.dprovinces.length; i++) {
            if ($scope.dprovinces[i].download && p.id != $scope.dprovinces[i].id)
                downloadedCount++;

            if (downloadedCount >= maxDownload) {
                showError(R.reach_maximum_download);
                return;
            }
        }

        curProvince = p;
        selectUnsyncedOutletsOfProvince($scope.config.tbl_outlet, p.id, function (dbres) {
            if (dbres.rows.length > 0) {
                showDlg(R.error, R.unsynced_outlet_in_province);
                return;
            }

            showConfirm(R.download_outlets, R.download_outlets_confim + curProvince.name + '?', function () {
                try {
                    cancelDownload = false;
                    showDlg(R.downloading_outlet, R.please_wait,
                        function () {
                            log('****** CANCEL download');
                            cancelDownload = true;
                        }
                    );
                    var url = baseURL + '/outlet/getbyprovince/' + userID + '/' + curProvince.id;
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
                                var outletHeaders = data.Outlets;
                                if (outletHeaders.length > 0) {
                                    log('Found ' + outletHeaders.length.toString() + ' outlets');
                                    downloadOutlet(outletHeaders, 0);
                                }
                                else {
                                    showInfo(R.no_outlet_found);
                                }
                            }
                        } catch (err) {
                            showError(err.message);
                        }
                    }, function (err) {
                        log('HTTP error...');
                        log(err);
                        hideDlg();
                        var msg = err.statusText == '' ? $scope.resource.text_ConnectionTimeout : err.statusText;
                        showError(msg);
                    });
                } catch (ex) {
                    showError(ex.message);
                }
            }, null);
        }, function (dberr) {
            showError(dberr.message);
        });        
    }

    //*************************************************************************
    function downloadOutlet(outletHeaders, i){
        try{
            var outletheader = outletHeaders[i];
            setDlgTitle(R.downloading_outlet + '(' + (i + 1).toString() + '/' + outletHeaders.length + ')');
            var url = baseURL + '/outlet/get/' + userID + '/' +  outletheader.ID.toString();              
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
                        var outlet = data.Item;
                        log(data);
                        var temp = [];
                        temp[0] = outlet;
                        insertOutletsDB(user.id, config.tbl_outlet, temp,
                            function () {
                                if(!cancelDownload){
                                    if((i + 1) < outletHeaders.length){
                                        downloadOutlet(outletHeaders, i + 1);
                                        curProvince.download = 1;                                        
                                        isDirty = true;
                                        // update db status                                    
                                    } else {
                                        //showInfo('Download outlets completed!');
                                        hideDlg();
                                    }
                                } else {
                                    hideDlg();
                                }
                            },
                            function (dberr) {
                                showError(dberr.message);
                            });                                         
                    }
                } catch (err) {
                    showError(err.message);
                }
            }, function(err){
                log('HTTP error...');
                log(err);
                hideDlg();
                var msg = err.statusText == '' ? $scope.resource.text_ConnectionTimeout : err.statusText;
                showError(msg);        
            });
        } catch(ex){
            showError(ex.message);
        }
    }    
}