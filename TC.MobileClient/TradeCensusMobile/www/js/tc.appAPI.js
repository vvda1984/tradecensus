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
var serverConnected = true;
function networkReady() {
    return serverConnected && getNetworkState();
}

/** 
* checkConnection
*/
function getNetworkState() {
    if (!config.mode_online) return false;
    if (isDev)
        return true;
    try {
        //states[Connection.UNKNOWN] = 'Unknown connection';
        //states[Connection.ETHERNET] = 'Ethernet connection';
        //states[Connection.WIFI] = 'WiFi connection';
        //states[Connection.CELL_2G] = 'Cell 2G connection';
        //states[Connection.CELL_3G] = 'Cell 3G connection';
        //states[Connection.CELL_4G] = 'Cell 4G connection';
        //states[Connection.CELL] = 'Cell generic connection';
        //states[Connection.NONE] = 'No network connection';

        var networkState = navigator.connection.type;
        log('Network status: ' + networkState);
        return (networkState !== Connection.NONE && networkState !== Connection.UNKNOWN)
    }
    catch (err) {
        return true;
    }
}

/** 
* log
*/
function logx(logname, message) {
    console.log('[' + logname + ']' + message);
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
    var host = ip;
    var subhost = '';
    var positionS = ip.indexOf('/');
    if (positionS > 0) { //can't start with /
        host = ip.substr(0, positionS);
        subhost = ip.substr(positionS);
    }

    var url = protocol + '://' + host + ':' + port.toString() + subhost + '/' + 'TradeCensusService.svc';
    log(url);
    return url;
    //return protocol + '://' + ip + ':' + port + '/' + serviceName;
}

/** 
* buildURL
*/
function imageURL(protocol, ip, port, image) {
    var host = ip;
    var subhost = '';
    var positionS = ip.indexOf('/');
    if (positionS > 0) { //can't start with /
        host = ip.substr(0, positionS);
        subhost = ip.substr(positionS);
    }

    var url = protocol + '://' + host + ':' + port.toString() + subhost + '/' + image;
    log(url);
    return url;
    //return protocol + '://' + ip + ':' + port + '/' + serviceName;
}

/** 
* handleError
*/
function handleError(err) {
    hideDlg();
    showError(err);
}

/** 
* Handle http error
*/
function handleHttpError(err) {
    log('HTTP error...');
    log(err);
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
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
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

/***/
function currentDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd.toString();
    }
    if (mm < 10) {
        mm = '0' + mm.toString();
    }
    return yyyy + '-' + mm + '-' + dd;
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
                    quality: 30,
                    targetWidth: 800,
                    targetHeight: 600,
                    correctOrientation: true,
                    destinationType: Camera.DestinationType.FILE_URI, // DATA_URL for base64 => not recommend due to memory issue
                });
        } catch (err) {
            showError(err);
        }
    }
}

function getDifTime(st, en) {
    return (en - st) / 1000;
}

function changeAlias(alias) {
    var str = alias;
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ  |ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ  |ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    return str;
}

function getFileContentAsBase64(path, callback) {
    if (isEmpty(path)) {
        callback('');
        return;
    }
    window.resolveLocalFileSystemURL(path, gotFile, fail);

    function fail(e) {
        alert('Cannot found requested file');
    }

    function gotFile(fileEntry) {
        fileEntry.file(function (file) {
            var reader = new FileReader();
            reader.onloadend = function (e) {
                var content = this.result;
                callback(content);
            };
            // The most important point, use the readAsDatURL Method from the file plugin
            reader.readAsDataURL(file);
        });
    }
}


/*******************************************************/
//function requestWriteFile(name, onSuccess, onError) {
//    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
//        fileSystem.root.getFile(name, { create: true, exclusive: false }, function (fileEntry) {
//            fileEntry.createWriter(function (writer) {
//            }, fail);
//        }, fail);
//    }, fail);
//}

//function gotFS(fileSystem) {
   
//}

//function gotFileEntry(fileEntry) {
//    fileEntry.createWriter(gotFileWriter, fail);
//}

//function gotFileWriter(writer) {
//    writer.onwriteend = function (evt) {
//        console.log("contents of file now 'some sample text'");
//        writer.truncate(11);
//        writer.onwriteend = function (evt) {
//            console.log("contents of file now 'some sample'");
//            writer.seek(4);
//            writer.write(" different text");
//            writer.onwriteend = function (evt) {
//                console.log("contents of file now 'some different text'");
//            }
//        };
//    };
//    writer.write("some sample text");
//}

//function fail(error) {
//    console.log(error.code);
//}