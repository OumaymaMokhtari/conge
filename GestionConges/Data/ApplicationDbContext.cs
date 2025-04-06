using Microsoft.EntityFrameworkCore;
using GestionConges.Models;

namespace GestionConges.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Employe> Employes { get; set; }
        public DbSet<DemandeConge> DemandesConges { get; set; }
        public DbSet<Absence> Absences { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Employe>()
                .HasDiscriminator<string>("Discriminator")
                .HasValue<Employe>("Employe")
                .HasValue<Chef>("Chef");
        }
    }
}
