using TradeCensus.Data;

namespace TradeCensus
{
    public class UserModel : Person
    {
        public int UserID { get; set; }
        public int Role { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
    }
}