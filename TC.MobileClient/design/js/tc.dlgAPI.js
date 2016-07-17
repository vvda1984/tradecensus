var dlgCloseCallback;
var dlgAcceptCallback;
var dlgDenyCallback;

function dlgClose(i) {
	hideDlg();
	if (dlgCloseCallback)
		dlgCloseCallback();
}

function dlgConfirmClose(i) {
	log('dlgConfirmClose: ' + i.toString());	
	if (i == 1) {
		if (dlgAcceptCallback != null){
			dlgAcceptCallback();
		}
	} else {
		if (dlgDenyCallback != null)
			dlgDenyCallback();
	}
	hideDlg();
}

function showDlg(title, message, callback) {
	log("show dlg: " + message);

	if (isDlgOpened) {
		$('#dlg-title').html(title);
		$('#dlg-message').html(message);
	} else {
		var cover = null;
		if (callback) {
			dlgCloseCallback = callback;
			cover =
                '<div id="loading-overlay">' +
                    '<div class="loading-window">' +
                        '<div class="dialog">' +
                            '<div class="content">' +
                                '<div id="dlg-title" class="title">' + title + '</div><br>' +
                                '<div id="dlg-message">' + message + '</div>' +
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
                '<div id="loading-overlay">' +
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
	$('#dlg-message').html(message);
}

function hideDlg() {
	try {
		dlgCloseCallback = null;
		dlgAcceptCallback = null;
		dlgDenyCallback = null;
		$('#loading-overlay').remove();
		isDlgOpened = false;
	}
	catch (err) {
	}
}

function showError(message) {
	//navigator.notification.alert(message, function () { }, "Error", 'Close');
	hideDlg();
	showDlg("Error", message, function () { });;
}

function showInfo(message) {
	//navigator.notification.alert(message, function () { }, "Error", 'Close');
	hideDlg();
	showDlg("Info", message, function () { });;
}

function showConfirm(title, message, onAccept, onDeny) {
	//navigator.notification.alert(message, function () { }, "Error", 'Close');
	hideDlg();
	dlgAcceptCallback = onAccept;
	dlgDenyCallback = onDeny;
	cover =
        '<div id="loading-overlay">' +
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