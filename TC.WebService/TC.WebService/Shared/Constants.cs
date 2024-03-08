namespace TradeCensus
{
    public static class Constants
    {
        public const int ErrorCode = -1;
        public const int SuccessCode = 0;
        public const int Warning = 1;

        public const double EarthR = 6378137; // 6378137: meter
        public const int DefaultOutletID = 600000000;

        //SR/DSM -> SS (auditor 1) -> ASM (auditor 2)
        public const int RoleAudit = 1;
        public const int RoleAudit1 = 101;
        public const int RoleAgency = 2;
        public const int RoleAgencyAudit = 3;
        public const int RoleAgencyAudit1 = 103;
        public const int RoleAuditM = 4;
        public const int RoleAuditM1 = 104;

        public const int StatusInitial = 0;

        public const int StatusNew = 10;
        public const int StatusPost = 11;
        public const int StatusAuditAccept = 12;
        public const int StatusAuditDeny = 13;
        public const int StatusAuditorNew = 14;
        public const int StatusAuditorAccept = 15;

        public const int StatusEdit = 30;
        public const int StatusExistingPost = 31;
        public const int StatusExistingAccept = 32;
        public const int StatusExistingDeny = 33;
        public const int StatusDone = 40;
        public const int StatusDelete = 100;
        public const int StatusDeny = 101;
        public const int StatusRevert = 102;

        //public const int New

        public const string FieldDelimeter = ",";
        public const string DataDelimeter = "|||";
        public const string Base64 = "base64";

        public const string ShortDateFormat = "yyyy-MM-dd";
        public const string DatetimeFormat = "yyyy-MM-dd HH:mm:ss";

    }
}