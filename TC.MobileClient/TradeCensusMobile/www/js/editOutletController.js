/// <reference path="tc.outletAPI.js" />

function editOutletController($scope, $mdDialog) {
    log('view outlet ' + $scope.outlet.ID.toString());
    $scope.R = R;

    $scope.isAuditor = user.hasAuditRole;

    $scope.needAudit = user.hasAuditRole &&
                       $scope.outlet.AuditStatus == StatusPost && $scope.outlet.PersonID != user.id;

    if ($scope.needAudit) {
        $scope.outlet.AuditAction = 1; //approve
    }

    $scope.canRevise = $scope.outlet.AuditStatus == StatusPost && $scope.outlet.PersonID == user.id;
    $scope.canChangeOpenClose = user.hasAuditRole || $scope.outlet.AuditStatus != StatusPost;
    $scope.canChangeTrackNonTrack = user.hasAuditRole || $scope.outlet.AuditStatus != StatusPost;

    var allowCapture = user.hasAuditRole || $scope.outlet.AuditStatus != StatusPost;
    $scope.allowCapture = allowCapture &&
        (isEmpty($scope.outlet.StringImage1) || isEmpty($scope.outlet.StringImage2) || isEmpty($scope.outlet.StringImage3));

    $scope.showDraft = $scope.outlet.IsDraft;
    $scope.outlet.modifiedImage1 = false;
    $scope.outlet.modifiedImage2 = false;
    $scope.outlet.modifiedImage3 = false;
    $scope.isDeleted = false;

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
            if (!allowCapture) return;
            if (!isEmpty($scope.outlet.StringImage1)) {
                openImgViewer($scope.outlet.Name, $scope.image1URL, function (imageURI) {
                    log('Update imageURI 1: ' + imageURI);
                    if (imageURI != null) {
                        $scope.outlet.StringImage1 = imageURI;
                        $scope.outlet.modifiedImage1 = true;
                        $scope.image1URL = getImageURL($scope.outlet.StringImage1);
                        var image = document.getElementById('outletImg1');
                        image.src = imageURI;
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
                        $scope.image2URL = getImageURL($scope.outlet.StringImage2);
                        var image = document.getElementById('outletImg2');
                        image.src = imageURI;
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
                        $scope.image3URL = getImageURL($scope.outlet.StringImage3);
                        var image = document.getElementById('outletImg3');
                        image.src = imageURI;
                    }
                });
            }
        } else {
            captureImage(function (imageURI) {
                if (isEmpty($scope.outlet.StringImage1)) {
                    $scope.outlet.StringImage1 = imageURI;
                    $scope.outlet.modifiedImage1 = true;
                    $scope.image1URL = getImageURL($scope.outlet.StringImage1);
                    var image = document.getElementById('outletImg1');
                    image.src = imageURI;
                } else if (isEmpty($scope.outlet.StringImage2)) {
                    $scope.outlet.StringImage2 = imageURI;
                    $scope.outlet.modifiedImage2 = true;
                    $scope.image2URL = getImageURL($scope.outlet.StringImage2);
                    var image = document.getElementById('outletImg2');
                    image.src = imageURI;
                } else if (isEmpty($scope.outlet.StringImage3)) {
                    $scope.outlet.StringImage3 = imageURI;
                    $scope.outlet.modifiedImage3 = true;
                    $scope.image3URL = getImageURL($scope.outlet.StringImage3);
                    var image = document.getElementById('outletImg3');
                    image.src = imageURI;
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

        $mdDialog.hide(true);
    };

    $scope.cancelUpdate = function () {
        $mdDialog.cancel();
    };

    $scope.reviseOutlet = function () {        
        $scope.outlet.IsDraft = true; // POST
        $mdDialog.hide(true);
    }

    //$scope.openCloseChanged = function () {
    //    log('Change open/close status: ' + $scope.outlet.IsOpened);
    //    if($scope.outlet.IsOpened) {
    //        $scope.outlet.CloseDate = '';
    //    } else {
    //        if( $scope.outlet.CloseDate == '')
    //            $scope.outlet.CloseDate = currentDate();
    //    }
    //}

    function captureImage(onSuccess, onError) {
        try {
			if(isDev){
				onSuccess('D:\\Untitled.png ');
			}else{
            navigator.camera.getPicture(onSuccess, onError,
                {
                    quality: 50,
                    correctOrientation: true,
                    destinationType: Camera.DestinationType.FILE_URI // DATA_URL for base64 => not recommend due to memory issue
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
            if (stringImage.indexOf('/images') > -1) {
                imageUrl = buildURL($scope.config.protocol, $scope.config.ip, $scope.config.port, imageUrl);
            }
            return imageUrl;
        }
        return '';
    }
}