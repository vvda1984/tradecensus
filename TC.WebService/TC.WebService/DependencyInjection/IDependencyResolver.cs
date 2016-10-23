using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TradeCensus
{
    public interface IDependencyResolver
    {
        T Resolve<T>();
        void Register<T>(Func<T> resolver, bool isSingleInstance = true);
    }
}
