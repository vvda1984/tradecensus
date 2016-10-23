var utils = {
    nowDate: function () {
        var today = new Date();
        var d = today.getDate();
        var m = today.getMonth() + 1; //January is 0!
        var y = today.getFullYear();

        if (d < 10) d = '0' + d;

        if (m < 10) m = '0' + m;

        return y + '-' + m + '-' + d;
    },

    nowDatetime: function () {
        var today = new Date();
        var d = today.getDate();
        var m = today.getMonth() + 1; //January is 0!
        var y = today.getFullYear();
        var h = today.getHours();
        var mm = today.getMinutes();
        var s = today.getSeconds();

        if (m < 10) m = '0' + m;
        if (d < 10) d = '0' + d;
        if (h < 10) h = '0' + h;
        if (mm < 10) mm = '0' + mm;
        if (s < 10) s = '0' + s;

        return y + '-' + m + '-' + d + ' ' + h + ':' + mm + ':' + s;
    },

    getTimeSpanInSecond: function (startTS, endTS) {
        return (endTS - startTS) / 1000;
    },

    showErrorDlg: function (err) {
        hideDlg();
        showError(err);
    },

    newGUID: function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
    },

    randomColor: function(){
        return '#' + Math.random().toString(16).slice(2, 8).toUpperCase();
    },

    writeLog: function (msg) {
        log(msg);
    },

    networks: {
        isReady: function () {
            return serverConnected && getNetworkState();
        },
    },
}
