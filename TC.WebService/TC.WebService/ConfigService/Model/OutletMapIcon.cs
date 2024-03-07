namespace TradeCensus
{
    public class OutletMapIcon
    {
        public int version { get; set; }
        public string tc_salesman_outlet { get; set; }
        public string tc_salesman_outlet_denied { get; set; }
        public string tc_auditor_outlet { get; set; }
        public string tc_auditor_outlet_denied { get; set; }

        public string tc_agency_new_outlet { get; set; } // Sales of Agency creates new outlets
        public string tc_agency_new_outlet_denied { get; set; } // Auditor of Agency denies new outlets
        public string tc_agency_new_outlet_approved { get; set; } // Auditor of Agency approves new outlets
        public string tc_agency_existing_outlet_edited { get; set; } // Sales of Agency edit existing outlets
        public string tc_agency_existing_outlet_denied { get; set; } // Auditor of Agency denies editing of existing outlets
        public string tc_agency_existing_outlet_approved { get; set; } // Auditor of Agency approves editing of existing outlets
        public string tc_agency_auditor_new_outlet { get; set; } // Sales of Agency creates new outlets
        public string tc_agency_auditor_new_outlet_denied { get; set; } // Auditor of Agency denies new outlets
        public string tc_agency_auditor_new_outlet_approved { get; set; } // Auditor of Agency denies new outlets

        public string sr_outlet_audit_denied { get; set; }
        public string sr_outlet_audit_approved { get; set; }
        public string sr_outlet_closed { get; set; }
        public string sr_outlet_non_track { get; set; }
        public string sr_outlet_opened { get; set; }
        public string dis_outlet_audit_denied { get; set; }
        public string dis_outlet_audit_approved { get; set; }
        public string dis_outlet_closed { get; set; }
        public string dis_outlet_opened { get; set; }
    }
}