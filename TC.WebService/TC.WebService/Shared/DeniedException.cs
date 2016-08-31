using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TradeCensus
{
    public class DeniedException : Exception
    {

        public DeniedException() : base()
        {

        }
        public DeniedException(string msg) : base(msg)
        {

        }
    }
}