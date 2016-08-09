namespace TradeCensus
{
    public class Constants
    {
        public const int ErrorCode = -1;
        public const int SuccessCode = 0;
        public const int Warning = 1;

        public const double EarthR = 6378137; // 6378137: meter

        public const int RoleAudit = 1;
        public const int RoleAudit1 = 101;

        public const int StatusInitial = 0;
        public const int StatusAuditAccept = 2;
        public const int StatusAuditDeny = 3;
        public const int StatusNew = 10;
        public const int StatusPost = 11;

        public const int StatusDone = 30;
        public const int StatusEdit = 1;
        public const int StatusExistingPost = 31;
        public const int StatusExistingAccept = 32;
        public const int StatusExistingDeny = 33;
        public const int StatusDelete = 100;
        public const int StatusDeny = 101;

        public const string FieldDelimeter = ",";
        public const string DataDelimeter = "|||";
        public const string Base64 = "base64";
    }
}