/// <reference path="tradecensus.js" />

function downloadProvinceController($scope, $http, $mdDialog) {  
    $scope.close = function () {
        $mdDialog.hide(isDirty);
    };   

    var cancelDownload = false;
    var curProvince;
    var isDirty = false;

    //*************************************************************************    
    $scope.download = function(p){
        curProvince = p;
        selectUnsyncedOutletsOfProvince($scope.config.tbl_outlet, p.id, function (dbres) {
            if (dbres.rows.length > 0) {
                showDlg('Cannot download', 'There are unsynced outlet in province ' + p.name + ' please change working outlet and do sync first!');
                return;
            }

            showConfirm('Download Outlets in ' + curProvince.name + '?', 'It may take for a while!.', function () {
                try {
                    cancelDownload = false;
                    showDlg('Downloading Outlets', 'please wait...',
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
                                    showInfo('Not outlets was found!');
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
            setDlgTitle('Downloading outlets (' + (i + 1).toString() + '/' + outletHeaders.length + ')');
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
                                    if((i + 1)<outletHeaders.length){
                                        downloadOutlet(outletHeaders, i + 1);
                                        curProvince.download = 1;                                        
                                        isDirty = true;
                                        // update db status
                                    } else {
                                        showInfo('Download outlets completed!');
                                    }
                                }
                            },
                            function (dberr) {
                                showError('Download outlet '+  outletheader.Name + ' has got error: ' + dberr.message);
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