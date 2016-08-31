using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TradeCensus
{
    public interface ITCService
    {
    }

    public interface IServiceFactory
    {
        T GetService<T>() where T : ITCService;
    }

    public class ServiceFactory : IServiceFactory
    {
        public T GetService<T>() where T : ITCService
        {
            Type type = typeof(T);
            if (type.FullName == typeof(IConfigService).FullName)
            {
                return (T)(new ConfigService() as ITCService);
            }
            else if (type.FullName == typeof(IPersonService).FullName)
            {
                return (T)(new PersonService() as ITCService);
            }
            else if (type.FullName == typeof(IProvinceService).FullName)
            {
                return (T)(new ProvinceService() as ITCService);
            }
            else if (type.FullName == typeof(IOutletService).FullName)
            {
                return (T)(new OutletService() as ITCService);
            }
            else if (type.FullName == typeof(IBorderService).FullName)
            {
                return (T)(new BorderService() as ITCService);
            }
            else
            {
                throw new Exception(string.Format("Missing type {0}", type.Name));
            }
        }
    }
}