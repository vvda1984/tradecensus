const masterdata = {
  //
  supplierTable: "",
  //
  primarySupplierArr: [],
  otherSupplierArr: [],
  brandArr: [],
  bankArr: [],
  bankcodeArr: [],
  currBankcodeArr: [],
  visitFrequencyArr: [
    { value: "Every week", caption: "Every week" },
    { value: "Every 2 weeks", caption: "Every 2 weeks" },
    { value: "Every 3 weeks", caption: "Every 3 weeks" },
    { value: "Every 4 weeks", caption: "Every 4 weeks" },
    { value: "Every 5 weeks", caption: "Every 5 weeks" },
    { value: "Every 6 weeks", caption: "Every 6 weeks" },
    { value: "Every 7 weeks", caption: "Every 7 weeks" },
    { value: "Every 8 weeks", caption: "Every 8 weeks" },
    { value: "Every 9 weeks", caption: "Every 9 weeks" },
    { value: "Every 10 weeks", caption: "Every 10 weeks" },
  ],
  preferredVisitWeekArr: [
    { value: "1", caption: "1" },
    { value: "2", caption: "2" },
    { value: "3", caption: "3" },
    { value: "4", caption: "4" },
    { value: "5", caption: "5" },
    { value: "6", caption: "6" },
    { value: "7", caption: "7" },
    { value: "8", caption: "8" },
    { value: "9", caption: "9" },
    { value: "10", caption: "10" },
  ],
  preferredVisitDayArr: [
    { value: "Monday", caption: "Monday" },
    { value: "Tuesday", caption: "Tuesday" },
    { value: "Wednesday", caption: "Wednesday" },
    { value: "Thursday", caption: "Thursday" },
    { value: "Saturday", caption: "Saturday" },
    { value: "Sunday", caption: "Sunday" },
  ],
  booleanArr: [
    { value: "1", caption: "Yes" },
    { value: "0", caption: "No" },
  ],
  //
  reset: function () {
    masterdata.primarySupplierArr = [];
    masterdata.otherSupplierArr = [];
    masterdata.brandArr = [];
    masterdata.bankArr = [];
    masterdata.bankcodeArr = [];
    masterdata.currBankcodeArr = [];
  },
  //
  initialize(supplierTbl) {
    masterdata.supplierTable = supplierTbl;
    masterdata.reset();
  },
  //
  insertBrands: function (items, callback) {
    insertBrandsDB(items, callback);
  },
  //
  insertBanks: function (items, callback) {
    insertBanksDB(items, callback);
  },
  //
  insertBankCodes: function (items, callback) {
    insertBankCodesDB(items, callback);
  },
  //
  insertSuppliers: function (items, callback) {
    insertSuppliersDB(masterdata.supplierTable, items, callback);
  },
  //
  getBrandsLocal: function (callback) {
    db.transaction(function (tx) {
      const sql = "SELECT * FROM [brand]";
      tx.executeSql(
        sql,
        [],
        function (tx, dbres) {
          const result = [];
          if (dbres.rows.length > 0) {
            for (var i = 0; i < dbres.rows.length; i++) {
              const item = dbres.rows.item(i);
              result.push({
                id: item.ID,
                name: item.Name,
                parentID: item.BrandTypeID,
                companyID: item.CompanyID,
                tracking: item.Tracking,
                brandCode: item.BrandCode,
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
  //
  getBanksLocal: function (callback) {
    db.transaction(function (tx) {
      const sql = "SELECT * FROM [bank]";
      tx.executeSql(
        sql,
        [],
        function (tx, dbres) {
          const result = [];
          if (dbres.rows.length > 0) {
            for (var i = 0; i < dbres.rows.length; i++) {
              const item = dbres.rows.item(i);
              result.push({
                id: item.ID,
                code: item.Code,
                name: item.Name,
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
  //
  getBankCodesLocal: function (callback) {
    db.transaction(function (tx) {
      const sql = `SELECT * FROM [bankcode]`;
      tx.executeSql(
        sql,
        [],
        function (tx, dbres) {
          const result = [];
          if (dbres.rows.length > 0) {
            for (var i = 0; i < dbres.rows.length; i++) {
              const item = dbres.rows.item(i);
              result.push({
                id: item.ID,
                code: item.Code,
                bankID: item.BankID,
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
  //
  getBankCodesByBankLocal: function (bankID, callback) {
    db.transaction(function (tx) {
      const sql = `SELECT * FROM [bankcode] WHERE BankID = ${bankID}`;
      tx.executeSql(
        sql,
        [],
        function (tx, dbres) {
          const result = [];
          if (dbres.rows.length > 0) {
            for (var i = 0; i < dbres.rows.length; i++) {
              const item = dbres.rows.item(i);
              result.push({
                id: item.ID,
                code: item.Code,
                bankID: item.BankID,
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
  //
  getSuppliersLocal: function (isPrimary, callback) {
    db.transaction(function (tx) {
      const sql = `SELECT * FROM [${masterdata.supplierTable}] WHERE PrimarySupplier = '${isPrimary ? "1" : "0"}'`;
      tx.executeSql(
        sql,
        [],
        function (tx, dbres) {
          const result = [];
          if (dbres.rows.length > 0) {
            for (var i = 0; i < dbres.rows.length; i++) {
              const item = dbres.rows.item(i);
              result.push({
                supplierID: item.SupplierID,
                supplierName: item.SupplierName,
                primarySupplier: item.PrimarySupplier,
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
  //
  __loadBrands: function (callback) {
    masterdata.getBrandsLocal(function (items) {
      masterdata.brandArr = items;
      callback(items);
    });
  },
  //
  loadBrands: function (callback) {
    log("LOAD BRANDS");
    if (masterdata.brandArr && masterdata.brandArr.length > 0) {
      callback(masterdata.brandArr);
      return;
    }
    if (networkReady()) {
      var url = baseURL + "/provinces/getleadbrands";
      log("Call service api: " + url);
      cordova.plugin.http.sendRequest(
        url,
        {
          method: config.http_method,
          data: {},
          headers: {},
        },
        function (response) {
          try {
            const data = JSON.parse(response.data);
            if (data.Status == -1 || !data.items) {
              masterdata.__loadBrands(callback);
            } else {
              masterdata.brandArr = data.items;
              masterdata.insertBrands(data.items, callback);
            }
          } catch (err) {
            console.error(err);
            masterdata.__loadBrands(callback);
          }
        },
        function (response) {
          console.error(response.error);
          masterdata.__loadBrands(callback);
        }
      );
    } else {
      masterdata.__loadBrands(callback);
    }
  },
  //
  __loadBanks: function (callback) {
    masterdata.getBanksLocal(function (items) {
      masterdata.bankArr = items;
      callback(items);
    });
  },
  //
  loadBanks: function (callback) {
    log("LOAD BRANDS");
    if (masterdata.bankArr.length > 0) {
      callback(masterdata.bankArr);
      return;
    }
    if (networkReady()) {
      var url = baseURL + "/provinces/getbanks";
      log("Call service api: " + url);
      cordova.plugin.http.sendRequest(
        url,
        {
          method: config.http_method,
          data: {},
          headers: {},
        },
        function (response) {
          try {
            const data = JSON.parse(response.data);
            if (data.Status == -1) {
              masterdata.__loadBanks(callback);
            } else {
              masterdata.bankArr = data.items;
              masterdata.insertBanks(data.items, callback);
            }
          } catch (err) {
            console.error(err);
            masterdata.__loadBanks(callback);
          }
        },
        function (response) {
          console.error(response.error);
          masterdata.__loadBanks(callback);
        }
      );
    } else {
      masterdata.__loadBanks(callback);
    }
  },
  //
  __loadBankCodes: function (bankID, callback) {
    masterdata.getBankCodesLocal(function (items) {
      masterdata.bankcodeArr = items;
      const items1 = [];
      for (var i = 0; i < masterdata.bankcodeArr.length; i++) {
        if (masterdata.bankcodeArr[i].bankID == bankID) {
          items1.push(masterdata.bankcodeArr[i]);
        }
      }
      masterdata.currBankcodeArr = items1;
      callback(items1);
    });
  },
  //
  loadBankCodes: function (bankID, callback) {
    console.log("Load BankCode: " + bankID, { bankCodes: masterdata.bankcodeArr });
    if (masterdata.bankcodeArr.length > 0) {
      const items = [];
      for (var i = 0; i < masterdata.bankcodeArr.length; i++) {
        if (masterdata.bankcodeArr[i].bankID == bankID) {
          items.push(masterdata.bankcodeArr[i]);
        }
      }
      masterdata.currBankcodeArr = items;
      callback(items);
      return;
    }
    if (networkReady()) {
      var url = baseURL + "/provinces/getbankcodes/0";
      log("Call service api: " + url);
      cordova.plugin.http.sendRequest(
        url,
        {
          method: config.http_method,
          data: {},
          headers: {},
        },
        function (response) {
          try {
            const data = JSON.parse(response.data);
            if (data.Status == -1) {
              masterdata.__loadBankCodes(bankID, callback);
            } else {
              masterdata.bankcodeArr = data.items;
              masterdata.insertBankCodes(data.items, function () {
                const items = [];
                for (var i = 0; i < masterdata.bankcodeArr.length; i++) {
                  if (masterdata.bankcodeArr[i].bankID == bankID) {
                    items.push(masterdata.bankcodeArr[i]);
                  }
                }
                masterdata.currBankcodeArr = items;
                callback(items);
              });
            }
          } catch (err) {
            console.error(err);
            masterdata.__loadBankCodes(bankID, callback);
          }
        },
        function (response) {
          console.error(response.error);
          masterdata.__loadBankCodes(bankID, callback);
        }
      );
    } else {
      masterdata.__loadBankCodes(bankID, callback);
    }
  },
  //
  __loadPrimarySuppliers: function (callback) {
    masterdata.getSuppliersLocal(true, function (items) {
      masterdata.primarySupplierArr = items;
      callback(items);
    });
  },
  //
  loadSuppliers: function (callback) {
    log("LOAD SUPPLIERS");
    if (masterdata.primarySupplierArr.length > 0) {
      callback(masterdata.primarySupplierArr);
      return;
    }
    if (networkReady()) {
      var url = baseURL + "/provinces/primarysuppliers/" + userID;
      log("Call service api: " + url);
      cordova.plugin.http.sendRequest(
        url,
        {
          method: config.http_method,
          data: {},
          headers: {},
        },
        function (response) {
          try {
            const data = JSON.parse(response.data);
            if (data.Status == -1) {
              masterdata.__loadPrimarySuppliers(callback);
            } else {
              masterdata.primarySupplierArr = data.items;
              masterdata.insertSuppliers(data.items, function () {
                callback(masterdata.primarySupplierArr);
              });
            }
          } catch (err) {
            console.error(err);
            masterdata.__loadPrimarySuppliers(callback);
          }
        },
        function (response) {
          console.error(response.error);
          masterdata.__loadPrimarySuppliers(callback);
        }
      );
    } else {
      masterdata.__loadPrimarySuppliers(callback);
    }
  },
  //
  __loadOtherSuppliers: function (callback) {
    masterdata.getSuppliersLocal(false, function (items) {
      masterdata.otherSupplierArr = items;
      callback(items);
    });
  },
  //
  loadOtherSuppliers: function (callback) {
    log("LOAD OTHER SUPPLIERS");
    if (masterdata.otherSupplierArr.length > 0) {
      callback(masterdata.otherSupplierArr);
      return;
    }
    if (networkReady()) {
      var url = baseURL + "/provinces/othersuppliers/" + userID;
      log("Call service api: " + url);
      cordova.plugin.http.sendRequest(
        url,
        {
          method: config.http_method,
          data: {},
          headers: {},
        },
        function (response) {
          try {
            const data = JSON.parse(response.data);
            if (data.Status == -1) {
              masterdata.__loadOtherSuppliers(callback);
            } else {
              masterdata.otherSupplierArr = data.items;
              masterdata.insertSuppliers(data.items, function () {
                callback(masterdata.otherSupplierArr);
              });
            }
          } catch (err) {
            console.error(err);
            masterdata.__loadOtherSuppliers(callback);
          }
        },
        function (response) {
          console.error(response.error);
          masterdata.__loadOtherSuppliers(callback);
        }
      );
    } else {
      masterdata.__loadOtherSuppliers(callback);
    }
  },
};
