using System.ComponentModel.DataAnnotations;

namespace GestionConges.Models 
{
    public class Employe
    {
        public int Id { get; set; }
        public string Nom { get; set; }
        public string Prenom { get; set; }
        public DateTime DateNaissance { get; set; }
        public string Email { get; set; }
        public string Telephone { get; set; }
        public DateTime DateEmbauche { get; set; }

        public ICollection<DemandeConge> DemandesConges { get; set; } = new List<DemandeConge>();
    } 
}
