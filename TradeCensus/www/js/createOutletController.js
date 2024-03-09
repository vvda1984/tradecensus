/// <reference path="tradecensus.js" />
/// <reference path="tc.outletAPI.js" />
/// <reference path="tc.appAPI.js" />

function newOutletController($scope, $mdDialog) {
  __isOutletDlgOpen = true;
  var isLoaded = false;
  var outlet = OUTLET.dialog.outlet();
  var orgOutlet = null;
  var isCreatedNew = isEmpty(outlet.Name);

  var __selectedGeoProvince = null;
  for (var i = 0; i < provinces.length; i++) {
    if (provinces[i].id == outlet.ProvinceID.toString()) {
      __selectedGeoProvince = provinces[i];
      break;
    }
  }

  //addressModel.wardArr = [];

  $scope.R = R;
  $scope.address = addressModel;
  $scope.masterdata = masterdata;

  //$scope.autoSelectedDistrict = $scope.address.districtArr && $scope.address.districtArr.length > 0;
  //$scope.autoSelectedWard = $scope.autoSelectedDistrict; // tcutils.networks.isReady() && $scope.address.wardArr && $scope.address.wardArr.length > 0;
  $scope.autoSelectedDistrict = true;
  $scope.autoSelectedWard = true;

  $scope.outletTypes = outletTypes;
  $scope.allowCapture = true;
  $scope.showImage1 = true;
  $scope.showImage2 = true;
  $scope.showImage3 = true;
  $scope.showImage4 = config.enable_check_in > 0;
  $scope.showImage5 = true;
  $scope.showImage6 = true;

  $scope.isDeleted = false;
  $scope.title = buildTitle();
  var downloadProvinces = [];
  if (networkReady()) {
    downloadProvinces = provinces;
  } else {
    var c = 0;
    for (var j = 0; j < provinces.length; j++) {
      if (provinces[j].download) {
        downloadProvinces[c] = provinces[j];
        c++;
      }
    }
  }
  $scope.provinces = downloadProvinces;

  $scope.callRates = _callRates;
  $scope.classes = _classes;
  $scope.territories = _territories;

  //$scope.disableExtendedFields = !
  $scope.enableExtraFields = config.enable_send_request === 1 && (user.role === 0 || user.role === 1);

  function hideDialog(answer) {
    $mdDialog.hide(answer);
    OUTLET.dialog.close(answer, $scope.outlet);
  }

  $scope.capture = function (i) {
    $scope.outlet.isChanged = true;
    if (i == 1) {
      var saveImg1Func = function (imageURI) {
        $scope.outlet.StringImage1 = imageURI;
        $scope.outlet.modifiedImage1 = true;
        getFileContentAsBase64(imageURI, function (content) {
          $scope.outlet.StringImage1 = content.replace("data:image/jpeg;base64,", "");
          $scope.image1URL = content;
          try {
            $scope.apply();
          } catch (e) {}
          var image = document.getElementById("outletImg1");
          image.setAttribute("src", imageURI);
          image.focus();
        });
      };

      if (!isEmpty($scope.outlet.StringImage1)) {
        openImgViewer($scope.outlet.Name, false, $scope.image1URL, function (imageURI) {
          log("Update imageURI 1: " + imageURI);
          if (imageURI != null) {
            saveImg1Func(imageURI);
          }
        });
      } else {
        captureImage(
          function (imageURI) {
            saveImg1Func(imageURI);
          },
          function (err) {}
        );
      }
    } else if (i == 2) {
      var saveImg2Func = function (imageURI) {
        $scope.outlet.StringImage2 = imageURI;
        $scope.outlet.modifiedImage2 = true;
        getFileContentAsBase64(imageURI, function (content) {
          $scope.outlet.StringImage2 = content.replace("data:image/jpeg;base64,", "");
          $scope.image2URL = content;
          try {
            $scope.apply();
          } catch (e) {}
          var image = document.getElementById("outletImg2");
          image.setAttribute("src", imageURI);
          image.focus();
        });
      };

      if (!isEmpty($scope.outlet.StringImage2)) {
        openImgViewer($scope.outlet.Name, false, $scope.image2URL, function (imageURI) {
          log("Update imageURI 2: " + imageURI);
          if (imageURI != null) {
            saveImg2Func(imageURI);
          }
        });
      } else {
        captureImage(
          function (imageURI) {
            saveImg2Func(imageURI);
          },
          function (err) {}
        );
      }
    } else if (i == 3) {
      var saveImg3Func = function (imageURI) {
        $scope.outlet.StringImage3 = imageURI;
        $scope.outlet.modifiedImage3 = true;
        getFileContentAsBase64(imageURI, function (content) {
          $scope.outlet.StringImage3 = content.replace("data:image/jpeg;base64,", "");
          $scope.image3URL = content;
          try {
            $scope.apply();
          } catch (e) {}
          var image = document.getElementById("outletImg3");
          image.setAttribute("src", imageURI);
          image.focus();
        });
      };

      if (!isEmpty($scope.outlet.StringImage3)) {
        openImgViewer($scope.outlet.Name, false, $scope.image3URL, function (imageURI) {
          log("Update imageURI 3: " + imageURI);
          if (imageURI != null) {
            saveImg3Func(imageURI);
          }
        });
      } else {
        captureImage(
          function (imageURI) {
            saveImg3Func(imageURI);
          },
          function (err) {}
        );
      }
    } else if (i == 4) {
      var saveImg4Func = function (imageURI) {
        $scope.outlet.StringImage4 = imageURI;
        $scope.outlet.modifiedImage4 = true;
        getFileContentAsBase64(imageURI, function (content) {
          $scope.outlet.StringImage4 = content.replace("data:image/jpeg;base64,", "");
          $scope.image4URL = content;
          try {
            $scope.apply();
          } catch (e) {}
          var image = document.getElementById("outletImg4");
          image.setAttribute("src", imageURI);
          image.focus();
        });
      };

      if (!isEmpty($scope.outlet.StringImage4)) {
        openImgViewer($scope.outlet.Name, true, $scope.image4URL, function (imageURI) {
          log("Update imageURI 4: " + imageURI);
          if (imageURI != null) {
            saveImg4Func(imageURI);
          }
        });
      } else {
        //captureImage(function (imageURI) {
        //    saveImg4Func(imageURI);
        //}, function (err) {
        //});
      }
    } else if (i == 5) {
      var saveImg5Func = function (imageURI) {
        $scope.outlet.StringImage5 = imageURI;
        $scope.outlet.modifiedImage5 = true;
        getFileContentAsBase64(imageURI, function (content) {
          $scope.outlet.StringImage5 = content.replace("data:image/jpeg;base64,", "");
          $scope.image5URL = content;
          try {
            $scope.apply();
          } catch (e) {}
          var image = document.getElementById("outletImg5");
          image.setAttribute("src", imageURI);
          image.focus();
        });
      };

      if (!isEmpty($scope.outlet.StringImage5)) {
        openImgViewer($scope.outlet.Name, false, $scope.image5URL, function (imageURI) {
          log("Update imageURI 5: " + imageURI);
          if (imageURI != null) {
            saveImg5Func(imageURI);
          }
        });
      } else {
        captureImage(
          function (imageURI) {
            saveImg5Func(imageURI);
          },
          function (err) {}
        );
      }
    } else if (i == 6) {
      var saveImg6Func = function (imageURI) {
        $scope.outlet.StringImage6 = imageURI;
        $scope.outlet.modifiedImage6 = true;
        getFileContentAsBase64(imageURI, function (content) {
          $scope.outlet.StringImage6 = content.replace("data:image/jpeg;base64,", "");
          $scope.image6URL = content;
          try {
            $scope.apply();
          } catch (e) {}
          var image = document.getElementById("outletImg6");
          image.setAttribute("src", imageURI);
          image.focus();
        });
      };

      if (!isEmpty($scope.outlet.StringImage6)) {
        openImgViewer($scope.outlet.Name, false, $scope.image6URL, function (imageURI) {
          log("Update imageURI 6: " + imageURI);
          if (imageURI != null) {
            saveImg6Func(imageURI);
          }
        });
      } else {
        captureImage(
          function (imageURI) {
            saveImg6Func(imageURI);
          },
          function (err) {}
        );
      }
    } else if (i == 11) {
      var saveImg11Func = function (imageURI) {
        $scope.outlet.CitizenFrontImage = imageURI;
        getFileContentAsBase64(imageURI, function (content) {
          $scope.outlet.CitizenFrontImage = content.replace("data:image/jpeg;base64,", "");
          $scope.CitizenFrontURL = content;
          try {
            $scope.apply();
          } catch (e) {}
          var image = document.getElementById("outletImg11");
          image.setAttribute("src", imageURI);
          image.focus();
        });
      };

      if (!isEmpty($scope.outlet.CitizenFrontImage)) {
        openImgViewer($scope.outlet.Name, false, $scope.CitizenFrontURL, function (imageURI) {
          log("Update CitizenFrontURL 6: " + imageURI);
          if (imageURI != null) {
            saveImg11Func(imageURI);
          }
        });
      } else {
        captureImage(
          function (imageURI) {
            saveImg11Func(imageURI);
          },
          function (err) {}
        );
      }
    } else if (i == 12) {
      var saveImg12Func = function (imageURI) {
        $scope.outlet.CitizenRearImage = imageURI;
        getFileContentAsBase64(imageURI, function (content) {
          $scope.outlet.CitizenRearImage = content.replace("data:image/jpeg;base64,", "");
          $scope.CitizenRearURL = content;
          try {
            $scope.apply();
          } catch (e) {}
          var image = document.getElementById("outletImg12");
          image.setAttribute("src", imageURI);
          image.focus();
        });
      };

      if (!isEmpty($scope.outlet.CitizenRearImage)) {
        openImgViewer($scope.outlet.Name, false, $scope.CitizenRearURL, function (imageURI) {
          log("Update CitizenRearURL 6: " + imageURI);
          if (imageURI != null) {
            saveImg12Func(imageURI);
          }
        });
      } else {
        captureImage(
          function (imageURI) {
            saveImg12Func(imageURI);
          },
          function (err) {}
        );
      }
    }
  };

  $scope.sendRequest = function () {
    showInfo("The request has been sent.");
    $scope.allowSendRequest = false;
    $scope.outlet.IsSent = 1;
  };

  $scope.deleteOutlet = function () {
    log("delete pressed");
    var confirmText = R.delete_outlet_confirm.replace("{outletname}", $scope.outlet.Name);
    showConfirm(
      R.delete_outlet,
      confirmText,
      function () {
        $scope.outlet.isDeleted = true;
        $scope.outlet.isChanged = true;
        $scope.outlet.AuditStatus = StatusDelete;
        //$mdDialog.hide(true);

        hideDialog(true);
      },
      function () {}
    );
  };

  $scope.postOutlet = function () {
    if (!validate()) return;

    if (
      isEmpty($scope.outlet.StringImage1) &&
      isEmpty($scope.outlet.StringImage2) &&
      isEmpty($scope.outlet.StringImage3) &&
      isEmpty($scope.outlet.StringImage5) &&
      isEmpty($scope.outlet.StringImage6)
    ) {
      showValidationErr(R.need_to_capture);
      return;
    }

    var confirmText = R.post_outlet_confirm.replace("{outletname}", $scope.outlet.Name);
    showConfirm(
      R.post_outlet,
      confirmText,
      function () {
        checkDistance(function () {
          if ($scope.outlet.AuditStatus == StatusNew) {
            $scope.outlet.IsDraft = false; // POST
            $scope.outlet.AuditStatus = StatusPost;
          }
          $scope.outlet.isChanged = true;

          //$mdDialog.hide(true);
          hideDialog(true);
        });
      },
      function () {}
    );
  };

  $scope.saveUpdate = function () {
    if (!validate(false)) return;

    checkDistance(function () {
      $scope.outlet.isChanged = true;
      //$mdDialog.hide(true);
      hideDialog(true);
    });
  };

  $scope.approveOutlet = function () {
    if (!validate(true)) return;

    showCurPositionDlg(
      false,
      function (lat, lng) {
        if (!validateRange(lat, lng)) return;
        $scope.outlet.isChanged = true;
        $scope.outlet.isApproved = true;

        if ($scope.outlet.AuditStatus == StatusAuditorNew) {
          $scope.outlet.AuditStatus = StatusAuditorAccept;
        }

        //$mdDialog.hide(true);
        hideDialog(true);
      },
      function () {
        showError(R.cannot_approve_or_deny);
      }
    );
  };

  $scope.cancelUpdate = function () {
    //$mdDialog.hide(false);
    hideDialog(false);
  };

  $scope.codeChanged = function () {
    $scope.title = buildTitle();
  };

  $scope.nameChanged = function () {
    $scope.title = buildTitle();
  };

  $scope.provinceChanged = function () {
    changeProvince();
  };

  $scope.districtChanged = function () {
    changeDistrict();
  };

  $scope.bankChanged = function () {
    changeBank();
  };

  $scope.addSupplier = function (i) {
    $scope.outlet.isChanged = true;
    $scope.outlet[`Supplier${i}Enable`] = true;
  };

  $scope.deleteSupplier = function (i) {
    $scope.outlet.isChanged = true;
    $scope.outlet[`Supplier${i}Enable`] = false;
    $scope.outlet[`Supplier${i}`] = null;
  };

  function changeProvince(selectedProvince) {
    if (!$scope.autoSelectedDistrict) return;

    $scope.address.districtArr = [];
    $scope.address.wardArr = [];

    if (isLoaded) {
      $scope.outlet.District = "";
      $scope.outlet.Ward = "";
    }

    if (selectedProvince == undefined) {
      var outlet1 = isLoaded ? $scope.outlet : outlet;
      for (var i = 0; i < provinces.length; i++) {
        var provinceId = provinces[i].id;
        if (provinceId == outlet1.ProvinceID.toString()) {
          selectedProvince = provinces[i];
          break;
        }
      }
    }
    __selectedGeoProvince = selectedProvince;

    if (tcutils.networks.isReady()) {
      var url = baseURL + "/border/getdistricts/" + selectedProvince.referenceGeoID;
      log("Call service api: " + url);
      cordova.plugin.http.sendRequest(
        url,
        {
          method: config.http_method,
          data: {},
          headers: {},
        },
        function (response) {
          try {
            const data = JSON.parse(response.data);
            if (data.Status == -1) {
              // error
              getDistrictFromLocal(selectedProvince);
            } else {
              $scope.address.districtArr = data.Items;
              if (!isLoaded) changeDistrict();
            }
          } catch (err) {
            console.error(err);
            getDistrictFromLocal(selectedProvince);
          }
        },
        function (response) {
          console.error(response.error);
          getDistrictFromLocal(selectedProvince);
        }
      );
    } else {
      getDistrictFromLocal(selectedProvince);
    }
  }

  function changeDistrict(selectedDistrict) {
    if (!$scope.autoSelectedWard) return;
    var outlet1 = isLoaded ? $scope.outlet : outlet;

    $scope.address.wardArr = [];
    if (isLoaded) {
      $scope.outlet.Ward = "";
    }

    if (selectedDistrict == undefined) {
      selectedDistrict = null;
      for (var i = 0; i < $scope.address.districtArr.length; i++) {
        if ($scope.address.districtArr[i].Name === outlet1.District) {
          selectedDistrict = $scope.address.districtArr[i];
          break;
        }
      }
    }

    if (tcutils.networks.isReady()) {
      var url = baseURL + "/border/getwards/" + __selectedGeoProvince.referenceGeoID + "/" + outlet1.District;
      log("Call service api: " + url);
      cordova.plugin.http.sendRequest(
        url,
        {
          method: config.http_method,
          data: {},
          headers: {},
        },
        function (response) {
          try {
            const data = JSON.parse(response.data);
            if (data.Status == -1) {
              // error
              getWardFromLocal(selectedDistrict);
            } else {
              $scope.address.wardArr = data.Items;
              if (!isLoaded) setOutlet();
            }
          } catch (err) {
            getWardFromLocal(selectedDistrict);
          }
        },
        function (response) {
          log(response.error);
          getWardFromLocal(selectedDistrict);
        }
      );
    } else {
      getWardFromLocal(selectedDistrict);
    }
  }

  function getDistrictFromLocal(selectedProvince) {
    addressModel.getDistricts(selectedProvince.referenceGeoID, function (items) {
      $scope.address.districtArr = items;
      if (!isLoaded) changeDistrict();
    });
  }

  function getWardFromLocal(selectedDistrict) {
    if (selectedDistrict == undefined) {
      if (!isLoaded) setOutlet();
      return;
    }
    addressModel.getWards(selectedDistrict.ID, function (items) {
      $scope.address.wardArr = items;
      if (!isLoaded) setOutlet();
    });
  }

  //function mapProvinceToGeoProvince() {
  //    var selectedProvince = null;
  //    var outlet1 = isLoaded ? $scope.outlet : outlet;
  //    for (var i = 0; i < $scope.provinces.length; i++) {
  //        if ($scope.provinces[i].id === outlet1.ProvinceID) {
  //            selectedProvince = $scope.provinces[i];
  //            break;
  //        }
  //    }
  //    __selectedGeoProvince = selectedProvince;
  //}

  function changeBank() {
    var outlet1 = isLoaded ? $scope.outlet : outlet;
    $scope.masterdata.loadBankCodes(outlet1.BankID, () => {});
  }

  function checkDistance(callback) {
    if (isModified(orgOutlet, $scope.outlet)) {
      showCurPositionDlg(
        false,
        function (lat, lng) {
          if (!validateRange(lat, lng)) return;
          callback();
        },
        function () {}
      );
    } else {
      callback();
    }
  }

  function getImageURL(stringImage) {
    log(stringImage);
    if (!isEmpty(stringImage)) {
      var imageUrl = stringImage;
      if (!isEmpty(stringImage)) {
        if (stringImage.toUpperCase().indexOf("/IMAGES") > -1) {
          imageUrl = imageURL($scope.config.protocol, $scope.config.ip, $scope.config.port, imageUrl);
        } else {
          //if (stringImage.indexOf('base64') > -1) {
          imageUrl = "data:image/jpeg;base64," + imageUrl;
        }
      }
      return imageUrl;
    }
    return "";
  }

  function validate(isApproved) {
    if (isEmpty($scope.outlet.Name)) {
      showValidationErr(R.outlet_name_is_empty, function () {
        $("#inputName").focus();
      });

      return false;
    }
    if ($scope.outlet.OTypeID == "-1") {
      showValidationErr(R.outlet_type_is_empty, function () {
        $("#inputOutletType").focus();
      });
      //showError(R.outlet_type_is_empty);
      return false;
    }

    if (isEmpty($scope.outlet.Phone)) {
      showValidationErr(R.phone_is_empty, function () {
        $("#inputPhone").focus();
      });
      return false;
    }

    if (isEmpty($scope.outlet.AddLine)) {
      showValidationErr(R.house_no_is_empty, function () {
        $("#inputAdd1").focus();
      });
      return false;
    }
    if (isEmpty($scope.outlet.AddLine2)) {
      showValidationErr(R.street_is_empty, function () {
        $("#inputAdd2").focus();
      });
      return;
    }
    if (isEmpty($scope.outlet.District)) {
      showErrorAdv(R.district_is_empty, function () {
        $("#inputDistrict").focus();
      });
      return false;
    }

    if (isEmpty($scope.outlet.Ward)) {
      showErrorAdv(R.ward_is_empty, function () {
        $("#inputWard").focus();
      });
      return false;
    }

    if ($scope.outlet.TotalVolume == undefined || $scope.outlet.TotalVolume == null) {
      showValidationErr(R.total_is_invald, function () {
        $("#total").focus();
      });
      return false;
    }

    if ($scope.outlet.TotalVolume == 0) {
      showValidationErr(R.total_is_empty, function () {
        $("#total").focus();
      });
      return false;
    }

    if ($scope.outlet.VBLVolume == undefined || $scope.outlet.VBLVolume == null) {
      showErrorAdv(R.vbl_is_invald, function () {
        $("#vblvolume").focus();
      });
      return false;
    }

    if ($scope.outlet.ID == NewOutletDefaultID) {
      if (
        isEmpty($scope.outlet.StringImage1) &&
        isEmpty($scope.outlet.StringImage2) &&
        isEmpty($scope.outlet.StringImage3) &&
        //isEmpty($scope.outlet.StringImage4) && // Selfie
        isEmpty($scope.outlet.StringImage5) &&
        isEmpty($scope.outlet.StringImage6)
      ) {
        showValidationErr("Please capture image before save new outlet!", function () {});
        return false;
      }
    }

    if ($scope.outlet.VBLVolume > $scope.outlet.TotalVolume) {
      showValidationErr(R.vbl_cannot_greater_than_total, function () {
        $("#total").focus();
      });
      return false;
    }

    if (isApproved && $scope.canComment) {
      if (isEmpty($scope.outlet.Note)) {
        showErrorAdv(R.comment_is_empty, function () {
          $("#inputComment").focus();
        });
        return false;
      }
    }

    return true;
  }

  function validateRange(lat, lng) {
    var d = parseInt(calcDistance({ Lat: lat, Lng: lng }, { Lat: $scope.outlet.Latitude, Lng: $scope.outlet.Longitude }));
    if (d > config.audit_range) {
      //var errMsg = R.ovar_audit_distance.replace('{distance}', config.audit_range.toString());
      //errMsg = errMsg.replace('{value}', d);

      var errMsg = R.validate_distance.replace("{distance}", config.audit_range.toString());
      errMsg = errMsg.replace("{distance}", config.audit_range.toString());
      showValidationErr(errMsg);
      return false;
    }
    return true;
  }

  function buildTitle() {
    var t = outlet.Name;
    if (isEmpty(t)) {
      if (outlet.AuditStatus == StatusNew || outlet.AuditStatus == StatusPost) {
        t = R.create_new_outlet;
      } else {
        t = R.edit_outlet;
      }
    } else {
      if (outlet.ID != 60000000) {
        t += " (" + outlet.ID.toString() + ")";
      }
    }
    return t;
  }

  function loadImages() {
    $scope.image1URL = getImageURL(outlet.StringImage1);

    $scope.image2URL = getImageURL(outlet.StringImage2);

    $scope.image3URL = getImageURL(outlet.StringImage3);

    $scope.image4URL = getImageURL(outlet.StringImage4);

    $scope.image5URL = getImageURL(outlet.StringImage5);

    $scope.image6URL = getImageURL(outlet.StringImage6);
  }

  function setOutlet() {
    $scope.outlet = outlet;
    if ($scope.outlet.TaxID === "null" || $scope.outlet.TaxID === null) $scope.outlet.TaxID = "";
    if ($scope.outlet.LegalName === "null" || $scope.outlet.LegalName === null) $scope.outlet.LegalName = "";

    $scope.outlet.modifiedImage1 = false;
    $scope.outlet.modifiedImage2 = false;
    $scope.outlet.modifiedImage3 = false;
    $scope.outlet.modifiedImage4 = false; // selfie image
    $scope.outlet.modifiedImage5 = false;
    $scope.outlet.modifiedImage6 = false;

    $scope.outlet.isChanged = false;
    $scope.canComment = user.hasAuditRole && $scope.outlet.AuditStatus == StatusAuditorNew;
    $scope.canPost = $scope.outlet.canPost;
    $scope.canApprove = $scope.outlet.canApprove;
    $scope.createNew = $scope.outlet.AuditStatus == StatusNew;
    $scope.showDraft = $scope.outlet.IsDraft && !$scope.isNewOutlet;
    $scope.canDelete = $scope.outlet.canDelete;

    if (user.hasAuditRole) {
      $scope.outlet.canComment = $scope.outlet.AuditStatus == StatusAuditorNew;
    } else {
      $scope.outlet.canComment = false;
    }

    $scope.image1URL = getImageURL($scope.outlet.StringImage1);
    $scope.image2URL = getImageURL($scope.outlet.StringImage2);
    $scope.image3URL = getImageURL($scope.outlet.StringImage3);
    $scope.image4URL = getImageURL($scope.outlet.StringImage4);
    $scope.image5URL = getImageURL($scope.outlet.StringImage5);
    $scope.image6URL = getImageURL($scope.outlet.StringImage6);

    orgOutlet = cloneObj($scope.outlet);

    isLoaded = true;
  }

  function loadData() {
    $scope.masterdata.loadBrands(function () {
      $scope.masterdata.loadBanks(function () {
        $scope.masterdata.loadSuppliers(function () {
          $scope.masterdata.loadOtherSuppliers(() => {});
        });
      });
    });
  }

  loadImages();
  loadData();
  //mapProvinceToGeoProvince();

  if (isCreatedNew) setOutlet();
  else changeProvince();
}
