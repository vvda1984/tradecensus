function editOutletController($scope, $mdDialog) {
    $scope.capture = function (i) {
        captureImage(function (imageURI) {
            var image = document.getElementById('outletImg' + i.toString());
            image.src = imageURI;
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
}