using NLog;

namespace TradeCensus
{
    public interface ILogFactory
    {
        ILogger GetLogger(string name);
    }

    public class LogFactory : ILogFactory
    {
        public ILogger GetLogger(string name)
        {
            return LogManager.GetLogger(name);
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