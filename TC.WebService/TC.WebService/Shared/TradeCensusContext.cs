using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TradeCensus
{
    public class TradeCensusContext
    {
        public TradeCensusContext()
        {
            ServiceFactory = new ServiceFactory();
            LogFactory = new LogFactory();
        }

        public IServiceFactory ServiceFactory { get; set; }
        public ILogFactory LogFactory { get; set; }
    }
}