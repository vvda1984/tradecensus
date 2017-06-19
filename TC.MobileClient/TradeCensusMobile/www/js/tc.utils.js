var tcutils = {   
    nowDate: function () {
        var today = new Date();
        return this.formatDate(today);
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

    nowTime: function () {
        var today = new Date();
        var h = today.getHours();
        var mm = today.getMinutes();
        var s = today.getSeconds();

        if (h < 10) h = '0' + h;
        if (mm < 10) mm = '0' + mm;
        if (s < 10) s = '0' + s;

        return h + ':' + mm + ':' + s;
    },

    formatDate: function (date) {
        var d = date.getDate();
        var m = date.getMonth() + 1; //January is 0!
        var y = date.getFullYear();

        if (d < 10) d = '0' + d;

        if (m < 10) m = '0' + m;

        return y + '-' + m + '-' + d;
    },

    formatTime: function (date) {
        var h = date.getHours();
        var m = date.getMinutes();
        var s = date.getSeconds();
        if (h < 10) d = '0' + h;
        if (m < 10) m = '0' + m;
        if (s < 10) s = '0' + s;
        return h + ':' + m + ':' + s;
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

    randomColor: function () {
        return '#' + Math.random().toString(16).slice(2, 8).toUpperCase();
    },

    writeLog: function (msg) {
        log(msg);
    },

    messageBox: {
        error: function (msg) {
            hideDlg();
            showError(msg);
        },

        info: function (msg) {
            hideDlg();
            showInfo(msg);
        },

        loading: function (title, message) {
            showDlg(title, message);
        },

        hide: function () {
            hideDlg();
        }
    },

    logging: {
        error: function (msg) {
            var formatedMsg = tcutils.nowTime() + ": " + msg;
            try { $('#textLogMessage').html(formatedMsg); } catch (err) { }
            log(msg);
        },

        info: function (msg) {
            var formatedMsg = tcutils.nowTime() + ": " + msg;
            try { $('#textLogMessage').html(formatedMsg); } catch (err) { }
            log(msg);
        },

        debug: function (msg) {
            //var formatedMsg = tcutils.nowTime() + ": " + msg;
            //$('#textLogMessage').html(formatedMsg);
            log(msg);
        }
    },

    networks: {
        isReady: function () {
            return networkReady();
        },
    },

    locations: {
        calculateDistance: function (lat1, lng1, lat2, lng2) {
            return calcDistance({ Lat: lat1, Lng: lng1 }, { Lat: lat2, Lng: lng2 });
        },
    },

    tcapp: {
        lastUpdateLocationTS: null,

        lastRefreshOutletsTS: null,
        lastRefreshLat: 0,
        lastRefreshLng: 0,
        //lastQueryItemCount: 20,

        checkToRefreshOutlet: function (newLat, newLng) {
            if (config.item_count > config.item_count_max) return false; // disable auto reload

            var now = new Date();
            var dif = getDifTime(tcutils.tcapp.lastRefreshOutletsTS, now);
            var refreshInterval = config.ping_time + Math.floor((config.item_count - 20) / 10);
            if (dif >= refreshInterval) {
                var distance = tcutils.locations.calculateDistance(newLat, newLng, tcutils.tcapp.lastRefreshLat, tcutils.tcapp.lastRefreshLng);
                if (distance >= config.liveGPS_distance) {
                    tcutils.tcapp.lastRefreshOutletsTS = now;
                    tcutils.tcapp.lastRefreshLat = newLat;
                    tcutils.tcapp.lastRefreshLng = newLng;
                    return true;
                }
            }
            return false;
        },

        checkToCreateNewOutlet: function () {
            var dif = getDifTime(tcutils.tcapp.lastUpdateLocationTS, new Date());
            return (dif <= config.location_age);
        },
    },

    compress(val) {
        if (val != undefined && val != null && val.length > 0) {
            return Base64String.compressToUTF16(val);
        }
        else
            return "";
    },

    decompress(val) {
        if (val != undefined && val != null && val.length > 0) {
            return Base64String.decompressFromUTF16(val);
        }
        else
            return "";
    },
};
