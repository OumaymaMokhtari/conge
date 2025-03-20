using System.Collections.Generic;
using System.Threading.Tasks;
using GestionConges.ViewModels;
using GestionConges.Models;

namespace GestionConges.Services 
{
    public interface IDemandeCongeService
    {
        Task<List<DemandeCongeVM>> GetAll();
        Task<DemandeConge> Create(DemandeCongeVM model);
        Task<bool> Delete(int id);
    } 
}
