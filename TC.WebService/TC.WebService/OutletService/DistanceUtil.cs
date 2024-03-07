using System;

namespace TradeCensus
{
    public class DistanceUtil
    {
        public static double CalcDistance(Point p1, Point p2)
        {
            var R = 6378137; // Earth’s mean radius in meter
            var dLat = CalcRad(p2.Lat - p1.Lat);
            var dLong = CalcRad(p2.Lng - p1.Lng);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) + Math.Cos(CalcRad(p1.Lat)) * Math.Cos(CalcRad(p2.Lat)) *
                    Math.Sin(dLong / 2) * Math.Sin(dLong / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            var d = R * c;
            return Math.Round(d, 2);
        }

        public static double CalcRad(double x)
        {
            return x * Math.PI / 180;
        }

        //private double InDistanceSquare(Point saleLoc, Point outletLoc, double meter)
        //{
        //    var o1 = outletLoc.Lng + (meter * 0.0001) / 11.32;
        //    var o3 = outletLoc.Lng - (meter * 0.0001) / 11.32;
        //    var o2 = outletLoc.Lat + (meter * 0.0001) / 11.32;
        //    var o4 = outletLoc.Lat - (meter * 0.0001) / 11.32;

        //    if (saleLoc.Lat <= 0 && saleLoc.Lng >= 0) return saleLoc.Lat >= o4 && saleLoc.Lng <= o1;
        //    if (saleLoc.Lat >= 0 && saleLoc.Lng >= 0) return saleLoc.Lat <= o2 && saleLoc.Lng <= o1;
        //    if (saleLoc.Lat >= 0 && saleLoc.Lng <= 0) return saleLoc.Lat <= o2 && saleLoc.Lng >= o3;
        //    if (saleLoc.Lat <= 0 && saleLoc.Lng <= 0) return saleLoc.Lat >= o4 && saleLoc.Lng >= o3;
        //    return false;
        //}    

        public static Point CalcShiftedPoint(double dlat, double dlng, Point p)
        {
            Point newP = new Point
            {
                Lat = p.Lat + (dlat / Constants.EarthR) * (180 / Math.PI),
                Lng = p.Lng + (dlng / Constants.EarthR) * (180 / Math.PI) / Math.Cos(p.Lat * Math.PI / 180)
            };
            return newP;
        }
    }
}