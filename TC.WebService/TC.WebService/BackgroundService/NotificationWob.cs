using TradeCensus.Data;

namespace TradeCensus
{
    public class NotificationWob
    {
        public int PersonID { get; set; }
        public PersonRoleModel Person { get; set; }
        public OutletModel Outlet { get; set; }
        public int AuditStatus { get; set; }
    }
}