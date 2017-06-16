/// <reference path="tc.mapAPI.js" />
/// <reference path="tc.databaseAPI.js" />
/// <reference path="tc.outletAPI.js" />

function editOutletController($scope, $mdDialog, $timeout) {
    isOutletDlgOpen = true;
    isViewOnly = false;
    $scope.outlet = OUTLET.dialog.outlet();
    if ($scope.outlet.TaxID === "null" || $scope.outlet.TaxID === null) $scope.outlet.TaxID = '';
    if ($scope.outlet.LegalName === "null" || $scope.outlet.LegalName === null) $scope.outlet.LegalName = '';

    function hideDialog(answer) {
        //$mdDialog.hide(answer);
        OUTLET.dialog.close(answer, $scope.outlet);
    };

    $scope.R = R;
    var orgIsOpen = $scope.outlet.IsOpened;
    var orgTracked = $scope.outlet.IsTracked;
    $scope.isOutletClosed = !$scope.outlet.IsOpened;
    $scope.isAuditor = user.hasAuditRole;
    $scope.isSaler = !user.hasAuditRole;
    $scope.outlet.isChanged = false;
    $scope.showImage4 = config.enable_check_in > 0;
    
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
    $scope.allowCapture = true;

    var isSameSystem = false;

    if ($scope.outlet.AuditStatus == 0) {
        isSameSystem = true;
    } else {
        if ((user.role == 0 || user.role == 1) && ($scope.outlet.AmendByRole == 0 || $scope.outlet.AmendByRole == 1))
            isSameSystem = true;
        else if ((user.role == 2 || user.role == 3) && ($scope.outlet.AmendByRole == 2 || $scope.outlet.AmendByRole == 3))
            isSameSystem = true;
    }

    if (!user.hasAuditRole) isSameSystem = true;

    if (!isSameSystem) {
        setViewOnly();
    } else {
        if ($scope.outlet.AuditStatus == StatusAuditAccept ||
            $scope.outlet.AuditStatus == StatusAuditDeny ||
            $scope.outlet.AuditStatus == StatusDone) {
            setViewOnly();  // Outlet is DONE => VIEW only
        } else {
            $scope.needAudit = user.hasAuditRole && $scope.outlet.AuditStatus == StatusPost && $scope.outlet.PersonID != user.id;
            if (user.hasAuditRole && $scope.outlet.PersonID != userID ) {
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
                    if ($scope.outlet.AmendBy != user.id) {
                        setViewOnly();
                    } else {
                        $scope.canPost = true;
                        $scope.canRevert = true;
                        $scope.canChangeOpenClose = true;
                        $scope.canChangeTrackNonTrack = true;
                        $scope.disableComment = false;
                        $scope.allowCapture = true;
                        $scope.canRevise = $scope.outlet.canRevise; //$scope.outlet.AuditStatus == StatusPost && $scope.outlet.PersonID == user.id;

                        //$scope.disableOpenClose = false;
                        //$scope.disableTracking = false;

                        if ($scope.outlet.PStatus == 1 && $scope.outlet.AmendBy != user.id) {
                            setViewOnly();
                        } else if ($scope.outlet.PStatus == 2) {
                            $scope.disableOpenClose = true;
                            $scope.disableTracking = false;
                        } else if ($scope.outlet.PStatus == 2) {
                            $scope.disableOpenClose = false;
                            $scope.disableTracking = false;
                        }
                    }
                } else if ($scope.outlet.AuditStatus == StatusExitingPost) {
                    setViewOnly();
                    $scope.canRevise = $scope.outlet.canRevise; //$scope.outlet.AuditStatus == StatusPost && $scope.outlet.PersonID == user.id;
                } else {
                    setViewOnly();
                }
            }
        }
    }

    $scope.callRates = _callRates;
    $scope.classes = _classes;
    $scope.territories = _territories;

    $scope.enableExtraFields = config.enable_send_request === 1 && (user.role === 0 || user.role === 1);
    $scope.enableSendRequest =
        $scope.enableExtraFields && 
        $scope.outlet.IsSent === 0 &&  // Not send 
        ($scope.outlet.AuditStatus == StatusExternalSystem ||
            $scope.outlet.AuditStatus == StatusNew || 
            $scope.outlet.AuditStatus == StatusPost ||
            $scope.outlet.AuditStatus == StatusAuditAccept ||
            $scope.outlet.AuditStatus == StatusAuditorNew ||
            $scope.outlet.AuditStatus == StatusAuditorAccept);

    if ($scope.enableSendRequest) {
        $scope.disableClass = false;        // !$scope.enableExtraFields;
        $scope.disableTerritory = false;    // !$scope.enableExtraFields;
        $scope.disableCallrate = false;     // !$scope.enableExtraFields;
        $scope.disableLegalName = false;    // !$scope.enableExtraFields;
        $scope.disableTaxID = false;        // !$scope.enableExtraFields;
    } else {
        var canOpenCloseOrTrack = ($scope.canChangeOpenClose || $scope.canChangeTrackNonTrack)
        $scope.disableClass = isViewOnly || !canOpenCloseOrTrack;
        $scope.disableTerritory = isViewOnly || !canOpenCloseOrTrack;
        $scope.disableCallrate = isViewOnly || !canOpenCloseOrTrack;
        $scope.disableLegalName = isViewOnly || !canOpenCloseOrTrack;
        $scope.disableTaxID = isViewOnly || !canOpenCloseOrTrack;
    }
    
    var allowCapture = $scope.allowCapture;
   
    $scope.showDraft = $scope.outlet.IsDraft;
    $scope.outlet.modifiedImage1 = false;
    $scope.outlet.modifiedImage2 = false;
    $scope.outlet.modifiedImage3 = false;
    $scope.outlet.modifiedImage4 = false;
    $scope.outlet.modifiedImage5 = false;
    $scope.outlet.modifiedImage6 = false;

    $scope.isDeleted = false;

    $scope.image1URL = getImageURL($scope.outlet.StringImage1);
    $scope.image2URL = getImageURL($scope.outlet.StringImage2);
    $scope.image3URL = getImageURL($scope.outlet.StringImage3);
    $scope.image4URL = getImageURL($scope.outlet.StringImage4);
    $scope.image5URL = getImageURL($scope.outlet.StringImage5);
    $scope.image6URL = getImageURL($scope.outlet.StringImage6);

    var orgOutlet = cloneObj($scope.outlet);
  
    $scope.capture = function (i) {
        $scope.outlet.isChanged = true;
        if (i == 1) {
            var saveImg1Func = function (imageURI) {
                $scope.outlet.StringImage1 = imageURI;
                $scope.outlet.modifiedImage1 = true;
                getFileContentAsBase64(imageURI, function (content) {
                    $scope.outlet.StringImage1 = content.replace('data:image/jpeg;base64,', '');
                    $scope.image1URL = imageURI;
                    var image = document.getElementById('outletImg1');
                    image.setAttribute('src', imageURI);
                    image.focus();
                })
            };

            if (!isEmpty($scope.outlet.StringImage1)) {
                openImgViewer($scope.outlet.Name, !allowCapture, $scope.image1URL, function (imageURI) {
                    log('Update imageURI 1: ' + imageURI);
                    if (imageURI != null) {
                        saveImg1Func(imageURI);
                    }
                });
            } else {
                if (!allowCapture) return;
                captureImage(function (imageURI) {
                    saveImg1Func(imageURI);
                }, function (err) {
                });
            }
        } else if (i == 2) {
            var saveImg2Func = function (imageURI) {
                $scope.outlet.StringImage2 = imageURI;
                $scope.outlet.modifiedImage2 = true;
                getFileContentAsBase64(imageURI, function (content) {
                    $scope.outlet.StringImage2 = content.replace('data:image/jpeg;base64,', '');
                    $scope.image2URL = imageURI;
                    var image = document.getElementById('outletImg2');
                    image.setAttribute('src', imageURI);
                    image.focus();
                })
            };

            if (!isEmpty($scope.outlet.StringImage2)) {
                openImgViewer($scope.outlet.Name, !allowCapture, $scope.image2URL, function (imageURI) {
                    log('Update imageURI 2: ' + imageURI);
                    if (imageURI != null) {
                        saveImg2Func(imageURI);
                    }
                });
            } else {
                if (!allowCapture) return;
                captureImage(function (imageURI) {
                    saveImg2Func(imageURI);
                }, function (err) {
                });
            }
        } else if (i == 3) {
            var saveImg3Func = function (imageURI) {
                $scope.outlet.StringImage3 = imageURI;
                $scope.outlet.modifiedImage3 = true;
                getFileContentAsBase64(imageURI, function (content) {
                    $scope.outlet.StringImage3 = content.replace('data:image/jpeg;base64,', '');
                    $scope.image3URL = imageURI;
                    var image = document.getElementById('outletImg3');
                    image.setAttribute('src', imageURI);
                    image.focus();
                })
            };

            if (!isEmpty($scope.outlet.StringImage3)) {
                openImgViewer($scope.outlet.Name, !allowCapture, $scope.image3URL, function (imageURI) {
                    log('Update imageURI 3: ' + imageURI);
                    if (imageURI != null) {
                        saveImg3Func(imageURI);
                    }
                });
            } else {
                if (!allowCapture) return;
                captureImage(function (imageURI) {
                    saveImg3Func(imageURI);
                }, function (err) {
                });
            }
        } else if (i == 4) {
            var saveImg4Func = function (imageURI) {
                $scope.outlet.StringImage4 = imageURI;
                $scope.outlet.modifiedImage4 = true;
                getFileContentAsBase64(imageURI, function (content) {
                    $scope.outlet.StringImage4 = content.replace('data:image/jpeg;base64,', '');
                    $scope.image4URL = imageURI;
                    var image = document.getElementById('outletImg4');
                    image.setAttribute('src', imageURI);
                    image.focus();
                })
            };

            if (!isEmpty($scope.outlet.StringImage4)) {
                openImgViewer($scope.outlet.Name, true, $scope.image4URL, function (imageURI) {
                    log('Update imageURI 4: ' + imageURI);
                    if (imageURI != null) {
                        saveImg4Func(imageURI);
                    }
                });
            }
        } else if (i == 5) {
            var saveImg5Func = function (imageURI) {
                $scope.outlet.StringImage5 = imageURI;
                $scope.outlet.modifiedImage5 = true;
                getFileContentAsBase64(imageURI, function (content) {
                    $scope.outlet.StringImage5 = content.replace('data:image/jpeg;base64,', '');
                    $scope.image5URL = imageURI;
                    var image = document.getElementById('outletImg5');
                    image.setAttribute('src', imageURI);
                    image.focus();
                })
            };

            if (!isEmpty($scope.outlet.StringImage5)) {
                openImgViewer($scope.outlet.Name, !allowCapture, $scope.image5URL, function (imageURI) {
                    log('Update imageURI 5: ' + imageURI);
                    if (imageURI != null) {
                        saveImg5Func(imageURI);
                    }
                });
            } else {
                if (!allowCapture) return;
                captureImage(function (imageURI) {
                    saveImg5Func(imageURI);
                }, function (err) {
                });
            }
        } else if (i == 6) {
            var saveImg6Func = function (imageURI) {
                $scope.outlet.StringImage6 = imageURI;
                $scope.outlet.modifiedImage6 = true;
                getFileContentAsBase64(imageURI, function (content) {
                    $scope.outlet.StringImage6 = content.replace('data:image/jpeg;base64,', '');
                    $scope.image6URL = imageURI;
                    var image = document.getElementById('outletImg6');
                    image.setAttribute('src', imageURI);
                    image.focus();
                })
            };

            if (!isEmpty($scope.outlet.StringImage6)) {
                openImgViewer($scope.outlet.Name, !allowCapture, $scope.image6URL, function (imageURI) {
                    log('Update imageURI 6: ' + imageURI);
                    if (imageURI != null) {
                        saveImg6Func(imageURI);
                    }
                });
            } else {
                if (!allowCapture) return;
                captureImage(function (imageURI) {
                    saveImg6Func(imageURI);
                }, function (err) {
                });
            }
        }
    }

    $scope.sendRequest = function () {
        showDlg('Info', 'The request has been sent.', function () {
            $scope.enableExtraFields = false;
            $scope.outlet.IsSent = 1;
            $scope.outlet.isChanged = true;
            //$scope.outlet.AuditStatus = StatusDone;
            hideDialog(true);
        });
    }

    $scope.saveUpdate = function () {
        checkDistance(false, function () {
            log('Change open/close status: ' + $scope.outlet.IsOpened);

            $scope.outlet.isChanged = true;

            setOpenCloseValue();

            if (!validate())
                return;

            //if ($scope.isAuditor && $scope.outlet.AuditStatus == StatusExitingPost)
            //    $scope.outlet.AuditStatus = StatusDone;

            if ($scope.outlet.AuditStatus == StatusInitial) {
                $scope.outlet.AuditStatus = StatusEdit;
            }

            hideDialog(true);
        });
    };

    $scope.cancelUpdate = function () {
        hideDialog(false);        
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
            hideDialog(true);
        }, function () { });
    }

    $scope.revertOutlet = function () {
        hideDialog(false);
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
                hideDialog(true);
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

            hideDialog(true);
        });       
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
            hideDialog(true);
        });        
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

        isViewOnly = true;
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

        $scope.image4URL = getImageURL($scope.outlet.StringImage4);

        $scope.image5URL = getImageURL($scope.outlet.StringImage5);

        $scope.image6URL = getImageURL($scope.outlet.StringImage6);
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

            if (isEmpty($scope.outlet.StringImage1) && isEmpty($scope.outlet.StringImage2) && isEmpty($scope.outlet.StringImage3) &&
                isEmpty($scope.outlet.StringImage5) && isEmpty($scope.outlet.StringImage6)) {
                showValidationErr(R.need_to_capture);
                return false;
            }
        }

        return true;
    }
   
    function checkDistance(detectedChanged, callback) {
        var isCancelled = false;
        var __validateLocation = function (callback) {
            getCurPosition(
                false,
                function (lat, lng) {
                    if (isCancelled) return;
                    dialogUtils.hideProcessing();
                    if (validateRange(lat, lng)) callback();
                },
                function () {
                    if (isCancelled) return;
                    dialogUtils.hideProcessing();
                    dialogUtils.showGetLocationError(
                        function () {
                            checkDistance(detectedChanged, callback);
                        },
                        function () {
                            //do nothing
                        });
                });
        };

        dialogUtils.showProcessing(R.get_current_location, {            
            cancelCallback: function () {
                isCancelled = true;
                if (__getLocationTimeout != null) {
                    clearTimeout(__getLocationTimeout);
                    __getLocationTimeout = null;
                }
            },
        });

        if (!detectedChanged) {
            __validateLocation(callback);
        } else {
            if (isModified(orgOutlet, $scope.outlet) || $scope.isOutletClosed !== !$scope.outlet.IsOpened) {
                __validateLocation(callback);
            } else {
                dialogUtils.hideProcessing();
                callback();
            }
        }
    }
}