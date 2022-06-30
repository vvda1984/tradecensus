/// <reference path="../assets/libs/hash.sha256.js" />

// For todays date;
Date.prototype.today = function () {
  return (
    this.getFullYear() + "-" + (this.getMonth() + 1 < 10 ? "0" : "") + (this.getMonth() + 1) + "-" + (this.getDate() < 10 ? "0" : "") + this.getDate()
  );
};

// For the time now
Date.prototype.timeNow = function () {
  return (
    (this.getHours() < 10 ? "0" : "") +
    this.getHours() +
    ":" +
    (this.getMinutes() < 10 ? "0" : "") +
    this.getMinutes() +
    ":" +
    (this.getSeconds() < 10 ? "0" : "") +
    this.getSeconds()
  );
};

/**
 * log
 */
function logx(logname, message) {
  console.log("[" + logname + "]" + message);
}

/**
 * hashString
 */
function hashString(text) {
  //TODO: hash test
  return SHA256(text);
  //return text;
}

/**
 * toStr
 */
function toStr(text) {
  return text == null ? "null" : text;
}

/**
 * isEmpty
 */
function isEmpty(text) {
  if (text == undefined) return true;
  if (text == null) return true;
  if (text == "null") return true;
  return !text || 0 === text.length;
}

/**
 * buildURL
 */
function buildURL(protocol, ip, port, serviceName) {
  var host = ip;
  var subhost = "";
  var positionS = ip.indexOf("/");
  if (positionS > 0) {
    //can't start with /
    host = ip.substr(0, positionS);
    subhost = ip.substr(positionS);
  }

  var url = protocol + "://" + host + ":" + port.toString() + subhost + "/" + "TradeCensusService.svc";
  log(url);
  return url;
  //return protocol + '://' + ip + ':' + port + '/' + serviceName;
}

/**
 * buildURL
 */
function imageURL(protocol, ip, port, image) {
  var host = ip;
  var subhost = "";
  var positionS = ip.indexOf("/");
  if (positionS > 0) {
    //can't start with /
    host = ip.substr(0, positionS);
    subhost = ip.substr(positionS);
  }

  var url = protocol + "://" + host + ":" + port.toString() + subhost + "/" + image;
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
  log("HTTP error...");
  log(err);
  hideDlg();
  var msg = err.statusText == "" ? $scope.resource.text_ConnectionTimeout : err.statusText;
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
  return JSON.parse(JSON.stringify(i));
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
  return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}

/**
 * Validate Empty
 */
function validateEmpty(name, value) {
  if (isEmpty(value)) {
    showError(name + " is empty!");
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
    dd = "0" + dd.toString();
  }
  if (mm < 10) {
    mm = "0" + mm.toString();
  }
  return yyyy + "-" + mm + "-" + dd;
}

