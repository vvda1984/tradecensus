using System;

namespace TradeCensus
{
    public interface IDependencyResolver
    {
        T Resolve<T>();
        void Register<T>(Func<T> resolver, bool isSingleInstance = false);
    }
}
