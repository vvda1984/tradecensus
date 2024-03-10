using System;
using System.Web;

namespace TradeCensus
{
    public class Global : System.Web.HttpApplication
    {
        protected void Application_Start(object sender, EventArgs e)
        {
            //JsonConvert.DefaultSettings = () => new JsonSerializerSettings
            //{
            //    DateFormatHandling = DateFormatHandling.IsoDateFormat,
            //    DateTimeZoneHandling = DateTimeZoneHandling.Utc,
            //    ContractResolver = new CamelCasePropertyNamesContractResolver(),
            //    ReferenceLoopHandling = ReferenceLoopHandling.Ignore
            //};

            DependencyResolver.SetResolver(new DefaultResolver(), resolver =>
            {
                resolver.Register<ILogFactory>(() => new LogFactory(), true);
                resolver.Register<IConfigService>(() => new ConfigService());
                resolver.Register<IPersonService>(() => new PersonService());
                resolver.Register<IProvinceService>(() => new ProvinceService());
                resolver.Register<IOutletService>(() => new OutletService());
                resolver.Register<IBorderService>(() => new BorderService());
                resolver.Register<IJournalService>(() => new JournalService());
            });
            NotificationService.Start();
        }

        protected void Session_Start(object sender, EventArgs e)
        {

        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {
            HttpContext.Current.Response.AddHeader("Access-Control-Allow-Origin", "*");
            if (HttpContext.Current.Request.HttpMethod == "OPTIONS")
            {
                HttpContext.Current.Response.AddHeader("Cache-Control", "no-cache");
                HttpContext.Current.Response.AddHeader("Access-Control-Allow-Methods", "GET, POST");
                HttpContext.Current.Response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
                HttpContext.Current.Response.AddHeader("Access-Control-Max-Age", "1728000");
                HttpContext.Current.Response.End();
            }
        }

        protected void Application_AuthenticateRequest(object sender, EventArgs e)
        {

        }

        protected void Application_Error(object sender, EventArgs e)
        {

        }

        protected void Session_End(object sender, EventArgs e)
        {

        }

        protected void Application_End(object sender, EventArgs e)
        {
            try
            {
                NotificationService.Instance.Stop();
            }
            catch
            {
                // do nothing
            }
        }
    }
}