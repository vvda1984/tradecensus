function editOutletController($scope, $mdDialog) {
    log('view outlet ' + $scope.outlet.ID.toString());

    log('StringImage1: ' + $scope.outlet.StringImage1);
    $scope.image1URL = getImageURL($scope.outlet.StringImage1);
    $scope.image2URL = getImageURL($scope.outlet.StringImage2);
    $scope.image3URL = getImageURL($scope.outlet.StringImage3);

    log('URL 1' + $scope.image1URL);
    log('URL 2' + $scope.image2URL);
    log('URL 3' + $scope.image3URL);

    $scope.capture = function (i) {
        captureImage(function (imageURI) {
            if (i == 1) {
                $scope.image1URL = imageURI;
            } else if (i == 2) {
                $scope.image2URL = imageURI;
            } else if (i == 3) {
                $scope.image3URL = imageURI;
            }

            //var image = document.getElementById('outletImg' + i.toString());
            //image.src = imageURI;
            //var image = document.getElementById('outletImg' + i);
            //image.src = "data:image/jpeg;base64," + imageData;
        }, function (err) {
            showError(err);
        });
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
            if (stringImage.startsWith('/images')) {
                imageUrl = buildURL($scope.config.protocol, $scope.config.ip, $scope.config.port, imageUrl);
            }
            return imageUrl;
        }
        return '';
    }
}