var devCurLat = 10.774812;
var devCurLng = 106.702550;
var devNewDetlta = 0.00001;
var devNewLat = devCurLat + devNewDetlta;
var devNewLng = devCurLng + devNewDetlta;

// For todays date;
Date.prototype.today = function () {
    return this.getFullYear() + '-' + (((this.getMonth() + 1) < 10) ? "0" : "") + (this.getMonth() + 1) + '-' + ((this.getDate() < 10) ? "0" : "") + this.getDate();
}

// For the time now
Date.prototype.timeNow = function () {
    return ((this.getHours() < 10) ? "0" : "") + this.getHours() + ":" + ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + ":" + ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds();
}

/** 
* checkConnection
*/
function networkReady() {
    if (!config.mode_online) return false;
    // ANVO: DEBUG
    if (isDev)
        return true;   
    var networkState = navigator.connection.type;
    return (networkState != 'Unknown connection' && networkState != 'no network connection')
}

/** 
* log
*/
function log(message) {
    console.log(message);
}

/** 
* log
*/
function logx(logname, message) {
    console.log('[' + logname + ']' + message);
}

/** 
* log
*/
function getCurPosition(onSuccess, onError) {
    log('Get current location...');
    try {       
        navigator.geolocation.getCurrentPosition(function (position) {
            var foundLat = position.coords.latitude;
            var foundLng = position.coords.longitude;

            if (isDev) {
                log('***set debug location...');
                foundLat = devCurLat;
                foundLng = devCurLng;
                //initializeMap();lat = ;              
            }

            log('found location: lat=' + foundLat.toString() + ',lng=' + foundLng.toString());
            onSuccess(foundLat, foundLng);
        },
        onError,
        { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
    } catch (err) {
        log(err);
        onError(err.message);
    }
}

/** 
* hashString
*/
function hashString(text) {
    //TODO: hash test
    return text;
}

/** 
* toStr
*/
function toStr(text) {
    return (text == null) ? 'null' : text;    
}

/** 
* isEmpty
*/
function isEmpty(text) {
    return (!text || 0 === text.length);
}

/** 
* buildURL
*/
function buildURL(protocol, ip, port, serviceName) {
    return protocol + '://' + ip + ':' + port + '/' + serviceName;
}

/** 
* handleError
*/
function handleError(err) {
    hideDlg();
    showDialog(err, 'Error', function () { });
}

/** 
* Handle http error
*/
function handleHttpError(err) {
    hideDlg();
    var msg = err.statusText == '' ? $scope.resource.text_ConnectionTimeout : err.statusText;
    showError(msg);
}

/** 
* Handle http error
*/
function handleDBError(tx, err) {
    showError(err.message);
}

/**
* Clone object
*/
function cloneObj(i) {
    return (JSON.parse(JSON.stringify(i)));
}

/**
* Clone object
*/
function guid() {
    return randomString4() + randomString4() + '-' + randomString4() + '-' + s4randomString4 + '-' + randomString4() + '-' + randomString4() + randomString4() + randomString4();
}

/**
* random text 4 characters
*/
function randomString4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
}

/**
* Validate Empty
*/
function validateEmpty(name, value){    
    if (isEmpty(value)) {
        showError(name + ' is empty!');
        return false;
    }
    return true;
}

/**
* compareDate
*/
function compareDate(date1, date2, dateformat) {    
    if (date1 != null && date2 == null) return -1;
    if (date1 == null && date2 != null) return 1;
    if (date1 == date2) return 0;

    var d1 = getDateFromFormat(date1, dateformat);
    var d2 = getDateFromFormat(date2, dateformat);
    if (d1 == 0 || d2 == 0) {
        return 0; // invalid set they equal...
    }
    else if (d1 > d2) {
        return 1;
    }
    return -1;
}


function openImgViewer(title, url, callback) {
    newImageFile = null;
    onImageViewerClose = callback;
    log('Open image: ' + url + ' ' + title);
    var dlg =
        '<div id="image-overlay">' +
            '<div class="loading-window">' +
                '<div class="dialog" style="margin-left:20%;margin-right:20%;">' +
                    '<div class="content">' +
                        '<div class="title">' + title + '</div><br>' +
                        '<div><img id="curOutletImage" class="outlet-image-large" src="' + url + '"/></div>' +
                    '</div>' +
                    '<div class="button label-blue" onclick="closeImgViewer()">' +
                        '<div class="center" fit>CLOSE</div>' +
                        '<paper-ripple fit></paper-ripple>' +
                    '</div>' +                  
                    '<div class="button label-blue">' +
                        '<div class="center" fit onclick="replaceImage()">CAPTURE</div>' +
                        '<paper-ripple fit></paper-ripple>' +
                    '</div>' +
                     '<div class="button label-blue">' +
                        '<div class="center" fit onclick="deleteImage()">DELETE</div>' +
                        '<paper-ripple fit></paper-ripple>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    try {      
        $(dlg).appendTo('body');
    } catch (err) {
        log(err);
    }
}

function closeImgViewer() {
    try {
        $('#image-overlay').remove();
        if (onImageViewerClose != null) {
            onImageViewerClose(newImageFile);
        }
    }
    catch (err) {
    }
}

function replaceImage() {
    captureImage(function (imageURI) {
        var image = document.getElementById('curOutletImage');
        image.src = imageURI;
        log('set new image path: ' + imageURI);
        newImageFile = imageURI;
    }, function (err) {
        //showError(err);
    });
}

function deleteImage() {
    showConfirm('Delete Image?', "Are you sure you want to delete image?", function () {
        try {
            $('#image-overlay').remove();
            if (onImageViewerClose != null) {
                onImageViewerClose('');
            }
        }
        catch (err) {
        }
    }, function () { });   
}

function captureImage(onSuccess, onError) {
    if (isDev) {
        onSuccess("test url");
    } else {
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