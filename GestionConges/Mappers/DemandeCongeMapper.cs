using GestionConges.Models;
using GestionConges.ViewModels;

namespace GestionConges.Mappers
{
    public static class DemandeCongeMapper
    {
        public static DemandeConge ToEntity(DemandeCongeVM model)
        {
            return new DemandeConge
            {
                EmployeId = model.EmployeId,
                DateDebut = model.DateDebut,
                DateFin = model.DateFin,
                Duree = (model.DateFin - model.DateDebut).Days,
                TypeConge = model.TypeConge,
                Commentaire = model.Commentaire,
                Statut = "En attente"
            };
        }

        public static DemandeCongeVM ToViewModel(DemandeConge entity)
        {
            return new DemandeCongeVM
            {
                EmployeId = entity.EmployeId,
                DateDebut = entity.DateDebut,
                DateFin = entity.DateFin,
                TypeConge = entity.TypeConge,
                Commentaire = entity.Commentaire
            };
        }
    }
}
