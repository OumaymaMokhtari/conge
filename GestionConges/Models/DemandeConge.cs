using System.ComponentModel.DataAnnotations;

namespace GestionConges.Models 
{
    public class DemandeConge
    {
        public int Id { get; set; }
        public int EmployeId { get; set; }
        public Employe Employe { get; set; }
        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
        public int Duree { get; set; }
        public string TypeConge { get; set; }
        public string? Commentaire { get; set; }
        public string Statut { get; set; } = "En attente";
        public string? JustificatifPath { get; set; }


    }
}
