function checkConnection() {
    var networkState = navigator.connection.type;
    return (networkState != "Unknown connection" && networkState != "no network connection")
}

function log(message) {
    console.log(message);
}

function showDialog(message, title, onDialogDismissed) {
    navigator.notification.alert(message, onDialogDismissed, title, "Close");
}

function showConfirm(message, title, onDialogDismissed) {
    navigator.notification.confirm(message, onDialogDismissed, title, ['OK', 'Cancel']);
}