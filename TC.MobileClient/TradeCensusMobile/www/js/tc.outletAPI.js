/// <reference path="tc.databaseAPI.js" />

const StatusInitial = 0;

const StatusNew = 10;
const StatusPost = 11;
const StatusAuditAccept = 12;
const StatusAuditDeny = 13;
const StatusAuditorNew = 14;
const StatusAuditorAccept = 15;

const StatusEdit = 30;
const StatusExitingPost = 31;
const StatusExitingAccept = 32;
const StatusExitingDeny = 33;

const StatusDone = 40;

const StatusDelete = 100;
const StatusRevert = 102;

var nearByOutlets = [];
var curOutlets = [];
var firstStart = true;
var openOutletDlg = false;

function newOutlet(provinceName) {
    //var provineName  = '';
	//log('province id: ' + config.province_id);
    //for (p = 0; p < provinces.length; p++)
    //    if (provinces[p].id === config.province_id) {
    //        provinceName = provinces[p].name;
    //        break;
    //    }
    //log('provineName: ' + provineName);
    var provinceId = config.province_id;
    if (isEmpty(provinceName)) {
        for (p = 0; p < provinces.length; p++)
            if (provinces[p].id === config.province_id) {
                provinceName = provinces[p].name;
                break;
            }
    } else {
        for (p = 0; p < provinces.length; p++)
            if (provinces[p].name === provinceName) {
                provineId = provinces[p].id;
                break;
            }
    }

    return {
        Action: 0,
        AddLine: '',
        AddLine2: '',
        AmendBy: user.id,
        AmendDate: "",
        AreaID: user.areaID,
        AuditStatus: StatusNew,
        CloseDate: "",
        CreateDate: "",
        Distance: 0,
        District: '',
        FullAddress: "",
        ID: 600000000,
        InputBy: user.id,
        IsOpened: true,
        IsTracked: false,
        LastContact: "",
        LastVisit: "",
        Latitude: curlat,
        Longitude: curlng,
        Name: "",
        Note: '',
        OTypeID: outletTypes[0].ID,
        OutletEmail: null,
        OutletSource: (user.isDSM) ? 1 :0,
        OutletTypeName: outletTypes[0].Name,
        PRowID: guid(),
        PersonID: user.id,
        Phone: "",
        ProvinceID: provinceId,
        ProvinceName: provinceName,
        StringImage1: "",
        StringImage2: "",
        StringImage3: "",
        StringImage4: "",
        StringImage5: "",
        StringImage6: "",
        TotalVolume: 0,
        Tracking: 0,
        VBLVolume: 0,
        IsDraft: true,
        IsNew : true,
        ExtractName: '',
        PersonFirstName: user.firstName,
        PersonLastName: user.lastName,
        auditResult: '',
        viewAuditStatus : false,
        marker: null,
        PStatus: 0,
        AmendByRole: user.role,
        InputByRole: user.role
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

    //if (outlet.FullAddress == null || isEmpty(outlet.FullAddress))
    var fullAddress = '';
    if (outlet.AddLine == null) outlet.AddLine = '';
    if (outlet.AddLine2 == null) outlet.AddLine2 = '';
    if (outlet.Ward == null) outlet.Ward = '';
    if (outlet.District == null) outlet.District = '';
    if (outlet.ProvinceName == null) outlet.ProvinceName = '';
    if (outlet.PersonFirstName == null) outlet.PersonFirstName = '';
    if (outlet.PersonLastName == null) outlet.PersonLastName = '';

    outlet.FullAddress = outlet.AddLine + ' ' + outlet.AddLine2; // + ', ' + outlet.District + ', ' + outlet.ProvinceName;
    if (outlet.Ward !== '') outlet.FullAddress += ', ' + outlet.Ward;
    if (outlet.District !== '') outlet.FullAddress += ', ' + outlet.District;
    if (outlet.ProvinceName !== '') outlet.FullAddress += ', ' + outlet.ProvinceName;

    var exname = '';
    if (outlet.PersonFirstName) {
        exname = exname.concat(outlet.PersonFirstName, ' ');
    }
    if (outlet.PersonLastName) {
        exname = exname.concat(outlet.PersonLastName, ' ');
    }    
    exname = exname.trim();

    if (exname != '') {
        exname = exname.concat(' (', outlet.PersonID.toString(), ')');
    } 

    if (isEmpty(outlet.Note)) outlet.Note = '';
    if (isEmpty(outlet.LastVisit)) outlet.LastVisit = '';
    if (isEmpty(outlet.CloseDate)) outlet.CloseDate = '';

    outlet.ExtractName = exname;
    outlet.IsSynced = (outlet.PSynced) && (outlet.PSynced == 1);
    outlet.IsOpened = isEmpty(outlet.CloseDate);
    outlet.IsTracked = outlet.Tracking == 1;      
    outlet.IsAuditApproved = outlet.AuditStatus == 1;
    outlet.IsNew = outlet.AuditStatus == StatusNew || outlet.AuditStatus == StatusPost ||
                   outlet.AuditStatus == StatusAuditAccept || outlet.AuditStatus == StatusAuditDeny ||
                   outlet.AuditStatus == StatusAuditorNew || outlet.AuditStatus == StatusAuditorAccept;
    outlet.IsDenied = outlet.AuditStatus == StatusAuditDeny || outlet.AuditStatus == StatusExitingDeny;
    outlet.IsDraft = outlet.AuditStatus == StatusNew || outlet.AuditStatus == StatusAuditorNew;
    outlet.canDelete = (outlet.AuditStatus == StatusNew || outlet.AuditStatus == StatusAuditorNew) && outlet.PersonID == user.id;
    outlet.canRevert = false; //outlet.AuditStatus == StatusEdit && outlet.AmendBy == user.id;
    outlet.IsExistingDraft = outlet.AuditStatus == StatusEdit;
    outlet.canPost = !user.hasAuditRole && ((outlet.AuditStatus == StatusNew && outlet.PersonID == user.id ) || (outlet.AuditStatus == StatusEdit && outlet.AmendBy == user.id));
    outlet.canApprove = outlet.AuditStatus == StatusAuditorNew && outlet.PersonID == userID;
    //if (networkReady()) {
    //    outlet.canRevise = outlet.AuditStatus == StatusPost && outlet.PersonID == userID;
    //} else {
    //    outlet.canRevise = outlet.AuditStatus == StatusPost && outlet.PersonID == userID && !outlet.IsSynced;
    //}
    outlet.canRevise = !user.hasAuditRole && ((outlet.AuditStatus == StatusPost && outlet.PersonID == userID) ||
                       (outlet.AuditStatus == StatusExitingPost && outlet.AmendBy == userID));
 
    outlet.hasMarker = false;

    if (outlet.AuditStatus == StatusAuditAccept || outlet.AuditStatus == StatusExitingAccept || outlet.AuditStatus == StatusAuditorAccept) {
        outlet.IsAudited = true;
        outlet.auditResult = 'Approved',
        outlet.viewAuditStatus = true;
    } else if (outlet.AuditStatus == StatusAuditDeny || outlet.AuditStatus == StatusExitingDeny) {
        outlet.IsAudited = false;
        outlet.auditResult = 'Denied',
        outlet.viewAuditStatus = true;
    }

    if (outlet.ID == 60000000)
        outlet.IDalias = '';
    else
        outlet.IDalias = '(' + outlet.ID.toString() + ')';
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
                    var found = 0;
                    var queryOutlets = [];
                    var foundOutlets = [];
                    for (i = 0; i < rowLen; i++) {
                        var outlet = dbres.rows.item(i);
                        outlet.Distance = calcDistance(saleLoc, { Lat: outlet.Latitude, Lng: outlet.Longitude });
                        log('Distance from outlet ' + outlet.ID.toString() + ": " + outlet.Distance.toString());
                        queryOutlets[i] = outlet;
                    }
                    queryOutlets.sort(function (a, b) { return a.Distance - b.Distance });

                    for (i = 0; i < queryOutlets.length && i <= count; i++) {
                        var isMatched = true;
                        if (config.calc_distance_algorithm == "circle")
                            isMatched = queryOutlets[i].Distance <= meter;

                        if (isMatched) {
                            var outlet = queryOutlets[i];
                            log('Found outlet: ' + outlet.ID.toString());
                            
                            initializeOutlet(outlet);
                            outlet.positionIndex = found;
                            foundOutlets[found] = outlet;
                            found++;
                        }
                    }

                    //var foundOutlets = [];
                    //var found = 0;
                    //for (i = 0; i < rowLen; i++) {
                    //    var outlet = dbres.rows.item(i);
                    //    if (outlet.Name == 'Aaaa') {
                    //        log('');
                    //    }
                    //    var distance = 10000000;
                    //    if (config.calc_distance_algorithm == "circle")
                    //        distance = calcDistance(saleLoc, { Lat: outlet.Latitude, Lng: outlet.Longitude });
                    //    log('Distance to Outlet ' + outlet.ID.toString() + ': ' + distance.toString());
                    //    if (distance <= meter) {
                    //        outlet.Distance = distance;
                    //        log('Add outlet ' + outlet.ID.toString() + ' to list');
                    //        initializeOutlet(outlet);
                    //        outlet.positionIndex = foundOutlets.length;
                    //        log('Set ' + outlet.Name + ': ' + outlet.positionIndex.toString());                            
                    //        foundOutlets[found] = outlet;
                    //        found++;
                    //    }
                    //    if (found >= count) break;
                    //}
                    //foundOutlets.sort(function (a, b) { return a.Distance - b.Distance; });
                    callback(true, foundOutlets);
                } else {
                    callback(true, []);
                }
            }, function (dberr) {
                rendringOutlets = false;
                showError(dberr.message);
                callback(false, null);
            });
    } catch (err) {
        log(err);        
        showError(err.message);
        callback(false, null);
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

function isModifed(orgOutlet, outlet) {
    if (orgOutlet.Name !== outlet.Name) return true;

    if (orgOutlet.Phone !== outlet.Phone) return true;

    if (orgOutlet.OTypeID !== outlet.OTypeID) return true;

    if (orgOutlet.AddLine !== outlet.AddLine) return true;

    if (orgOutlet.AddLine2 !== outlet.AddLine2) return true;

    if (orgOutlet.District !== outlet.District) return true;

    if (orgOutlet.ProvinceID !== outlet.ProvinceID) return true;

    if (orgOutlet.TotalVolume !== outlet.TotalVolume) return true;

    if (orgOutlet.VBLVolume !== outlet.VBLVolume) return true;

    if (orgOutlet.Note !== outlet.Note) return true;

    if (orgOutlet.StringImage1 !== outlet.StringImage1) return true;

    if (orgOutlet.StringImage2 !== outlet.StringImage2) return true;

    if (orgOutlet.StringImage3 !== outlet.StringImage3) return true;

    if (orgOutlet.StringImage4 !== outlet.StringImage4) return true;

    if (orgOutlet.StringImage5 !== outlet.StringImage5) return true;

    if (orgOutlet.StringImage6 !== outlet.StringImage6) return true;

    if (orgOutlet.IsTracked !== outlet.IsTracked) return true;

    return false;
}
