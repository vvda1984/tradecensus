function newOutletController($scope, $mdDialog) {
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

    $scope.saveUpdate = function () {
        if (isEmpty($scope.outlet.Name)) {
            showError('Outlet name is empty!');
            return;
        }
        if (isEmpty($scope.outlet.AddLine)) {
            showError('House number is empty!');
            return;
        }
        if (isEmpty($scope.outlet.AddLine2)) {
            showError('Street is empty!');
            return;
        }
        if (isEmpty($scope.outlet.District)) {
            showError('District is empty!');
            return;
        }
        if (isEmpty($scope.outlet.Phone)) {
            showError('Phone is empty!');
            return;
        }
        if (isEmpty($scope.outlet.TotalVolume)) {
            showError('Total is empty!');
            return;
        }
        if (isEmpty($scope.outlet.VBLVolume)) {
            showError('VBL Volume is empty!');
            return;
        }

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