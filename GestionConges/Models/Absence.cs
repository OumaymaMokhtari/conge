using System.ComponentModel.DataAnnotations;

namespace GestionConges.Models
{
    public class Absence
    {
        public int Id { get; set; }
        public int EmployeId { get; set; }
        public DateTime DateAbsence { get; set; }
        public string? Raison { get; set; }
        public string? JustificatifPath { get; set; }
       
        public Employe? Employe { get; set; }
    }

}