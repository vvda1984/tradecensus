var addressModel = {
  ward: null,
  district: null,
  province: null,
  provinceRaw: null,

  provinceArr: [],
  districtArr: [],
  wardArr: [],

  isSelectDistrict: false,
  isSelectWard: false,

  reset: function () {
    addressModel.ward = null;
    addressModel.district = null;
    addressModel.province = null;
    addressModel.districtArr = [];
    addressModel.wardArr = [];
    addressModel.isSelectDistrict = false;
    addressModel.isSelectWard = false;
  },

  update: function (selectedProvinceBorder, selectedDistrictBorder, selectedWardBorder, districtBorders, wardBorders) {
    addressModel.reset();

    if (selectedProvinceBorder) {
      addressModel.province = selectedProvinceBorder;
    }

    if (selectedDistrictBorder) {
      addressModel.district = selectedDistrictBorder;
    }

    if (selectedWardBorder) {
      addressModel.ward = selectedWardBorder;
    }

    if (districtBorders && districtBorders.length > 0) {
      addressModel.districtArr = districtBorders;
    }

    if (wardBorders && wardBorders.length > 0) {
      addressModel.wardArr = wardBorders;
    }
  },

  database: null,

  initialize: function (db, tran) {
    database = db;
    //tcutils.logging.debug('Ensure table [District] exist');
    var sql = "CREATE TABLE IF NOT EXISTS [District] ([id] text PRIMARY KEY, [Name] text NOT NULL, [parentId] text NOT NULL)";
    logSqlCommand(sql);
    tran.executeSql(
      sql,
      [],
      function (tx) {},
      function (tx, dberr) {}
    );

    //tcutils.logging.debug('Ensure table [Ward] exist');
    var sql1 = "CREATE TABLE IF NOT EXISTS [Ward] ([id] text PRIMARY KEY, [Name] text NOT NULL, [parentId] text NOT NULL)";

    logSqlCommand(sql1);
    tran.executeSql(
      sql1,
      [],
      function (tx) {},
      function (tx, dberr) {}
    );

    //callback();
  },

  insertDistricts: function (provinceId, districts, callback) {
    db.transaction(function (tx) {
      for (var i = 0; i < districts.length; i++) {
        var district = districts[i];
        var sql = "INSERT INTO [District] VALUES (" + '"' + district.id + '", ' + '"' + district.name + '", ' + '"' + provinceId + '")';
        logSqlCommand(sql);
        tx.executeSql(sql, [], null, function (tx, dberr) {
          tcutils.logging.error(dberr.message);
        });

        for (var j = 0; j < district.wards.length; j++) {
          var ward = district.wards[j];
          var sql1 = "INSERT INTO [Ward] VALUES (" + '"' + ward.id + '", ' + '"' + ward.name + '", ' + '"' + district.id + '")';
          logSqlCommand(sql1);
          tx.executeSql(sql1, [], null, function (tx, dberr) {
            tcutils.logging.error(dberr.message);
          });
        }
      }
      callback();
    });
  },

  isDistrictsDownloaded: function (provinceId, callback) {
    db.transaction(function (tx) {
      var sql = 'SELECT * FROM [District] WHERE parentId = "' + provinceId + '"';
      tx.executeSql(
        sql,
        [],
        function (tx, dbres) {
          callback(dbres.rows.length > 0);
        },
        function (dberr) {
          callback(false);
        }
      );
    });
  },

  getDistricts: function (parentId, callback) {
    db.transaction(function (tx) {
      var sql = 'SELECT * FROM [District] WHERE parentId = "' + parentId + '"';
      tx.executeSql(
        sql,
        [],
        function (tx, dbres) {
          var result = [];
          if (dbres.rows.length > 0) {
            for (var i = 0; i < dbres.rows.length; i++) {
              var item = dbres.rows.item(i);
              result.push({
                ID: item.id,
                Name: item.Name,
                ParentID: item.parentId,
              });
            }
          }
          callback(result);
        },
        function (dberr) {
          callback(null);
        }
      );
    });
  },

  getWards: function (parentId, callback) {
    db.transaction(function (tx) {
      var sql = 'SELECT * FROM [Ward] WHERE parentId = "' + parentId + '"';
      tx.executeSql(
        sql,
        [],
        function (tx, dbres) {
          var result = [];
          if (dbres.rows.length > 0) {
            for (var i = 0; i < dbres.rows.length; i++) {
              var item = dbres.rows.item(i);
              result.push({
                ID: item.id,
                Name: item.Name,
                ParentID: item.parentId,
              });
            }
          }
          callback(result);
        },
        function (dberr) {
          callback(null);
        }
      );
    });
  },
};
