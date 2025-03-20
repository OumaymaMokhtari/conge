using GestionConges.Data;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GestionConges.Services;
using GestionConges.ViewModels;
using GestionConges.Models;
using GestionConges.Mappers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

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

        [HttpPost] 
        public async Task<ActionResult<DemandeConge>> Create([FromBody] DemandeCongeVM model)
        {
            _logger.LogInformation($"Requête reçue : EmployeId={model.EmployeId}, DateDebut={model.DateDebut}, DateFin={model.DateFin}");

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Erreur de validation du modèle.");
                return BadRequest(ModelState);
            }

            bool employeExists = await _context.Employes.AnyAsync(e => e.Id == model.EmployeId);
            if (!employeExists)
            {
                _logger.LogError($"Erreur : L'employé avec l'ID {model.EmployeId} n'existe pas !");
                return BadRequest($"L'employé avec l'ID {model.EmployeId} n'existe pas.");
            }

            try
            {
                var result = await _service.Create(model);
                _logger.LogInformation("Demande créée avec succès.");
                return CreatedAtAction(nameof(GetAll), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erreur serveur: {ex.Message}");
                return StatusCode(500, "Une erreur interne s'est produite.");
            }
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
            if (await _service.Delete(id))
                return NoContent();
            return NotFound();
        }

    }

    public class CongeRequestModel 
    {
        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
    }
}
