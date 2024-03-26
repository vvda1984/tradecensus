using TradeCensus.Data;

namespace TradeCensus
{
    public abstract class NotificationWob
    {
        public int AuditStatus { get; set; }
        public int PersonID { get; set; }
        public int OutletID { get; set; }
        public Outlet DbOutlet { get; set; }
        public OutletModel Outlet { get; set; }
        public Person Recipient { get; set; }
        public Person OutletPerson { get; set; }
        public PersonRoleModel Person { get; set; }
    }

    public class NotificationPersonWob : NotificationWob
    { }

    public class NoficiationAdhocWob : NotificationWob
    {
        public string Email { get; set; }
    }
}