function compareDate(date1, date2, dateformat) {
  if (date1 != null && date2 == null) return -1;
  if (date1 == null && date2 != null) return 1;
  if (date1 == date2) return 0;

  var d1 = getDateFromFormat(date1, dateformat);
  var d2 = getDateFromFormat(date2, dateformat);
  if (d1 == 0 || d2 == 0) {
    return 0; // invalid set they equal...
  } else if (d1 > d2) {
    return 1;
  }
  return -1;
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
    callback("");
    return;
  }

  if (config.enable_devmode) {
    callback(
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QBoRXhpZgAATU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAAExAAIAAAARAAAATgAAAAAAAABgAAAAAQAAAGAAAAABcGFpbnQubmV0IDQuMC4xMAAA/9sAQwAQCwwODAoQDg0OEhEQExgoGhgWFhgxIyUdKDozPTw5Mzg3QEhcTkBEV0U3OFBtUVdfYmdoZz5NcXlwZHhcZWdj/9sAQwEREhIYFRgvGhovY0I4QmNjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2Nj/8AAEQgCWAMgAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8AKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACq18+2Db/f4qzWbqEm6YKDwo/WoqS5YnZgaXtKyvstS9bSeZAjZycc/WpKo6a/Dx/8AAh/Wr1ODvFMzxVL2VWUQoooqjnCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAQkAEnoOaxXfe5Y9Sc1p3z7bYj++dtZfvXPWfQ93KqVouo+uhLavsuEbtnB/l/n6Vr1iBCVLYOOmfete3k82BHznI5+tOi9LGWaU9Y1F6ElFFFbnjhRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFNcsEJQAt2BNOooGtGUGvZlbaY1BHY03+0Jf7i/rV2aBJlww57H0rMnt3hODyvQGsJ862PZw31Sto42ZN/aEv9xf1o/tCX+4v61Uo71l7SXc7/qOH/lJZ7h5yu4AAelRDBPtxmjBp8MZkkVMHBPNLWT1N1GFCFlokXo4P9A2YwxG78etVYLp4F2hQyk5+latY9xH5c7qOBnj6VtUTjZo8jBTjiHOnUV76k/9oSf3Fo/tCT+4tVMUYxzWXtJnofUcP/KW/wC0JP7i/rT47yaRtqRqxqG3tWn+YkrH/eB6/StKONIl2ooA/nW0Od6s83FSwtK8YRuxw6c0UUVseQFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABSMoZSrAEHqDS0UBsZ9zZFctCNy917j6UltLAVCSxIpHG71+taNZmobRcfLwcfMRWM4qHvI9fDV54n9zP7y99mh/55J+VKkMSNuWNQ3qBWfbXTRfKfmT09PpWmrBlDDoRkVcJRlscuJo1qDtJ3TFpjxRucuik+pFPoqzjUnHVEX2aH/nkv5UC2hByIlz9KlopWRXtZ92FFFFMgKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAOnWsWV/MlZ/U5rTvH2W7Y6txWUeTXPWl0PcyqlpKo/QdChkkVB/Ea2gMDArO05MysxH3Rx+NaNXSVonNmdXmqqC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FFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB//9k="
    );
    return;
  }

  callback("data:image/jpeg;base64," + path);
  return;

  //if (!path.startsWith("file:")) {
  //  callback("data:image/jpeg;base64," + path);
  //  return;
  //}

  // window.resolveLocalFileSystemURL(path, gotFile, fail);
  // function fail(e) {
  //   alert("Cannot found requested file");
  // }
  // function gotFile(fileEntry) {
  //   fileEntry.file(function (file) {
  //     var reader = new FileReader();
  //     reader.onloadend = function (e) {
  //       var content = this.result;
  //       callback(content);
  //     };
  //     // The most important point, use the readAsDatURL Method from the file plugin
  //     reader.readAsDataURL(file);
  //   });
  // }
}

function detectRootedDevice(complete) {
  try {
    rootdetection.isDeviceRooted(
      function (result) {
        console.log(result);
        complete(result === 1 ? 1 : 0);
      },
      function (error) {
        console.error(error);
        complete(-1);
      }
    );
  } catch (err) {
    console.log(err);
    complete(-1); //
  }
}

//#region Capture/Image Viewer
function openImgViewer(title, viewOnly, url, callback) {
  newImageFile = null;
  onImageViewerClose = callback;
  log("Open image: " + url + " " + title);
  var dlg =
    '<div id="image-overlay">' +
    '<div class="loading-window">' +
    '<div class="dialog" style="margin-left:20%;margin-right:20%;">' +
    '<div class="content">' +
    '<div class="title">' +
    title +
    ' <div style="float:right; margin-right:8px;" onclick="closeImgViewer()">X</div> </div><br>' +
    '<div><img id="curOutletImage" class="outlet-image-large" src="' +
    url +
    '"/></div>' +
    "</div>" +
    '<div class="button label-blue" onclick="closeImgViewer()">' +
    '<div class="center" fit>CLOSE</div>' +
    "<paper-ripple fit></paper-ripple>" +
    "</div>" +
    '<div class="button label-blue">' +
    '<div class="center" fit onclick="replaceImage()">CAPTURE</div>' +
    "<paper-ripple fit></paper-ripple>" +
    "</div>" +
    //'<div class="button label-blue">' +
    //    '<div class="center" fit onclick="deleteImage()">DELETE</div>' +
    //    '<paper-ripple fit></paper-ripple>' +
    //'</div>' +
    "</div>" +
    "</div>" +
    "</div>";

  if (viewOnly) {
    dlg =
      '<div id="image-overlay">' +
      '<div class="loading-window">' +
      '<div class="dialog" style="margin-left:20%;margin-right:20%;">' +
      '<div class="content">' +
      '<div class="title">' +
      title +
      ' <div style="float:right; margin-right:8px;" onclick="closeImgViewer()">X</div> </div><br>' +
      '<div><img id="curOutletImage" class="outlet-image-large" src="' +
      url +
      '"/></div>' +
      "</div>" +
      '<div class="button label-blue" onclick="closeImgViewer()">' +
      '<div class="center" fit>CLOSE</div>' +
      "<paper-ripple fit></paper-ripple>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>";
  }

  try {
    $(dlg).appendTo("body");
  } catch (err) {
    log(err);
  }
}

