/// <reference path="tc.databaseAPI.js" />

const earthR = 6378137;

var curlat = 10.773598;
var curlng = 106.7058;
var nearByOutlets = [];

function calcRetangleBoundary(dlat, dlng, p) {
    var np = {
        Lat: p.Lat + (dlat / earthR) * (180 / Math.PI),
        Lng: p.Lng + (dlng / earthR) * (180 / Math.PI) / Math.cos(p.Lat * Math.PI / 180)
    };
    return np;
}

function calcDistanceCircle(saleLoc, outletLoc, meter) {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = calculateRad(outletLoc.Lat - saleLoc.Lat);
    var dLong = calculateRad(outletLoc.Lng - saleLoc.Lng);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(calculateRad(saleLoc.Lat)) * Math.cos(calculateRad(outletLoc.Lat)) *
           Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return Math.round(d * 100) / 100;
}

function calculateRad(x) {
    return x * Math.PI / 180;
}

function newOutlet() {
    var provineName  = '';
	log('province id: ' + config.province_id);
    for (p = 0; p < provinces.length; p++)
        if (provinces[p].id === config.province_id) {
            provinceName = provinces[p].name;
            break;
        }
	log('provineName: ' + provineName);

    return {
        Action: 0,
        AddLine: '',
        AddLine2: '',
        AmendBy: 11693,
        AmendDate: "",
        AreaID: user.areaID,
        AuditStatus: 0,
        CloseDate: "",
        CreateDate: "",
        Distance: 0,
        District: '',
        FullAddress: "",
        ID: parseInt('65' + config.province_id + (Math.random() * 100000)),
        InputBy: user.id,
        IsOpened: true,
        IsTracked: false,
        LastContact: "",
        LastVisit: "",
        Latitude: curlat,
        Longitude: curlng,
        Name: "",
        Note: null,
        OTypeID: outletTypes[0].ID,
        OutletEmail: null,
        OutletSource: 1,
        OutletTypeName: outletTypes[0].Name,
        PRowID: '',
        PersonID: user.id,
        Phone: "",
        ProvinceID : config.province_id,
        ProvinceName: provinceName,
        StringImage1: "",
        StringImage2: "",
        StringImage3: "",
        TotalVolume: 0,
        Tracking: 0,
        VBLVolume: 0,
        PStatus: 0,
        IsDraft: false,        
    };
}

function initializeOutlet(outlet) {
    if(outlet.ProvinceName == null || isEmpty(outlet.ProvinceName)){
        var provinceName = '';
        for (p = 0; p < provinces.length; p++)
            if (provinces[p].id === outlet.ProvinceID) {
                provinceName = provinces[p].name;
                break;
            }
         outlet.ProvinceName = provinceName;
    }

    if(outlet.OutletTypeName == null || isEmpty(outlet.OutletTypeName)){
        var outletTypeName = '';
        for (p = 0; p < outletTypes.length; p++)
        if (outletTypes[p].id === outlet.OTypeID) {
            outletTypeName = outletTypes[p].name;
            break;
        }
        outlet.OutletTypeName = outletTypeName;
    }

    if(outlet.Distance == null)
        outlet.Distance = 0;
    
    if(outlet.FullAddress == null || isEmpty(outlet.FullAddress))   
        outlet.FullAddress = outlet.AddLine + ' ' + outlet.AddLine2 + ' ' + outlet.District + ' ' + provinceName;

    outlet.IsOpened = isEmpty(outlet.CloseDate);
    outlet.IsTracked = outlet.Tracking == 1;
    //outlet.IsAuditApproved = outlet.AuditStatus == 1;
    outlet.IsDraft = outlet.PStatus == 1;
	outlet.IsSynced = (outlet.PSynced) && (outlet.PSynced == 1);  
}

