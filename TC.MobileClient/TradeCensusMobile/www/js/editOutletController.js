/// <reference path="tc.mapAPI.js" />
/// <reference path="tc.databaseAPI.js" />
/// <reference path="tc.outletAPI.js" />

function editOutletController($scope, $mdDialog) {
    isOutletDlgOpen = true;

    $scope.R = R;
    var orgIsOpen = $scope.outlet.IsOpened;
    var orgTracked = $scope.outlet.IsTracked;
    $scope.isOutletClosed = !$scope.outlet.IsOpened;
    $scope.isAuditor = user.hasAuditRole;
    $scope.isSaler = !user.hasAuditRole;
    $scope.outlet.isChanged = false;

    var title = $scope.outlet.Name;
    if ($scope.outlet.ID != 60000000) {
        title = title + ' (' + $scope.outlet.ID.toString() + ')';
    }
    if ($scope.outlet.AuditStatus == StatusAuditAccept || $scope.outlet.AuditStatus == StatusExitingAccept) {
        title = title + ' - Approved';
    } else if ($scope.outlet.AuditStatus == StatusAuditDeny || $scope.outlet.AuditStatus == StatusAuditDeny) {
        title = title + ' - Denied';
    }
    $scope.title = title;
    
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
            } else if ($scope.outlet.AuditStatus == StatusExitingPost || $scope.outlet.AuditStatus == StatusPost) {
                if ($scope.needAudit) $scope.outlet.AuditAction = 1; //approve
                $scope.canRevise = $scope.outlet.canRevise; //$scope.outlet.AuditStatus == StatusPost && $scope.outlet.PersonID == user.id;
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
                if ($scope.outlet.IsOpened && $scope.outlet.Tracking == 1) {
                    setViewOnly();
                } else {
                    $scope.canChangeOpenClose = true;
                    $scope.canChangeTrackNonTrack = true;
                    $scope.disableOpenClose = $scope.outlet.IsOpened;
                    if ($scope.outlet.IsOpened)
                        $scope.disableTracking = $scope.outlet.Tracking == 1;
                    else
                        $scope.disableTracking = false;
                        
                    $scope.disableComment = false;
                    $scope.allowCapture = true; //$scope.outlet.AuditStatus != StatusInitial;
                }
            } else if ($scope.outlet.AuditStatus == StatusNew) {
                // show not display here
            } else if ($scope.outlet.AuditStatus == StatusPost) {
                setViewOnly();
                $scope.canRevise = $scope.outlet.canRevise; //$scope.outlet.AuditStatus == StatusPost && $scope.outlet.PersonID == user.id;
            } else if ($scope.outlet.AuditStatus == StatusEdit) {
                $scope.canPost = true;
                $scope.canRevert = true;
                $scope.canChangeOpenClose = true;
                $scope.canChangeTrackNonTrack = true;
                $scope.disableComment = false;
                $scope.allowCapture = true;
                $scope.canRevise = $scope.outlet.canRevise;//$scope.outlet.AuditStatus == StatusPost && $scope.outlet.PersonID == user.id;

                //$scope.disableOpenClose = false;
                //$scope.disableTracking = false;

                if ($scope.outlet.PStatus == 1) {
                    setViewOnly();
                } else if ($scope.outlet.PStatus == 2){
                    $scope.disableOpenClose = true;
                    $scope.disableTracking = false;
                } else if ($scope.outlet.PStatus == 2) {
                    $scope.disableOpenClose = false;
                    $scope.disableTracking = false;
                }
               
                //if (($scope.outlet.PStatus & 4) > 0) {
                //    $scope.disableOpenClose = false;
                //    $scope.disableTracking = false;
                //} else if (($scope.outlet.PStatus & 2) > 0) {
                //    $scope.disableOpenClose = false;
                //    $scope.disableTracking = false; //$scope.outlet.Tracking == 1;
                //} else if (($scope.outlet.PStatus & 1) > 0) {
                //    $scope.disableOpenClose = $scope.outlet.IsOpened;
                //    $scope.disableTracking = false;
                //} else {
                //    $scope.disableOpenClose = $scope.outlet.IsOpened;
                //    $scope.disableTracking = $scope.outlet.Tracking == 1;
                //}
            } else if ($scope.outlet.AuditStatus == StatusExitingPost) {
                setViewOnly();
                $scope.canRevise = $scope.outlet.canRevise; //$scope.outlet.AuditStatus == StatusPost && $scope.outlet.PersonID == user.id;
            } else {
                setViewOnly();
            }
        }
    }

    var allowCapture = $scope.allowCapture;
    $scope.allowCapture = allowCapture &&
        (isEmpty($scope.outlet.StringImage1) || isEmpty($scope.outlet.StringImage2) || isEmpty($scope.outlet.StringImage3));

    $scope.showDraft = $scope.outlet.IsDraft;
    $scope.outlet.modifiedImage1 = false;
    $scope.outlet.modifiedImage2 = false;
    $scope.outlet.modifiedImage3 = false;
    $scope.isDeleted = false;

    $scope.image1URL = getImageURL($scope.outlet.StringImage1);
    $scope.image2URL = getImageURL($scope.outlet.StringImage2);
    $scope.image3URL = getImageURL($scope.outlet.StringImage3);

    var orgOutlet = cloneObj($scope.outlet);

    $scope.capture = function (i) {
        if (i == 1) {
            //if (!allowCapture) return;
            if (!isEmpty($scope.outlet.StringImage1)) {
                openImgViewer($scope.outlet.Name, !allowCapture, $scope.image1URL, function (imageURI) {
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
            //if (!allowCapture) return;
            if (!isEmpty($scope.outlet.StringImage2)) {
                openImgViewer($scope.outlet.Name, !allowCapture, $scope.image2URL, function (imageURI) {
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
            //if (!allowCapture) return;
            if (!isEmpty($scope.outlet.StringImage3)) {
                openImgViewer($scope.outlet.Name, !allowCapture, $scope.image3URL, function (imageURI) {
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

        $scope.outlet.isChanged = true;
    }

    $scope.saveUpdate = function () {
        checkDistance(false, function () {
            log('Change open/close status: ' + $scope.outlet.IsOpened);
            setOpenCloseValue();

            if (!validate())
                return;

            //if ($scope.isAuditor && $scope.outlet.AuditStatus == StatusExitingPost)
            //    $scope.outlet.AuditStatus = StatusDone;

            if ($scope.outlet.AuditStatus == StatusInitial) {
                $scope.outlet.AuditStatus = StatusEdit;
            }

            $mdDialog.hide(true);
        });
    };

    $scope.cancelUpdate = function () {
        $mdDialog.cancel();
        try { $scope.$apply(); } catch (er) { }
    };

    $scope.reviseOutlet = function () {
        var confirmText = R.revise_outlet_confirm.replace("{outletname}", $scope.outlet.Name);
        showConfirm(R.revise_outlet, confirmText, function () {
            if ($scope.outlet.AuditStatus == StatusPost) {
                $scope.outlet.IsDraft = true; // POST
                $scope.outlet.AuditStatus = StatusNew;
            }
            else if($scope.outlet.AuditStatus == StatusExitingPost ) {
                $scope.outlet.IsExistingDraft = true; // POST
                $scope.outlet.AuditStatus = StatusEdit;  //Revise
            }

            $scope.outlet.isChanged = true;
            $mdDialog.hide(true);
        }, function () { });
    }

    $scope.revertOutlet = function () {
        $mdDialog.cancel();
        return; //n/a

        //var confirmText = R.revert_outlet_confirm.replace("{outletname}", $scope.outlet.Name);
        //showConfirm(R.revert_outlet, confirmText, function () {
        //    $scope.outlet.isRevert = true;
        //    $scope.outlet.isChanged = true;
        //    $mdDialog.hide(true);
        //}, function () { });
    }

    $scope.postOutlet = function () {
        var confirmText = R.post_outlet_confirm.replace("{outletname}", $scope.outlet.Name);
        showConfirm(R.post_outlet, confirmText, function () {
            checkDistance(true, function () {
                if ($scope.outlet.AuditStatus == StatusEdit) {
                    $scope.outlet.IsExistingDraft = false; // POST
                    $scope.outlet.AuditStatus = StatusExitingPost;
                } else if ($scope.outlet.AuditStatus == StatusNew) {
                    $scope.outlet.IsDraft = false; // POST
                    $scope.outlet.AuditStatus = StatusPost;
                }

                $scope.outlet.isChanged = true;
                $mdDialog.hide(true);
            });
        }, function () { });
    }

    $scope.approve = function () {
        if (!validate()) return;

        checkDistance(false, function () {
            log('Change open/close status: ' + $scope.outlet.IsOpened);
            setOpenCloseValue();
            if ($scope.outlet.AuditStatus == StatusExitingPost)
                $scope.outlet.AuditStatus = StatusExitingAccept;
            else
                $scope.outlet.AuditStatus = StatusAuditAccept;

            $scope.outlet.isChanged = true;

            $mdDialog.hide(true);
        });

        //showDlg(R.get_current_location, R.please_wait);
        //getCurPosition(false, function (lat, lng) {
        //    hideDlg();
        //    if (!validateRange(lat, lng)) return;

        //    log('Change open/close status: ' + $scope.outlet.IsOpened);
        //    setOpenCloseValue();
        //    if ($scope.outlet.AuditStatus == StatusExitingPost)
        //        $scope.outlet.AuditStatus = StatusExitingAccept;
        //    else {
        //        $scope.outlet.AuditStatus = StatusAuditAccept;
        //    }
        //    $scope.outlet.isChanged = true;

        //    $mdDialog.hide(true);
        //    try { $scope.$apply(); } catch (er) { }
        //}, function () {
        //    hideDlg();
        //    showError(R.cannot_approve_or_deny);
        //})
    }

    $scope.deny = function () {
        if (!validate()) return;

        checkDistance(false, function () {
            log('Change open/close status: ' + $scope.outlet.IsOpened);
            setOpenCloseValue();

            if ($scope.outlet.AuditStatus == StatusExitingPost)
                $scope.outlet.AuditStatus = StatusExitingDeny;
            else
                $scope.outlet.AuditStatus = StatusAuditDeny;

            $scope.outlet.isChanged = true;
            $mdDialog.hide(true);
        });

        //showDlg(R.get_current_location, R.please_wait);
        //getCurPosition(false, function (lat, lng) {
        //    hideDlg();
        //    if (!validateRange(lat, lng)) return;

        //    log('Change open/close status: ' + $scope.outlet.IsOpened);
        //    setOpenCloseValue();

        //    if ($scope.outlet.AuditStatus == StatusExitingPost)
        //        $scope.outlet.AuditStatus = StatusExitingDeny;
        //    else {
        //        $scope.outlet.AuditStatus = StatusAuditDeny;
        //    }

        //    $scope.outlet.isChanged = true;
        //    $mdDialog.hide(true);
        //    try { $scope.$apply(); } catch (er) { }

        //}, function () {
        //    hideDlg();
        //    showError(R.cannot_approve_or_deny);
        //})
    }

    function validateRange(lat, lng) {
        var d = parseInt(calcDistance({ Lat: lat, Lng: lng }, { Lat: $scope.outlet.Latitude, Lng: $scope.outlet.Longitude }));
        if (d > $scope.config.audit_range) {
            //var errMsg = R.ovar_audit_distance.replace('{distance}', $scope.config.audit_range.toString());
            //errMsg = errMsg.replace('{value}', d);

            var errMsg = R.validate_distance.replace('{distance}', config.audit_range.toString());
            errMsg = errMsg.replace('{distance}', config.audit_range.toString());
            showValidationErr(errMsg);
            return false;
        }
        return true;
    }

    function setOpenCloseValue() {
        $scope.outlet.IsOpened = !$scope.isOutletClosed;

        if ($scope.outlet.IsOpened) {
            $scope.outlet.CloseDate = '';
        } else {
            if ($scope.outlet.CloseDate == '')
                $scope.outlet.CloseDate = currentDate();
        }
    }

    function setViewOnly() {
        $scope.viewSave = false;
        $scope.viewCancel = true;
        $scope.viewApprove = false;
        $scope.viewDeny = false;
        $scope.canRevert = false;

        $scope.disableOpenClose = true;
        $scope.disableTracking = true;
        $scope.disableComment = true;
        $scope.needAudit = false;
        $scope.canRevise = false;
        $scope.canPost = false;
        $scope.allowCapture = false;
        $scope.canChangeOpenClose = true;       // view only
        $scope.canChangeTrackNonTrack = true;   // view only
        $scope.isDeleted = false;
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

    function loadImages() {
        return;
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
        //        log('Found local outlet');
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

    function validate() {
        if ($scope.isAuditor && isEmpty($scope.outlet.Note)) {
            showErrorAdv(R.comment_is_empty, function () { $("#inputComment").focus(); });
            return false;
        }

        if ($scope.config.enable_devmode) {
            $scope.outlet.isChanged = true;
            return true;
        }

        if ($scope.outlet.IsOpened != orgIsOpen || $scope.outlet.IsTracked != orgTracked || $scope.outlet.Status == StatusEdit) {
            $scope.outlet.isChanged = true;

            if (isEmpty($scope.outlet.StringImage1) && isEmpty($scope.outlet.StringImage2) && isEmpty($scope.outlet.StringImage3)) {
                showValidationErr(R.need_to_capture);
                return false;
            }
        }

        return true;
    }

    function checkDistance(detectedChanged, callback) {
        if (!detectedChanged) {
            getCurPosition(false, function (lat, lng) {
                hideDlg();
                if (!validateRange(lat, lng)) return;

                callback();
            }, function () {
                hideDlg();
                showError(R.msg_validate_accuracy_1);
            });
        } else {
            if (isModifed(orgOutlet, $scope.outlet) || $scope.isOutletClosed !== !$scope.outlet.IsOpened) {
                showDlg(R.get_current_location, R.please_wait);
                getCurPosition(false, function (lat, lng) {
                    hideDlg();
                    if (!validateRange(lat, lng)) return;

                    callback();
                }, function () {
                    hideDlg();
                    showError(R.msg_validate_accuracy_1);
                });
            } else {
                callback();
            }
        }
    }
}