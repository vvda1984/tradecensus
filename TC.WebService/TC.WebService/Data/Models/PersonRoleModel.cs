using System;

namespace TradeCensus.Data
{
    public class PersonRoleModel
    {
        public int ID { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int? PosID { get; set; }
        public string HomeAddress { get; set; }
        public string WorkAddress { get; set; }
        public DateTime? DOB { get; set; }
        public string Phone { get; set; }
        public DateTime? HireDate { get; set; }
        public int? ReportTo { get; set; }
        public DateTime? TerminateDate { get; set; }
        public string ZoneID { get; set; }
        public string AreaID { get; set; }
        public string HouseNo { get; set; }
        public string Street { get; set; }
        public string District { get; set; }
        public string ProvinceID { get; set; }
        public string Email { get; set; }
        public string OnLeave { get; set; }
        public string EmailTo { get; set; }
        public int? InputBy { get; set; }
        public DateTime? InputDate { get; set; }
        public int? AmendBy { get; set; }
        public DateTime? AmendDate { get; set; }
        public bool? IsDefaultSA { get; set; }
        public bool? IsDSM { get; set; }
        public int? Role { get; set; }
        public int? AuditorRole { get; set; }
        public string Remarks { get; set; }

        public bool IsAuditor => Role == 1 || Role % 10 == 1 || Role == 3 || Role % 10 == 3;
        public bool IsAuditorSS => IsAuditor && (AuditorRole == 0 || AuditorRole == Constants.AuditorRoleSS);
        public bool IsAuditorASM => IsAuditor && (AuditorRole == Constants.AuditorRoleASM);
    }
}