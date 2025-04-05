using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using GestionConges.Models;
using GestionConges.Data;
using GestionConges.ViewModels;
using GestionConges.Mappers;

namespace GestionConges.Services  
{
    public class DemandeCongeService : IDemandeCongeService
    {
        private readonly ApplicationDbContext _context;
        private readonly CongeCalculatorService _calculator;

        public DemandeCongeService(ApplicationDbContext context, CongeCalculatorService calculator)
        {
            _context = context;
            _calculator = calculator;
        }

        public async Task<List<DemandeCongeVM>> GetAll()
        {
            return await _context.DemandesConges
                .Select(dc => new DemandeCongeVM
                {
                    Id = dc.Id, // ✅ Ce champ est crucial
                    EmployeId = dc.EmployeId,
                    DateDebut = dc.DateDebut,
                    DateFin = dc.DateFin,
                    TypeConge = dc.TypeConge,
                    Commentaire = dc.Commentaire,
                    Statut = dc.Statut
                })
                .ToListAsync();
        }
        public async Task<DemandeConge> Create(DemandeCongeVM model)
        {
            var demande = DemandeCongeMapper.ToEntity(model);
            demande.Duree = _calculator.CalculerJoursOuvres(demande.DateDebut, demande.DateFin);
            _context.DemandesConges.Add(demande);
            await _context.SaveChangesAsync();
            return demande;
        }

        public async Task<bool> Delete(int id)
        {
            var demande = await _context.DemandesConges.FindAsync(id);
            if (demande == null) return false;

            _context.DemandesConges.Remove(demande);
            await _context.SaveChangesAsync();
            return true;
        }
    } 
}
