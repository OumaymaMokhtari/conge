using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GestionConges.Models;
using GestionConges.Data;
using System;
using System.IO;
using Microsoft.AspNetCore.Authorization;

namespace GestionConges.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AbsencesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AbsencesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 🔹 Absences d'un employé (profil personnel)
        [HttpGet("employe/{id}")]
        public async Task<ActionResult<IEnumerable<Absence>>> GetAbsencesByEmploye(int id)
        {
            var absences = await _context.Absences
                .Where(a => a.EmployeId == id)
                .OrderByDescending(a => a.DateAbsence)
                .ToListAsync();

            return Ok(absences);
        }

        // 🔹 Upload d’un justificatif (si < 24h)
        [HttpPost("{id}/justificatif")]
        [Authorize] // Optionnel : sécurise l’upload
        public async Task<IActionResult> UploadJustificatif(int id, IFormFile fichier)
        {
            var absence = await _context.Absences.FindAsync(id);
            if (absence == null)
                return NotFound("Absence introuvable");

            var maintenant = DateTime.Now;
            if ((maintenant - absence.DateAbsence).TotalHours > 24)
                return BadRequest("Délai de 24h dépassé pour ajouter un justificatif.");

            if (fichier == null || fichier.Length == 0)
                return BadRequest("Fichier invalide.");

            var dossier = Path.Combine("wwwroot", "justificatifs");
            if (!Directory.Exists(dossier))
                Directory.CreateDirectory(dossier);

            var nomFichier = $"absence_{id}_{DateTime.Now.Ticks}{Path.GetExtension(fichier.FileName)}";
            var cheminFichier = Path.Combine(dossier, nomFichier);

            using (var stream = new FileStream(cheminFichier, FileMode.Create))
            {
                await fichier.CopyToAsync(stream);
            }

            absence.JustificatifPath = $"justificatifs/{nomFichier}";
            await _context.SaveChangesAsync();

            return Ok("Justificatif enregistré avec succès !");
        }

        // 🔹 Liste complète des absences (chef uniquement)
        [HttpGet]
        
        public async Task<IActionResult> GetAllAbsences()
        {
            var absences = await _context.Absences
                .Include(a => a.Employe)
                .Select(a => new
                {
                    a.Id,
                    a.DateAbsence,
                    a.Raison,
                    a.JustificatifPath,
                    NomEmploye = a.Employe.Nom + " " + a.Employe.Prenom
                })
                .ToListAsync();

            return Ok(absences);
        }
    }
}