function closeImgViewer() {
  try {
    $("#image-overlay").remove();
    if (onImageViewerClose != null) {
      onImageViewerClose(newImageFile);
    }
  } catch (err) {}
}

function replaceImage() {
  captureImage(
    function (imageURI) {
      var image = document.getElementById("curOutletImage");
      image.src = imageURI;
      log("set new image path: " + imageURI);
      newImageFile = imageURI;
    },
    function (err) {
      //showError(err);
    }
  );
}

function deleteImage() {
  showConfirm(
    "Delete Image?",
    "Are you sure you want to delete image?",
    function () {
      try {
        $("#image-overlay").remove();
        if (onImageViewerClose != null) {
          onImageViewerClose("");
        }
      } catch (err) {}
    },
    function () {}
  );
}

function captureImage(onSuccess, onError, useFrontCamera) {
  cordova.plugins.backgroundMode.disable(); //conflict with camera...

  console.log("Capture image: " + config.image_width.toString() + " x " + config.image_height.toString());
  try {
    if (config.enable_devmode) {
      onSuccess("https://i.pinimg.com/originals/4b/9f/e1/4b9fe1a527569254373f46c0263c7d76.jpg");
      cordova.plugins.backgroundMode.enable();
    } else {
      if (typeof useFrontCamera === "undefined" || useFrontCamera === false) {
        navigator.camera.getPicture(
          function (s) {
            cordova.plugins.backgroundMode.enable();
            onSuccess(s);
          },
          onError,
          {
            //quality: 30,
            targetWidth: config.image_width,
            targetHeight: config.image_height,
            correctOrientation: true,
            //destinationType: Camera.DestinationType.FILE_URI, // DATA_URL for base64 => not recommend due to memory issue
            destinationType: Camera.DestinationType.DATA_URL,
          }
        );
      } else {
        navigator.camera.getPicture(
          function (s) {
            cordova.plugins.backgroundMode.enable();
            onSuccess(s);
          },
          onError,
          {
            cameraDirection: Camera.Direction.FRONT,
            //quality: 30,
            targetWidth: config.image_width,
            targetHeight: config.image_height,
            correctOrientation: true,
            //destinationType: Camera.DestinationType.FILE_URI, // DATA_URL for base64 => not recommend due to memory issue
            destinationType: Camera.DestinationType.DATA_URL,
          }
        );
      }
    }
  } catch (err) {
    showError(err);
  }
}
//#endregion

//#region Connection
var __serverConnected = true;
var __handleNetworkStateChanged;
var __startMonitorNetwork = false;

function __getNetworkState() {
  if (!config.mode_online) return false;
  if (config.enable_devmode) return true;

  try {
    var networkState = navigator.connection.type;
    return networkState !== Connection.NONE && networkState !== Connection.UNKNOWN && networkState !== Connection.CELL_2G;
  } catch (err) {
    return true;
  }
}

function networkReady() {
  var curServerConnected = __serverConnected;
  __serverConnected = __getNetworkState();

  if (__serverConnected != curServerConnected) {
    if (__handleNetworkStateChanged) __handleNetworkStateChanged(__serverConnected);
  }

  return __serverConnected; // && getNetworkState();
}

function getNetworkState() {
  try {
    return navigator.connection.type;
  } catch (err) {
    return "NONE";
  }
}

function onNetworkConnected() {
  var newState = __getNetworkState;
  if (newState !== __serverConnected) {
    __getNetworkState = newState;
    if (__handleNetworkStateChanged) __handleNetworkStateChanged(__serverConnected);
  }
}

function onNetworkDisconnected() {
  var newState = __getNetworkState;
  if (newState !== __serverConnected) {
    __getNetworkState = newState;
    if (__handleNetworkStateChanged) __handleNetworkStateChanged(__serverConnected);
  }
}

function startMonitorNetworkState() {
  if (config.manual_monitor_network != 1 || __startMonitorNetwork == true) return;

  __startMonitorNetwork = true;
  window.setInterval(function () {
    var isNetworkReady = networkReady();
  }, 30 * 1000);
}
//#endregion
