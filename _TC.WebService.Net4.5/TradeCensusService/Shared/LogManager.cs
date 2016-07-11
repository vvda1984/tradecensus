using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TradeCensusService.Shared
{
    public class LogManager
    {
        public static Logger GetLogger(string name)
        {
            return new Logger() { Name = name };
        }
    }   

    public class Logger
    {
        public string Name { get; set; }
        public void Write(string message)
        {
        }
        public void Write(string message, params object[] args)
        {
            Write(string.Format(message, args));
        }
    }
}