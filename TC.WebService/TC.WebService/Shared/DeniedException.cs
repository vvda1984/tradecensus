using System;

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