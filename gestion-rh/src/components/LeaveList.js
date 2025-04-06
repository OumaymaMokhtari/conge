import React, { useEffect, useState } from "react";
import { fetchCongesParEmploye, deleteConge } from "../Services/api";
import "bootstrap/dist/css/bootstrap.min.css";

const LeaveList = () => {
  const [conges, setConges] = useState([]);
  const employeId = parseInt(localStorage.getItem("employeId")); // ✅ récupère ID de l’employé

  useEffect(() => {
    const getConges = async () => {
      try {
        const data = await fetchCongesParEmploye(employeId);
        setConges(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des congés :", error);
      }
    };
    getConges();
  }, [employeId]);

  const handleDelete = async (id) => {
    try {
      await deleteConge(id);
      setConges(conges.filter((c) => c.id !== id));
    } catch (error) {
      alert("ID de congé introuvable pour la suppression.");
    }
  };

  return (
    <div className="container">
      <h2 className="mt-4">Liste de mes demandes de congé</h2>
      <table className="table table-bordered table-hover mt-3">
        <thead className="table">
          <tr>
            <th>#</th>
            <th>Type de congé</th>
            <th>Date de début</th>
            <th>Date de fin</th>
            <th>Commentaire</th>
            <th>Statut</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {conges.length > 0 ? (
            conges.map((conge, index) => (
              <tr key={conge.id} className="text-center">
                <td>{index + 1}</td>
                <td>{conge.typeConge}</td>
                <td>{new Date(conge.dateDebut).toLocaleDateString()}</td>
                <td>{new Date(conge.dateFin).toLocaleDateString()}</td>
                <td>{conge.commentaire || "Aucun"}</td>
                <td>
                  <span
                    className={`badge bg-${
                      conge.statut === "Validé"
                        ? "success"
                        : conge.statut === "Refusé"
                        ? "danger"
                        : "warning"
                    }`}
                  >
                    {conge.statut}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(conge.id)}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center text-muted">
                Aucune demande trouvée.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveList;
