/// <reference path="tc.mapAPI.js" />
/// <reference path="tc.outletAPI.js" />

function editOutletController($scope, $mdDialog) {
    log('view outlet ' + $scope.outlet.ID.toString());
    $scope.R = R;
    isOutletDlgOpen = true;
    $scope.isOutletClosed = !$scope.outlet.IsOpened;
    $scope.isAuditor = user.hasAuditRole;
    $scope.isSaler = !user.hasAuditRole;
    
    $scope.isDeleted = false;
    $scope.viewCancel = !$scope.isAuditor;
    if ($scope.outlet.AuditStatus == StatusAuditAccept || $scope.outlet.AuditStatus == StatusAuditDeny || $scope.outlet.AuditStatus == StatusDone) {
        setViewOnly();  // Outlet is DONE => VIEW only
    } else {
        $scope.needAudit = user.hasAuditRole && $scope.outlet.AuditStatus == StatusPost && $scope.outlet.PersonID != user.id;
        if (user.hasAuditRole && $scope.outlet.PersonID != userID) {
            $scope.viewSave = false;
            $scope.viewApprove = true;
            $scope.viewDeny = true;
            $scope.disableOpenClose = true;
            $scope.disableTracking = true;
          
            if ($scope.outlet.AuditStatus == StatusInitial) {
                setViewOnly();
            } else if ($scope.outlet.AuditStatus == StatusEdit || $scope.outlet.AuditStatus == StatusPost) {
                if ($scope.needAudit) $scope.outlet.AuditAction = 1; //approve
                $scope.canRevise = $scope.outlet.AuditStatus == StatusPost && $scope.outlet.PersonID == user.id;
                $scope.canChangeOpenClose = true;
                $scope.canChangeTrackNonTrack = true;
                $scope.disableComment = false;
                $scope.allowCapture = true;
            } else {
                setViewOnly();
            }
        } else {
            $scope.viewSave = true;
            if ($scope.outlet.AuditStatus == StatusInitial) {
                $scope.canChangeOpenClose = true;
                $scope.canChangeTrackNonTrack = true;
                $scope.disableOpenClose = $scope.outlet.IsOpened;
                $scope.disableTracking = $scope.outlet.Tracking == 1;
                $scope.disableComment = false;
                $scope.allowCapture = true;
            } else if ($scope.outlet.AuditStatus == StatusNew) {
                // show not display here
            } else if ($scope.outlet.AuditStatus == StatusPost) {
                setViewOnly();
                $scope.canRevise = $scope.outlet.AuditStatus == StatusPost && $scope.outlet.PersonID == user.id;
            } else if ($scope.outlet.AuditStatus == StatusEdit) {
                $scope.canChangeOpenClose = true;
                $scope.canChangeTrackNonTrack = true;
                $scope.disableOpenClose = $scope.outlet.IsOpened;
                $scope.disableTracking = $scope.outlet.Tracking == 1;
                $scope.disableComment = false;
                $scope.allowCapture = true;
                $scope.canRevise = $scope.outlet.AuditStatus == StatusPost && $scope.outlet.PersonID == user.id;
            } else {
                setViewOnly();
            }
        }
    }

    //if ($scope.needAudit) {
    //    $scope.outlet.AuditAction = 1; //approve
    //}
    //$scope.canRevise = $scope.outlet.AuditStatus == StatusPost && $scope.outlet.PersonID == user.id;
    //$scope.canChangeOpenClose = user.hasAuditRole || $scope.outlet.AuditStatus != StatusPost;
    //$scope.canChangeTrackNonTrack = user.hasAuditRole || $scope.outlet.AuditStatus != StatusPost;

    var allowCapture = $scope.allowCapture;
    $scope.allowCapture = allowCapture &&
        (isEmpty($scope.outlet.StringImage1) || isEmpty($scope.outlet.StringImage2) || isEmpty($scope.outlet.StringImage3));

    $scope.showDraft = $scope.outlet.IsDraft;
    $scope.outlet.modifiedImage1 = false;
    $scope.outlet.modifiedImage2 = false;
    $scope.outlet.modifiedImage3 = false;
    $scope.isDeleted = false;

    if (!isEmpty($scope.outlet.StringImage1)) {        
        $scope.image1URL = getImageURL($scope.outlet.StringImage1);
        log($scope.image1URL);
    } 
    if (!isEmpty($scope.outlet.StringImage2)) {
        $scope.image2URL = getImageURL($scope.outlet.StringImage2);        
    }
    if (!isEmpty($scope.outlet.StringImage3)) {
        $scope.image3URL = getImageURL($scope.outlet.StringImage3);
    }

    $scope.capture = function (i) {
        if (i == 1) {
            if (!allowCapture) return;
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
            if (!allowCapture) return;
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
            if (!allowCapture) return;
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
                    //$("#img").attr('src', imageURI);
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
                $scope.allowCapture = isEmpty($scope.outlet.StringImage1) ||
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

    $scope.saveUpdate = function () {
        log('Change open/close status: ' + $scope.outlet.IsOpened);
        if($scope.outlet.IsOpened) {
            $scope.outlet.CloseDate = '';
        } else {
            if( $scope.outlet.CloseDate == '')
                $scope.outlet.CloseDate = currentDate();
        }
        if ($scope.isAuditor && $scope.outlet.AuditStatus == StatusEdit)
            $scope.outlet.AuditStatus = StatusDone;
           
        $scope.outlet.IsOpened = !$scope.isOutletClosed;

        $mdDialog.hide(true);
        try { $scope.$apply(); } catch (er) { }
    };

    $scope.cancelUpdate = function () {

        $mdDialog.cancel();
        try { $scope.$apply(); } catch (er) { }
    };

    $scope.reviseOutlet = function () {
        var confirmText = R.revise_outlet_confirm.replace("{outletname}", $scope.outlet.Name);
        showConfirm(R.revise_outlet, confirmText, function () {
            $scope.outlet.IsDraft = true; // POST
            $mdDialog.hide(true);
            try { $scope.$apply(); } catch (er) { }
        }, function () { });
    }

    $scope.approve = function () {
        showDlg(R.get_current_location, R.please_wait);
        getCurPosition(false, function (lat, lng) {
            hideDlg();
            if (!validateAuditor(lat, lng)) return;

            log('Change open/close status: ' + $scope.outlet.IsOpened);
            if ($scope.outlet.IsOpened) {
                $scope.outlet.CloseDate = '';
            } else {
                if ($scope.outlet.CloseDate == '')
                    $scope.outlet.CloseDate = currentDate();
            }
            if ($scope.outlet.AuditStatus == StatusEdit)
                $scope.outlet.AuditStatus = StatusExitingAccept;
            else {
                $scope.outlet.AuditStatus = StatusAuditAccept;
            }

            $mdDialog.hide(true);
            try { $scope.$apply(); } catch (er) { }
        }, function () {
            hideDlg();
            showError(R.cannot_approve_or_deny);
        })
    }

    $scope.deny = function () {
        showDlg(R.get_current_location, R.please_wait);
        getCurPosition(false, function (lat, lng) {
            hideDlg();
            if (!validateAuditor(lat, lng)) return;

            log('Change open/close status: ' + $scope.outlet.IsOpened);
            if ($scope.outlet.IsOpened) {
                $scope.outlet.CloseDate = '';
            } else {
                if ($scope.outlet.CloseDate == '')
                    $scope.outlet.CloseDate = currentDate();
            }
            if ($scope.outlet.AuditStatus == StatusEdit)
                $scope.outlet.AuditStatus = StatusExitingDeny;
            else {
                $scope.outlet.AuditStatus = StatusAuditDeny;
            }

            $mdDialog.hide(true);
            try { $scope.$apply(); } catch (er) { }

        }, function () {
            hideDlg();
            showError(R.cannot_approve_or_deny);
        })
    }

    function validateAuditor(lat, lng) {
        if (isEmpty($scope.outlet.Note)) {
            showErrorAdv(R.comment_is_empty, function () { $("#inputComment").focus(); });
            return false;
        }

        var d = calcDistance({ Lat: lat, Lng: lng }, { Lat: $scope.outlet.Latitude, Lng: $scope.outlet.Longitude });
        if (d > $scope.config.audit_range) {
            var errMsg = R.ovar_audit_distance.replace('{distance}', $scope.config.audit_range.toString());

            showErrorAdv(errMsg, function () { $("#inputComment").focus(); });
            return false;
        }

        if (isEmpty($scope.outlet.Phone)) {
            showErrorAdv(R.comment_is_empty, function () { $("#inputComment").focus(); });
            return false;
        }

        return true;
    }

    function setViewOnly() {
        $scope.viewSave = false;
        $scope.viewCancel = true;
        $scope.viewApprove = false;
        $scope.viewDeny = false;

        $scope.disableOpenClose = true;
        $scope.disableTracking = true;
        $scope.disableComment = true;
        $scope.needAudit = false;
        $scope.canRevise = false;
        $scope.allowCapture = false;
        $scope.canChangeOpenClose = true;       // view only
        $scope.canChangeTrackNonTrack = true;   // view only
        $scope.isDeleted = false;
    }

    function captureImage(onSuccess, onError) {
        try {
			if(isDev){
				onSuccess('D:\\Untitled.png ');
			}else{
			    navigator.camera.getPicture(onSuccess, onError,
                    {
                        quality: 30,
                        targetWidth: 800,
                        targetHeight: 600,
                        correctOrientation: true,
                        destinationType: Camera.DestinationType.FILE_URI, // DATA_URL for base64 => not recommend due to memory issue
                    });
			}
        } catch (err) {
            showError(err);
        }
    }

    function getImageURL(stringImage) {
        log(stringImage);
        if (!isEmpty(stringImage)) {
            var imageUrl = stringImage;
            if (!isEmpty(stringImage)){
                if (stringImage.toUpperCase().indexOf('/IMAGES') > -1) {
                    imageUrl = imageURL($scope.config.protocol, $scope.config.ip, $scope.config.port, imageUrl);
                } else { //if (stringImage.indexOf('base64') > -1) {
                    imageUrl = 'data:image/jpeg;base64,' + imageUrl;
                }
            }
            return imageUrl;
        }
        return '';
    }
}