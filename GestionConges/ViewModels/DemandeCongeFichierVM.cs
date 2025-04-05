using Microsoft.AspNetCore.Http;
using System;
using System.ComponentModel.DataAnnotations;

namespace GestionConges.ViewModels
{
    public class DemandeCongeFichierVM
    {
        public int EmployeId { get; set; }

        [Required]
        public DateTime DateDebut { get; set; }

        [Required]
        public DateTime DateFin { get; set; }

        [Required]
        public string TypeConge { get; set; }

        public string? Commentaire { get; set; }

        public IFormFile? Justificatif { get; set; }
    }
}
