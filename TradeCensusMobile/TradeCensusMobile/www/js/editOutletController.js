function editOutletController($scope, $mdDialog) {
    log('view outlet ' + $scope.outlet.ID.toString());
    $scope.needAudit = $scope.user.hasAuditRole &&
                       $scope.outlet.AuditStatus == -1 &&
                       $scope.outlet.InputBy != $scope.user.id;

    $scope.allowCapture = isEmpty($scope.outlet.StringImage1) ||
                          isEmpty($scope.outlet.StringImage2) ||
                          isEmpty($scope.outlet.StringImage3);    

    $scope.outlet.modifiedImage1 = false;
    $scope.outlet.modifiedImage2 = false;
    $scope.outlet.modifiedImage3 = false;

    if (!isEmpty($scope.outlet.StringImage1)) {        
        $scope.image1URL = getImageURL($scope.outlet.StringImage1);      
    } 
    if (!isEmpty($scope.outlet.StringImage2)) {
        $scope.image2URL = getImageURL($scope.outlet.StringImage1);        
    }
    if (!isEmpty($scope.outlet.StringImage3)) {
        $scope.image3URL = getImageURL($scope.outlet.StringImage1);
    }

    $scope.capture = function (i) {
        if (i == 1) {
            if (!isEmpty($scope.outlet.StringImage1)) {                
                openImgViewer($scope.outlet.Name, $scope.image1URL);
            }            
        } else if (i == 2) {
            if (!isEmpty($scope.outlet.StringImage2)) {
                openImgViewer($scope.outlet.Name, $scope.image2URL);
            }                        
        } else if (i == 3) {
            if (!isEmpty($scope.outlet.StringImage3)) {
                openImgViewer($scope.outlet.Name, $scope.image3URL);
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
                showError(err);
            });
        }
    }
    $scope.openedOptionVisible = !$scope.outlet.IsOpened;
    $scope.trackedOptionVisible = !$scope.outlet.IsTracked;
    $scope.saveUpdate = function () {
        $mdDialog.hide(true);
    };

    $scope.cancelUpdate = function () {
        $mdDialog.cancel();
    };

    function captureImage(onSuccess, onError) {
        try {
            navigator.camera.getPicture(onSuccess, onError,
                {
                    quality: 50,
                    correctOrientation: true,
                    destinationType: Camera.DestinationType.FILE_URI // DATA_URL for base64 => not recommend due to memory issue
                });
        } catch (err) {
            showError(err);
        }
    }

    function getImageURL(stringImage) {
        log(stringImage);
        if (!isEmpty(stringImage)) {
            var imageUrl = stringImage;
            if (stringImage.lastIndexOf('/images') > 0) {
                imageUrl = buildURL($scope.config.protocol, $scope.config.ip, $scope.config.port, imageUrl);
            }
            return imageUrl;
        }
        return '';
    }
}