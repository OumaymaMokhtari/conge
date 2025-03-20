using System.ComponentModel.DataAnnotations;
using GestionConges.Filters;

namespace GestionConges.ViewModels 
{
    public class DemandeCongeVM
    {
        [Required(ErrorMessage = "L'ID de l'employé est requis.")]
        public int EmployeId { get; set; }

        [Required(ErrorMessage = "La date de début est obligatoire.")]
        public DateTime DateDebut { get; set; }

        [Required(ErrorMessage = "La date de fin est obligatoire.")]
        [DateGreaterThan("DateDebut", ErrorMessage = "La date de fin doit être postérieure à la date de début.")]
        public DateTime DateFin { get; set; }

        [Required(ErrorMessage = "Le type de congé est obligatoire.")]
        public string TypeConge { get; set; }

        public string? Commentaire { get; set; }
    }
}