function queryOutlets(view, callback) {
    showDlg('Get outlets', "Please wait...");
    try {
        meter = config.distance;
        count = config.item_count;
        var saleLoc = { Lat: curlat, Lng: curlng };
        var tl = calcRetangleBoundary(meter, 0 - meter, saleLoc);
        var tr = calcRetangleBoundary(meter, meter, saleLoc);
        var bl = calcRetangleBoundary(0 - meter, 0 - meter, saleLoc);
        var br = calcRetangleBoundary(0 - meter, meter, saleLoc);

        selectOutletsDB(config.tbl_outlet, bl.Lat, tl.Lat, bl.Lng, br.Lng, view, //config.province_id,
            function (dbres) {
                //hideDlg();
                //var rowLen = dbres.rows.length;
                //log('Found outlets: ' + rowLen.toString());
                //if (rowLen) {
                //    var foundOutlets = [];
                //    for (var i = 0; i < rowLen; i++) {
                //        var outlet = dbres.rows[i];
                //        initializeOutlet(outlet);                        
                //        foundOutlets[i] = outlet;
                //    }
                //    callback(foundOutlets);
                //} else {
                //    callback([]);
                //}
                var rowLen = dbres.rows.length;
                log('Found outlets: ' + rowLen.toString());
                if (rowLen) {
                    var foundOutlets = [];
                    var found = 0;
                    for (i = 0; i < rowLen; i++) {
                        var outlet = dbres.rows.item(i);
                        var distance = 10000000;
                        if (config.calc_distance_algorithm == "circle")
                            distance = calcDistanceCircle(saleLoc, { Lat: outlet.Latitude, Lng: outlet.Longitude }, meter);
                        log('Distance to Outlet ' + outlet.ID.toString() + ': ' + distance.toString());

                        if (distance <= meter) {
                            log('Add outlet ' + outlet.ID.toString() + ' to list');
                            initializeOutlet(outlet);
                            foundOutlets[found] = outlet;
                            found++;
                        }
                        if (found >= count) break;
                    }
                    foundOutlets.sort(function (a, b) { return a.Distance - b.Distance });
                    callback(foundOutlets);
                } else {
                    callback([]);
                }
            }, function (dberr) {              
                showError(dberr.message);
            });
    } catch (err) {
        log(err);        
        showError(err.message);
    }
}

function queryNearbyOutlets(callback) {  
    meter = config.distance;
    count = config.item_count;
    log('item count:' + count.toString());
    var saleLoc = { Lat: curlat, Lng: curlng };
    var tl = calcRetangleBoundary(meter, 0 - meter, saleLoc);
    var tr = calcRetangleBoundary(meter, meter, saleLoc);
    var bl = calcRetangleBoundary(0 - meter, 0 - meter, saleLoc);
    var br = calcRetangleBoundary(0 - meter, meter, saleLoc);
    log('Select outlets in range ' + config.distance.toString());
    selectOutletsInRangeDB(config.tbl_outlet, bl.Lat, tl.Lat, bl.Lng, br.Lng,
        function (dbres) {
            var rowLen = dbres.rows.length;
            log('Found outlets: ' + rowLen.toString());
            nearByOutlets = [];
            if (rowLen) {
                var found = 0;                
                for (i = 0; i < rowLen; i++) {
                    var outlet = dbres.rows.item(i);
                    var distance = 10000000;
                    if (config.calc_distance_algorithm == "circle")
                        distance = calcDistanceCircle(saleLoc, { Lat: outlet.Latitude, Lng: outlet.Longitude }, meter);
                    log('Distance to Outlet ' + outlet.ID.toString() + ': ' + distance.toString());

                    if (distance <= meter) {
                        log('Add outlet ' + outlet.ID.toString() + ' to list');
                        initializeOutlet(outlet);
                        nearByOutlets[found] = outlet;
                        found++;
                    }
                    if (found >= count) break;
                }
                nearByOutlets.sort(function (a, b) { return a.Distance - b.Distance });
                callback(nearByOutlets);
            } else {
                callback([]);
            }            
        }, function (dberr) {            
            showError(dberr.message);
        });
}