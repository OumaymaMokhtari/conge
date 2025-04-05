using GestionConges.Data;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GestionConges.Services;
using GestionConges.ViewModels;
using GestionConges.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.IO;

namespace GestionConges.Controllers
{
    [Route("api/conges")]
    [ApiController]
    public class DemandeCongeController : ControllerBase
    {
        private readonly IDemandeCongeService _service;
        private readonly ApplicationDbContext _context;
        private readonly CongeCalculatorService _calculator;
        private readonly ILogger<DemandeCongeController> _logger;

        public DemandeCongeController(
            IDemandeCongeService service,
            ApplicationDbContext context,
            CongeCalculatorService calculator,
            ILogger<DemandeCongeController> logger)
        {
            _service = service;
            _context = context;
            _calculator = calculator;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<List<DemandeCongeVM>>> GetAll()
        {
            return Ok(await _service.GetAll());
        }

        [HttpGet("par-employe/{employeId}")]
        public async Task<ActionResult<IEnumerable<DemandeCongeVM>>> GetParEmploye(int employeId)
        {
            var demandes = await _context.DemandesConges
                .Where(d => d.EmployeId == employeId)
                .Select(d => new DemandeCongeVM
                {
                    Id = d.Id,
                    EmployeId = d.EmployeId,
                    DateDebut = d.DateDebut,
                    DateFin = d.DateFin,
                    TypeConge = d.TypeConge,
                    Commentaire = d.Commentaire,
                    Statut = d.Statut
                })
                .ToListAsync();

            return Ok(demandes);
        }
        [HttpPost("avec-fichier")]
        public async Task<IActionResult> CreateWithFile([FromForm] DemandeCongeFichierVM model)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var conge = new DemandeConge
                {
                    EmployeId = model.EmployeId,
                    DateDebut = model.DateDebut,
                    DateFin = model.DateFin,
                    TypeConge = model.TypeConge,
                    Commentaire = model.Commentaire,
                    Statut = "En attente"
                };

                if (model.Justificatif != null && model.TypeConge == "Maladie")
                {
                    var fileName = Guid.NewGuid() + Path.GetExtension(model.Justificatif.FileName);
                    var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/justificatifs", fileName);

                    // Vérifie que le dossier existe
                    var dir = Path.GetDirectoryName(path);
                    if (!Directory.Exists(dir))
                        Directory.CreateDirectory(dir);

                    using (var stream = new FileStream(path, FileMode.Create))
                    {
                        await model.Justificatif.CopyToAsync(stream);
                    }

                    conge.JustificatifPath = fileName; // à inclure dans le modèle
                }

                _context.DemandesConges.Add(conge);
                await _context.SaveChangesAsync();
                return Ok(conge);
            }
            catch (Exception ex)
            {
                _logger.LogError("Erreur lors de la création du congé avec fichier : " + ex.Message);
                return StatusCode(500, "Erreur serveur : " + ex.Message);
            }
        }
        [HttpGet("justificatif/{filename}")]
        public IActionResult TelechargerJustificatif(string filename)
        {
            var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "justificatifs", filename);
            if (!System.IO.File.Exists(path))
                return NotFound("Fichier non trouvé");

            var contentType = "application/octet-stream";
            return PhysicalFile(path, contentType, filename);
        }

        [HttpPost("calculer-duree")]
        public ActionResult<int> CalculerDuree([FromBody] CongeRequestModel request)
        {
            if (request.DateDebut > request.DateFin)
                return BadRequest("La date de début doit être antérieure à la date de fin.");

            int duree = _calculator.CalculerJoursOuvres(request.DateDebut, request.DateFin);
            return Ok(duree);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var conge = await _context.DemandesConges.FindAsync(id);
            if (conge == null)
                return NotFound("ID de congé introuvable.");

            _context.DemandesConges.Remove(conge);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStatut(int id, [FromBody] StatutUpdateVM request)
        {
            var conge = await _context.DemandesConges.FindAsync(id);
            if (conge == null)
                return NotFound();

            conge.Statut = request.Statut;
            await _context.SaveChangesAsync();

            return Ok("Statut mis à jour");
        }

        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<object>>> GetDemandesEnAttente()
        {
            var demandes = await _context.DemandesConges
                .Include(d => d.Employe)
                .Select(d => new
                {
                    d.Id,
                    NomEmploye = d.Employe.Nom + " " + d.Employe.Prenom,
                    d.Employe.SoldeConge,
                    d.DateDebut,
                    d.DateFin,
                    d.TypeConge,
                    d.Commentaire,
                    d.Statut,
                    d.JustificatifPath 
                })
                .ToListAsync();

            return Ok(demandes);
        }

        [HttpPut("{id}/statut")]
        public async Task<IActionResult> ModifierStatut(int id, [FromBody] StatutUpdateVM request)
        {
            var demande = await _context.DemandesConges
                .Include(d => d.Employe)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (demande == null)
                return NotFound("Demande introuvable");

            if (request.Statut != "Validé" && request.Statut != "Refusé")
                return BadRequest("Statut invalide. Utilisez 'Validé' ou 'Refusé'.");

            demande.Statut = request.Statut;
            if (request.Statut == "Validé" && demande.Employe != null)
            {
                int dureeConge = (demande.DateFin - demande.DateDebut).Days + 1;
                demande.Employe.SoldeConge -= dureeConge;
                if (demande.Employe.SoldeConge < 0) demande.Employe.SoldeConge = 0;
            }

            await _context.SaveChangesAsync();
            return Ok($"Demande {id} mise à jour avec le statut '{request.Statut}'");
        }

        [HttpGet("solde/{employeId}")]
        public async Task<IActionResult> GetSoldeConge(int employeId)
        {
            var employe = await _context.Employes.FindAsync(employeId);
            if (employe == null)
                return NotFound("Employé non trouvé");

            return Ok(employe.SoldeConge);
        }

    }

    public class StatutUpdateVM
    {
        public string Statut { get; set; }
    }

    public class CongeRequestModel
    {
        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
    }
}
