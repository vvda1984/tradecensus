/// <reference path="tc.databaseAPI.js" />

const StatusInitial = 0;
const StatusEdit = 1;
const StatusAuditAccept = 2;
const StatusAuditDeny = 3;
const StatusNew = 10;
const StatusPost = 11;
const StatusDelete = 21;

var nearByOutlets = [];
var curOutlets = [];
var firstStart = true;

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
        AuditStatus: StatusPost,
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
        PStatus: StatusPost,
        IsDraft: false,
        ExtractName: '',
        PersonFirstName: '',
        PersonLastName: '',
    };
}

function initializeOutlet(outlet) {
    if (outlet.ProvinceName == null || isEmpty(outlet.ProvinceName)) {
        var provinceName = '';
        for (p = 0; p < provinces.length; p++)
            if (provinces[p].ID === outlet.ProvinceID) {
                provinceName = provinces[p].Name;
                break;
            }
        outlet.ProvinceName = provinceName;
    }

    if (outlet.OutletTypeName == null || isEmpty(outlet.OutletTypeName)) {
        var outletTypeName = '';
        for (p = 0; p < outletTypes.length; p++)
            if (outletTypes[p].ID === outlet.OTypeID) {
                outletTypeName = outletTypes[p].Name;
                break;
            }
        outlet.OutletTypeName = outletTypeName;
    }

    if (outlet.Distance == null)
        outlet.Distance = 0;

    if (outlet.FullAddress == null || isEmpty(outlet.FullAddress))
        outlet.FullAddress = outlet.AddLine + ' ' + outlet.AddLine2 + ' ' + outlet.District + ' ' + provinceName;

    var exname = '';
    if (outlet.PersonFirstName) {
        exname = exname.concat(outlet.PersonFirstName, ' ');
    }
    if (outlet.PersonLastName) {
        exname = exname.concat(outlet.PersonFirstName, ' ');
    }    
    exname = exname.trim();

    if (exname != '') {
        exname = exname.concat(' (', outlet.PersonID.toString(), ')');
    } else {
        exname = exname.concat('Unknown (', outlet.PersonID.toString(), ')');
    }

    outlet.ExtractName = exname;
    outlet.IsOpened = isEmpty(outlet.CloseDate);
    outlet.IsTracked = outlet.Tracking == 1;      
    outlet.IsAuditApproved = outlet.AuditStatus == 1;
    outlet.IsDraft = outlet.AuditStatus == StatusNew;
    outlet.IsSynced = (outlet.PSynced) && (outlet.PSynced == 1);
}

function queryOutlets(isbackground, view, callback) {
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

                var rowLen = dbres.rows.length;
                log('Found outlets: ' + rowLen.toString());
                if (rowLen) {
                    var foundOutlets = [];
                    var found = 0;
                    for (i = 0; i < rowLen; i++) {
                        var outlet = dbres.rows.item(i);
                        var distance = 10000000;
                        if (config.calc_distance_algorithm == "circle")
                            distance = calcDistance(saleLoc, { Lat: outlet.Latitude, Lng: outlet.Longitude });
                        log('Distance to Outlet ' + outlet.ID.toString() + ': ' + distance.toString());

                        if (distance <= meter) {
                            log('Add outlet ' + outlet.ID.toString() + ' to list');
                            initializeOutlet(outlet);
                            outlet.positionIndex = foundOutlets.length;
                            log('Set ' + outlet.Name + ': ' + outlet.positionIndex.toString());                            
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
                var foundOutlets = [];            
                for (i = 0; i < rowLen; i++) {
                    var outlet = dbres.rows.item(i);                    
                    outlet.Distance = calcDistance(saleLoc, { Lat: outlet.Latitude, Lng: outlet.Longitude });
                    log('Distance from outlet ' + outlet.ID.toString() + ": " + outlet.Distance.toString());
                    foundOutlets[i] = outlet;
                }
                foundOutlets.sort(function (a, b) { return a.Distance - b.Distance });

                for (i = 0; i < foundOutlets.length && i <= count; i++) {                    
                    var isMatched = true; 
                    if (config.calc_distance_algorithm == "circle")
                        isMatched = foundOutlets[i].Distance <= meter;
                    
                    if(isMatched){                        
                        log('Found outlet: ' + outlet.ID.toString());
                        initializeOutlet(foundOutlets[i]);                        
                        nearByOutlets[i] = foundOutlets[i];
                    }                
                }
                
                callback(nearByOutlets);
            } else {
                callback([]);
            }            
        }, function (dberr) {            
            showError(dberr.message);
        });
}