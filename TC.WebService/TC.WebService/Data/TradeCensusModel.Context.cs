﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace TradeCensus.Data
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    
    public partial class tradecensusEntities : DbContext
    {
        public tradecensusEntities()
            : base("name=tradecensusEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<Area> Areas { get; set; }
        public virtual DbSet<Config> Configs { get; set; }
        public virtual DbSet<OutletType> OutletTypes { get; set; }
        public virtual DbSet<PersonRole> PersonRoles { get; set; }
        public virtual DbSet<SyncDetail> SyncDetails { get; set; }
        public virtual DbSet<SyncHistory> SyncHistories { get; set; }
        public virtual DbSet<Zone> Zones { get; set; }
        public virtual DbSet<OutletHistory> OutletHistories { get; set; }
        public virtual DbSet<Person> People { get; set; }
        public virtual DbSet<ConnectionSession> ConnectionSessions { get; set; }
        public virtual DbSet<Outlet> Outlets { get; set; }
        public virtual DbSet<OutletImage> OutletImages { get; set; }
        public virtual DbSet<GeoBorder> GeoBorders { get; set; }
        public virtual DbSet<Journal> Journals { get; set; }
        public virtual DbSet<Province> Provinces { get; set; }
    }
}
