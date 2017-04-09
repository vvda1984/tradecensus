var isLoadingDlgOpened = false;
var cancelLoadingDlg = false;
var dlgCloseCallback;
var dlgAcceptCallback;
var dlgDenyCallback;
var loadigConfirmMsg;
var loadingCloseCallback;

function dlgClose() {
    log('Close dialog.');
    hideDlg();
	if (dlgCloseCallback)
		dlgCloseCallback();	
}

function dlgConfirmClose(i) {
	log('dlgConfirmClose: ' + i.toString());	
	hideDlg();
	if (i == 1) {
		if (dlgAcceptCallback != null){
			dlgAcceptCallback();
		}
	} else {
		if (dlgDenyCallback != null)
			dlgDenyCallback();
	}	
}

function dlgLoadingClose() {    
    log('dlgLoadingClose: ' + i.toString());
    if (config.enable_devmode) {
        alert(loadigConfirmMsg);
        hideDlg();
        if (dlgCloseCallback)
            dlgCloseCallback();        
    } else {
        navigator.notification.confirm(
            loadigConfirmMsg, // message
            function (i) {
                if (i == 2) {
                    hideLoadingDlg();
                    if (loadingCloseCallback != null)
                        loadingCloseCallback();
                }
            },              // callback to invoke with index of button pressed
            'Confirm',      // title            
            ['No', 'Yes']
        );
    }
}

function showDlg(title, message, callback) {
    resetCallback();
	log("show dlg: " + message);	
	if (isDlgOpened) {
		$('#dlg-title').html(title);
		$('#dlg-message').html(message);
	} else {
	    var cover = null;
	    var t = (title === R.error || title === R.validate_error ? 'style="color:red;">' : '>');
		if (callback) {			
			dlgCloseCallback = callback;
			cover =
                '<div id="dlg-panel">' +
                    '<div class="loading-window">' +
                        '<div class="dialog">' +
                            '<div class="content">' +
                                '<div id="dlg-title" class="title">' + title + '</div><br>' +
                                '<div id="dlg-message" ' + t + message + '</div>' +
                            '</div>' +
                            '<div class="button label-blue" onclick="dlgClose()">' +
                               	'<div class="center" fit>CLOSE</div>' +
                            	'<paper-ripple fit></paper-ripple>' +
                            '</div>' +
                            //'<div class="button">'+
                            //    '<div class="center" fit>DECLINE</div>'+
                            //    '<paper-ripple fit></paper-ripple>'+
                            //'</div>'+                        
                        '</div>' +
                     '</div>' +
                '</div>';
		} else {
			cover =
                '<div id="dlg-panel">' +
                    '<div class="loading-window">' +
                        '<div class="dialog">' +
                            '<div class="loading">' +
                                '<img src="assets/img/loader.gif" width="28" height="28" />' +
                            '</div>' +
                            '<div class="content">' +
                                '<div id="dlg-title" class="title">' + title + '</div><br>' +
                                '<div id="dlg-message">' + message + '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';
		}
		isDlgOpened = true;
		$(cover).appendTo('body');
	}
}

function setDlgMsg(message) {
	log(message);
	$('#dlg-message').html(message);
}

function setDlgTitle(title) {
	log(title);
	$('#dlg-title').html(title);
}

function hideDlg() {
	try {
		//dlgCloseCallback = null;
		//dlgAcceptCallback = null;
		//dlgDenyCallback = null;
		$('#dlg-panel').remove();
		isDlgOpened = false;
	}
	catch (err) {
	}
}

function showValidationErr(message) {
    resetCallback();
    hideDlg();
    hideLoadingDlg();
    showDlg(R.validate_error, message, function () { });;
}

function showValidationErrAdv(message, onClose) {
    resetCallback();
    hideDlg();
    hideLoadingDlg();
    showDlg(R.validate_error, message, function () { });;
}

function showError(message) {
    if (typeof message === 'undefined') {
        return;
    }

    resetCallback();
    hideDlg();
    hideLoadingDlg();
    showDlg(R.error, message, function () { });;
}

function showErrorAdv(message, onClose) {
    if (typeof message === 'undefined') {
        return;
    }

    resetCallback();
    hideDlg();
    showDlg(R.error, message, function () { onClose();});;
}

function showInfo(message) {
    resetCallback();
    hideDlg();
    showDlg("Info", message, function () { });
}

function showConfirm(title, message, onAccept, onDeny) {
    resetCallback();
    hideDlg();
    dlgAcceptCallback = onAccept;
    dlgDenyCallback = onDeny;
    cover =
        '<div id="dlg-panel">' +
            '<div class="loading-window">' +
                '<div class="dialog">' +
                    '<div class="content">' +
                        '<div id="dlg-title" class="title">' + title + '</div><br>' +
                        '<div id="dlg-message">' + message + '</div>' +
                    '</div>' +
                    '<div class="button" onclick="dlgConfirmClose(0)">' +
                        '<div class="center" fit>CANCEL</div>' +
                        '<paper-ripple fit></paper-ripple>' +
                    '</div>' +
                    '<div class="button label-blue" onclick="dlgConfirmClose(1)">' +
                        '<div class="center" fit>OK</div>'+
                        '<paper-ripple fit></paper-ripple>'+
                    '</div>'+                        
                '</div>' +
                '</div>' +
        '</div>';
    $(cover).appendTo('body');
}

function showLoading(title, message, closeMsg, callback) {
    log("show Loading: " + message);
    resetCallback();
    cancelLoadingDlg = false;
    if (isLoadingDlgOpened) {
        $('#loading-dlg-title').html(title);
        $('#loading-dlg-message').html(message);
    } else {
        var cover = null;
        loadingCloseCallback = callback;
        loadigConfirmMsg = closeMsg;
        cover =
            '<div id="loading-panel">' +
                '<div class="loading-window">' +
                    '<div class="dialog">' +
                        '<div class="content">' +
                            '<div id="loading-dlg-title" class="title">' + title + '</div><br>' +
                            '<div id="loading-dlg-message">' + message + '</div>' +
                        '</div>' +
                        '<div class="button label-blue" onclick="dlgLoadingClose()">' +
                            '<div class="center" fit>CLOSE</div>' +
                            '<paper-ripple fit></paper-ripple>' +
                        '</div>' +
                    '</div>' +
                    '</div>' +
            '</div>';
        isLoadingDlgOpened = true;
        $(cover).appendTo('body');
    }
}

function SetLoadingMsg(title, message) {
    try{
        $('#loading-dlg-title').html(title);
        $('#loading-dlg-message').html(message);
    }catch(err){

    }
}

function hideLoadingDlg() {
    try {
        //dlgCloseCallback = null;
        //dlgAcceptCallback = null;
        //dlgDenyCallback = null;
        cancelLoadingDlg = true;
        $('#loading-panel').remove();
        isLoadingDlgOpened = false;
    }
    catch (err) {
    }
}

function resetCallback() {
    var dlgCloseCallback = null;
    var dlgAcceptCallback = null;
    var dlgDenyCallback = null;
    var loadigConfirmMsg = null;
}