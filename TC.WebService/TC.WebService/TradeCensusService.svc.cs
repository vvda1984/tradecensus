using NLog;
using System.ServiceModel.Activation;


namespace TradeCensus
{
    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed)]
    public partial class TradeCensusService : ITradeCensusService
    {
        readonly ILogger _logger = DependencyResolver.Resolve<ILogFactory>().GetLogger("Service");        
    }
}
