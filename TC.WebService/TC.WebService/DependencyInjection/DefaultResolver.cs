using System;
using System.Collections.Generic;

namespace TradeCensus
{
    class DefaultResolver : IDependencyResolver
    {
        Dictionary<Type, Tuple<bool, object, object>> _dictionary = new Dictionary<Type, Tuple<bool, object, object>>();
        object _lock = new object();
      
        public void Register<T>(Func<T> resovlver, bool isSingleInstance = true)
        {
            if (resovlver == null) throw new ArgumentException("Resovler is required");
            lock (_lock)
            {
                var type = typeof(T);
                if (!_dictionary.ContainsKey(type))
                    _dictionary.Add(type, new Tuple<bool, object, object>(
                        isSingleInstance, resovlver, isSingleInstance ? resovlver.Invoke() : default(T)));
            }
        }

        public T Resolve<T>()
        {
            lock (_lock)
            {
                var type = typeof(T);
                if (_dictionary.ContainsKey(type))
                {
                    var entry = _dictionary[type];
                    if (entry.Item1)
                        return (T)entry.Item3;
                    else
                        return ((Func<T>)entry.Item3).Invoke();
                }
                else
                    return default(T);
            }
        }
    }
}