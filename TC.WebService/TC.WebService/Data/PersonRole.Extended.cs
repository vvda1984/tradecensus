using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TradeCensus.Data
{
    public partial class PersonRole
    {
        public bool IsAuditor
        {
            get { return Role == 1 || Role % 10 == 1 || Role == 3 || Role % 10 == 3; }
        }
    }
}