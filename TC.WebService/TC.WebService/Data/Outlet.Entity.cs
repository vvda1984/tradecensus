
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TradeCensus.Data
{
    public class OutletEntity : Outlet
    {
        public string ProvinceName { get; set; }

        public string PersonFirstName { get; set; }

        public string PersonLastName { get; set; }

        public bool? PersonIsDSM { get; set; }

        public string OutletTypeName { get; set; }

        public int? AmendByRole { get; set; }

        public int? InputByRole { get; set; }
    }
}