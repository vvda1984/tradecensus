/// <reference path="tradecensus.js" />
/// <reference path="tc.outletAPI.js" />


function newOutletController($scope, $mdDialog) {
    //log($scope.outletTypes);
    isOutletDlgOpen = true;
    $scope.R = R;
    $scope.outletTypes = outletTypes;
    $scope.allowCapture = true;
    $scope.showImage1 = false;
    $scope.showImage2 = false;
    $scope.showImage3 = false;
    $scope.outlet.modifiedImage1 = false;
    $scope.outlet.modifiedImage2 = false;
    $scope.outlet.modifiedImage3 = false;
    $scope.createNew = $scope.outlet.AuditStatus == StatusNew;
    $scope.showDraft = $scope.outlet.IsDraft && !$scope.isNewOutlet;
    $scope.isDeleted = false;
    $scope.title = buildTitle();
    var downloadProvinces = [];
    if (networkReady()) {
        downloadProvinces = provinces;
    } else {
        var c = 0;
        for (var i = 0; i < dprovinces.length; i++) {
            if (dprovinces[i].download) {
                downloadProvinces[c] = dprovinces[i];
                c++;
            }
        }
    }
    $scope.provinces = downloadProvinces;
    

    if (!isEmpty($scope.outlet.StringImage1)) {
        $scope.image1URL = getImageURL($scope.outlet.StringImage1);
    }
    if (!isEmpty($scope.outlet.StringImage2)) {
        $scope.image2URL = getImageURL($scope.outlet.StringImage2);
    }
    if (!isEmpty($scope.outlet.StringImage3)) {
        $scope.image3URL = getImageURL($scope.outlet.StringImage3);
    }
    
    $scope.capture = function (i) {
        if (i == 1) {
            if (!isEmpty($scope.outlet.StringImage1)) {              
                openImgViewer($scope.outlet.Name, $scope.image1URL, function (imageURI) {
                    log('Update imageURI 1: ' + imageURI);
                    if (imageURI != null) {
                        $scope.outlet.StringImage1 = imageURI;
                        $scope.outlet.modifiedImage1 = true;
                        getFileContentAsBase64(imageURI, function (content) {
                            $scope.outlet.StringImage1 = content.replace('data:image/jpeg;base64,', '');
                            $scope.image1URL = imageURI;
                            var image = document.getElementById('outletImg1');
                            image.setAttribute('src', imageURI);
                            image.focus();
                        })
                    }
                });
            }
        } else if (i == 2) {
            if (!isEmpty($scope.outlet.StringImage2)) {
                openImgViewer($scope.outlet.Name, $scope.image2URL, function (imageURI) {
                    log('Update imageURI 2: ' + imageURI);
                    if (imageURI != null) {
                        $scope.outlet.StringImage2 = imageURI;
                        $scope.outlet.modifiedImage2 = true;
                        getFileContentAsBase64(imageURI, function (content) {
                            $scope.outlet.StringImage2 = content.replace('data:image/jpeg;base64,', '');
                            $scope.image2URL = imageURI;
                            var image = document.getElementById('outletImg2');
                            image.setAttribute('src', imageURI);
                            image.focus();
                        })
                    }
                });
            }
        } else if (i == 3) {
            if (!isEmpty($scope.outlet.StringImage3)) {
                openImgViewer($scope.outlet.Name, $scope.image3URL, function (imageURI) {
                    log('Update imageURI 3: ' + imageURI);
                    if (imageURI != null) {
                        $scope.outlet.StringImage3 = imageURI;
                        $scope.outlet.modifiedImage3 = true;
                        getFileContentAsBase64(imageURI, function (content) {
                            $scope.outlet.StringImage3 = content.replace('data:image/jpeg;base64,', '');
                            $scope.image3URL = imageURI;
                            var image = document.getElementById('outletImg3');
                            image.setAttribute('src', imageURI);
                            image.focus();
                        })
                    }
                });
            }
        } else {
            captureImage(function (imageURI) {
                if (isEmpty($scope.outlet.StringImage1)) {
                    $scope.outlet.StringImage1 = imageURI;
                    $scope.outlet.modifiedImage1 = true;
                    getFileContentAsBase64(imageURI, function (content) {
                        $scope.outlet.StringImage1 = content.replace('data:image/jpeg;base64,', '');
                        $scope.image1URL = imageURI;
                        var image = document.getElementById('outletImg1');
                        image.setAttribute('src', imageURI);
                        image.focus();
                    })
                } else if (isEmpty($scope.outlet.StringImage2)) {
                    $scope.outlet.StringImage2 = imageURI;
                    $scope.outlet.modifiedImage2 = true;
                    getFileContentAsBase64(imageURI, function (content) {
                        $scope.outlet.StringImage2 = content.replace('data:image/jpeg;base64,', '');
                        $scope.image2URL = imageURI;
                        var image = document.getElementById('outletImg2');
                        image.setAttribute('src', imageURI);
                        image.focus();
                    })
                } else if (isEmpty($scope.outlet.StringImage3)) {
                    $scope.outlet.StringImage3 = imageURI;
                    $scope.outlet.modifiedImage3 = true;
                    getFileContentAsBase64(imageURI, function (content) {
                        $scope.outlet.StringImage3 = content.replace('data:image/jpeg;base64,', '');
                        $scope.image3URL = imageURI;
                        var image = document.getElementById('outletImg3');
                        image.setAttribute('src', imageURI);
                        image.focus();
                    })
                }
                $scope.allowCapture =
                          isEmpty($scope.outlet.StringImage1) ||
                          isEmpty($scope.outlet.StringImage2) ||
                          isEmpty($scope.outlet.StringImage3);

                //var image = document.getElementById('outletImg' + i.toString());
                //image.src = imageURI;
                //var image = document.getElementById('outletImg' + i);
                //image.src = "data:image/jpeg;base64," + imageData;            
            }, function (err) {
                //showError(err);
            });
        }
    }

    $scope.deleteOutlet = function () {
        log("delete pressed");
        var confirmText = R.delete_outlet_confirm.replace("{outletname}", $scope.outlet.Name);
        showConfirm(R.delete_outlet, confirmText, function () {
            $scope.outlet.isDeleted = true;
            $mdDialog.hide(true);
        }, function () { });                
    };

    $scope.postOutlet = function () {
        if (!validate()) return;

        var confirmText = R.post_outlet_confirm.replace("{outletname}", $scope.outlet.Name);
        showConfirm(R.post_outlet, confirmText, function () {
            $scope.outlet.IsDraft = false; // POST
            $mdDialog.hide(true);
        }, function () { });
    }

    $scope.saveUpdate = function () {
        if (!validate()) return;

        $mdDialog.hide(true);
    };

    $scope.cancelUpdate = function () {
        $mdDialog.cancel();
    };

    $scope.codeChanged = function(){
        $scope.title = buildTitle();
    }

    $scope.nameChanged = function(){
        $scope.title = buildTitle();
    }

    function captureImage(onSuccess, onError) {
        try {
            navigator.camera.getPicture(onSuccess, onError,
                {                    
                    quality: 30,
                    correctOrientation: true,
                    targetWidth: 800,
                    targetHeight: 600,
                    destinationType: Camera.DestinationType.DATA_URL, //FILE_URI // DATA_URL for base64 => not recommend due to memory issue,
                  
                });
        } catch (err) {
            showError(err);
        }
    }

    function getImageURL(stringImage) {
        log(stringImage);
        if (!isEmpty(stringImage)) {
            var imageUrl = stringImage;
            if (!isEmpty(stringImage)) {
                if (stringImage.toUpperCase().indexOf('/IMAGES') > -1) {
                    imageUrl = imageURL($scope.config.protocol, $scope.config.ip, $scope.config.port, imageUrl);
                }  else { //if (stringImage.indexOf('base64') > -1) {
                   imageUrl = 'data:image/jpeg;base64,' + imageUrl;
                }
            }
            return imageUrl;
        }
        return '';
    }

    function validate() {
        if (isEmpty($scope.outlet.Name)) {
            showErrorAdv(R.outlet_name_is_empty, function () { $("#inputName").focus(); });

            return false;
        }
        if ($scope.outlet.OTypeID == '-1') {
            showErrorAdv(R.outlet_type_is_empty, function () { $("#inputOutletType").focus(); });
            //showError(R.outlet_type_is_empty);
            return false;
        }

        if (isEmpty($scope.outlet.Phone)) {
            showErrorAdv(R.phone_is_empty, function () { $("#inputPhone").focus(); });
            return false;
        }

        if (isEmpty($scope.outlet.AddLine)) {
            showErrorAdv(R.house_no_is_empty, function () { $("#inputAdd1").focus(); });
            return false;
        }
        if (isEmpty($scope.outlet.AddLine2)) {
            showErrorAdv(R.street_is_empty, function () { $("#inputAdd2").focus(); });
            return;
        }
        if (isEmpty($scope.outlet.District)) {
            showErrorAdv(R.district_is_empty, function () { $("#inputDistrict").focus(); });
            return false;
        }

        if ($scope.outlet.TotalVolume == undefined || $scope.outlet.TotalVolume == null) {
            showErrorAdv(R.total_is_invald, function () { $("#total").focus(); });
            return false;
        }
        if ($scope.outlet.VBLVolume == undefined || $scope.outlet.VBLVolume == null) {
            showErrorAdv(R.vbl_is_invald, function () { $("#vblvolume").focus(); });
            return false;
        }

        if ($scope.outlet.VBLVolume > $scope.outlet.TotalVolume) {
            showErrorAdv(R.vbl_cannot_greater_than_total, function () { $("#total").focus(); });
            return false;
        }

        return true;
    }

    function buildTitle() {
        var t = $scope.outlet.Name;
        if (isEmpty(t)) {
            if ($scope.outlet.AuditStatus == StatusNew || $scope.outlet.AuditStatus == StatusPost) {
                t = R.create_new_outlet;
            } else {
                t = R.edit_outlet;
            }
        }

        if (!isEmpty($scope.outlet.ID)) {
            t = t.concat(' (', $scope.outlet.ID, ')');
        } else {
            t = t.concat(' (', $scope.outlet.ID, ')');
        }
        
        return t;
    }
}