using System;

namespace TradeCensus
{
    class DependencyResolver
    {
        static IDependencyResolver _current;

        public static void SetResolver(IDependencyResolver resolver, Action<IDependencyResolver> registerAction)
        {
            _current = resolver;
            registerAction.Invoke(_current);
        }

        public static T Resolve<T>()
        {
            if (_current == null)
                return default(T);

            return _current.Resolve<T>();
        }
    }
}