function checkConnection() {
    var networkState = navigator.connection.type;
    return (networkState != "Unknown connection" && networkState != "no network connection")
}

function log(message) {
    console.log(message);
}