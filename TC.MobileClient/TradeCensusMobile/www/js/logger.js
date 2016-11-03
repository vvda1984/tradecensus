// Using plugin-logtofile (ANDROID ONLY)
// https://github.com/andischerer/cordova-plugin-logtofile
var logger = {
    ready : false,

    initialize: function (appname) {
       
        // setup a logfile path (required)
        // this path is relative to your device sdcard storage directory
        log(window);
        console.log(window.logToFile);
        if (window.logToFile) {
            console.info('Initialize logger "' + appname +'"');
            window.logToFile.setLogfilePath('/' + appname + '/log.txt', function () {
                // logger configured successfully  
                ready = true;
                console.log('logtofile is ready!');
            }, function (err) {
                // logfile could not be written
                // handle error
                ready = false;
                console.log('logtofile is failed!');
            });
        }

        //// get the logfilePath from the currently running logger instance
        //window.logToFile.getLogfilePath(function (logfilePath) {
        //    // dosomething with the logfilepath
        //}, function (err) {
        //    // handle error
        //});

        //// get the all archived logfile paths as array
        //window.logToFile.getArchivedLogfilePaths(function (archivedlogfiles) {
        //    // dosomething with the archived logs
        //}, function (err) {
        //    // handle error
        //});

        // write logmessages in different loglevels
    },

    debug : function (msg) {
        if(this.ready) window.logToFile.debug(msg);
    },

    info : function (msg) {
        if(this.ready) window.logToFile.info(msg);
    },

    warn : function (msg) {
        if(this.ready) indow.logToFile.warn(msg);
    },

    error : function (msg) {
        if(this.ready) window.logToFile.error(msg);
    },
}

function log(msg) {
    //var formatedMsg = tcutils.nowTime() + ": " + msg;
    //$('#textLogMessage').html(formatedMsg);

    console.log(msg);
    logger.info(msg);
}