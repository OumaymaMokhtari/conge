using Microsoft.EntityFrameworkCore;
using GestionConges.Models;

namespace GestionConges.Data 
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Employe> Employes { get; set; }
        public DbSet<DemandeConge> DemandesConges { get; set; }
    }
}
