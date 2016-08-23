/// <reference path="tradecensus.js" />
/// <reference path="tc.outletAPI.js" />
/// <reference path="tc.appAPI.js" />


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
    $scope.canDelete = $scope.outlet.canDelete;
    $scope.isDeleted = false;
    $scope.outlet.isChanged = false;
    $scope.canComment = user.hasAuditRole && $scope.outlet.AuditStatus == StatusAuditorNew;
    $scope.canPost = $scope.outlet.canPost;
    $scope.canApprove = $scope.outlet.canApprove;

    if (user.hasAuditRole) {
        $scope.outlet.canComment = $scope.outlet.AuditStatus == StatusAuditorNew;
    } else {
        $scope.outlet.canComment = false;
    }

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
    
    $scope.image1URL = getImageURL($scope.outlet.StringImage1);
    $scope.image2URL = getImageURL($scope.outlet.StringImage2);
    $scope.image3URL = getImageURL($scope.outlet.StringImage3);
    
    $scope.capture = function (i) {
        $scope.outlet.isChanged = true;
        if (i == 1) {
            if (!isEmpty($scope.outlet.StringImage1)) {              
                openImgViewer($scope.outlet.Name, false, $scope.image1URL, function (imageURI) {
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
                openImgViewer($scope.outlet.Name, false, $scope.image2URL, function (imageURI) {
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
                openImgViewer($scope.outlet.Name, false, $scope.image3URL, function (imageURI) {
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
            $scope.outlet.isChanged = true;
            $scope.outlet.AuditStatus = StatusDelete;
            $mdDialog.hide(true);
        }, function () { });                
    };

    $scope.postOutlet = function () {
        if (!validate()) return;
     
        var confirmText = R.post_outlet_confirm.replace("{outletname}", $scope.outlet.Name);
        showConfirm(R.post_outlet, confirmText, function () {
            if ($scope.outlet.AuditStatus == StatusNew) {
                $scope.outlet.IsDraft = false; // POST
                $scope.outlet.AuditStatus = StatusPost;
            }
            $scope.outlet.isChanged = true;
            $mdDialog.hide(true);
        }, function () { });
    }

    $scope.saveUpdate = function () {
        if (!validate(false)) return;

        showDlg(R.get_current_location, R.please_wait);
        getCurPosition(false, function (lat, lng) {
            hideDlg();
            if (!validateRange(lat, lng)) return;

            $scope.outlet.isChanged = true;
            $mdDialog.hide(true);
        }, function () {
            hideDlg();
            showError(R.cannot_approve_or_deny);
        });
    };

    $scope.approveOutlet = function () {
        if (!validate(true)) return;

        showDlg(R.get_current_location, R.please_wait);
        getCurPosition(false, function (lat, lng) {
            hideDlg();
            if (!validateRange(lat, lng)) return;
            $scope.outlet.isChanged = true;
            $scope.outlet.isApproved = true;

            if ($scope.outlet.AuditStatus == StatusAuditorNew) {
                $scope.outlet.AuditStatus = StatusAuditorAccept;
            }

            $mdDialog.hide(true);
        }, function () {
            hideDlg();
            showError(R.cannot_approve_or_deny);
        });
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

    function validate(isApproved) {
        if (isEmpty($scope.outlet.Name)) {
            showValidationErr(R.outlet_name_is_empty, function () { $("#inputName").focus(); });

            return false;
        }
        if ($scope.outlet.OTypeID == '-1') {
            showValidationErr(R.outlet_type_is_empty, function () { $("#inputOutletType").focus(); });
            //showError(R.outlet_type_is_empty);
            return false;
        }

        if (isEmpty($scope.outlet.Phone)) {
            showValidationErr(R.phone_is_empty, function () { $("#inputPhone").focus(); });
            return false;
        }

        if (isEmpty($scope.outlet.AddLine)) {
            showValidationErr(R.house_no_is_empty, function () { $("#inputAdd1").focus(); });
            return false;
        }
        if (isEmpty($scope.outlet.AddLine2)) {
            showValidationErr(R.street_is_empty, function () { $("#inputAdd2").focus(); });
            return;
        }
        if (isEmpty($scope.outlet.District)) {
            showErrorAdv(R.district_is_empty, function () { $("#inputDistrict").focus(); });
            return false;
        }

        if ($scope.outlet.TotalVolume == undefined || $scope.outlet.TotalVolume == null) {
            showValidationErr(R.total_is_invald, function () { $("#total").focus(); });
            return false;
        }

        if ($scope.outlet.TotalVolume == 0) {
            showValidationErr(R.total_is_empty, function () { $("#total").focus(); });
            return false;
        }

        if ($scope.outlet.VBLVolume == undefined || $scope.outlet.VBLVolume == null) {
            showErrorAdv(R.vbl_is_invald, function () { $("#vblvolume").focus(); });
            return false;
        }

        //if ($scope.outlet.VBLVolume == 0) {
        //    showErrorAdv(R.vbl_is_empty, function () { $("#vblvolume").focus(); });
        //    return false;
        //}

        if ($scope.outlet.VBLVolume > $scope.outlet.TotalVolume) {
            showValidationErr(R.vbl_cannot_greater_than_total, function () { $("#total").focus(); });
            return false;
        }

        if (isApproved && $scope.canComment) {
            if (isEmpty($scope.outlet.Note)) {
                showErrorAdv(R.comment_is_empty, function () { $("#inputComment").focus(); });
                return false;
            }
        }

        return true;
    }

    function validateRange(lat, lng) {
        var d = calcDistance({ Lat: lat, Lng: lng }, { Lat: $scope.outlet.Latitude, Lng: $scope.outlet.Longitude });
        if (d > $scope.config.audit_range) {
            var errMsg = R.ovar_audit_distance.replace('{distance}', $scope.config.audit_range.toString());
            showValidation(errMsg);
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

        //if (!isEmpty($scope.outlet.ID)) {
        //    t = t.concat(' (', $scope.outlet.ID, ')');
        //} else {
        //    t = t.concat(' (', $scope.outlet.ID, ')');
        //}
        
        return t;
    }

    function loadImages() {
        $scope.image1URL = getImageURL($scope.outlet.StringImage1);
       
        $scope.image2URL = getImageURL($scope.outlet.StringImage2);
       
        $scope.image3URL = getImageURL($scope.outlet.StringImage3);
        
        //findOutlet(config.tbl_outlet, $scope.outlet.PRowID, function (localOut) {
        //    if (localOut == null) {
        //        if (!isEmpty($scope.outlet.StringImage1)) {
        //            $scope.image1URL = getImageURL($scope.outlet.StringImage1);
        //            log($scope.image1URL);
        //        }

        //        if (!isEmpty($scope.outlet.StringImage2)) {
        //            $scope.image2URL = getImageURL($scope.outlet.StringImage2);
        //        }
        //        if (!isEmpty($scope.outlet.StringImage3)) {
        //            $scope.image3URL = getImageURL($scope.outlet.StringImage3);
        //        }
        //    } else {
        //        if (!isEmpty(localOut.StringImage1 !== '')) {
        //            $scope.image1URL = getImageURL(localOut.StringImage1);
        //            log($scope.image1URL);
        //        }

        //        if (!isEmpty(localOut.StringImage2 !== '')) {
        //            $scope.image2URL = getImageURL(localOut.StringImage2);
        //            log($scope.image2URL);
        //        }

        //        if (!isEmpty(localOut.StringImage3 !== '')) {
        //            $scope.image3URL = getImageURL(localOut.StringImage3);
        //            log($scope.image3URL);
        //        }
        //    }
        //})
    }
    loadImages();

}