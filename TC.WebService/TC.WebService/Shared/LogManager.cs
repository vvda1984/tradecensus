using NLog;

namespace TradeCensusService.Shared
{
    public class LogUtil
    {
        public static Logger GetLogger(string name)
        {
            return NLog.LogManager.GetLogger(name);
        }
    }   

    public static class LoggerEx
    {
        public static void Write(this Logger log, string message)
        {
            log.Info(message);
        }

        public static void Write(this Logger log, string message, params object[] args)
        {
            log.Info(string.Format(message, args));
        }
    }
}