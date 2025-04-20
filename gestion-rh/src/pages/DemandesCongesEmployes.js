import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/global.css";

const DemandesCongesEmployes = () => {
  const [demandes, setDemandes] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:5148/api/conges/pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("Demandes récupérées :", res.data);
        setDemandes(res.data);
      })
      .catch((err) => console.error("Erreur récupération demandes", err));
  }, []);

  const mettreAJourStatut = (id, statut) => {
    axios
      .put(
        `http://localhost:5148/api/conges/${id}/statut`,
        { statut },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        setDemandes((prev) =>
          prev.map((d) => (d.id === id ? { ...d, statut } : d))
        );
      })
      .catch((err) => console.error("Erreur mise à jour du statut", err));
  };

  return (
    <div>
      <h2>Demandes de congé des employés</h2>
      {demandes.length === 0 ? (
        <p>Aucune demande en attente.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Employé</th>
              <th>Type</th>
              <th>Du</th>
              <th>Au</th>
              <th>Solde</th>
              <th>Statut</th>
              <th>Justificatif</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {demandes.map((demande) => (
              <tr key={demande.id}>
                <td>{demande.nomEmploye}</td>
                <td>{demande.typeConge}</td>
                <td>{new Date(demande.dateDebut).toLocaleDateString()}</td>
                <td>{new Date(demande.dateFin).toLocaleDateString()}</td>
                <td>{demande.soldeConge} Solde</td>
                <td>{demande.statut}</td>
                <td>
                  {demande.justificatifPath ? (
                    <a
                      href={`http://localhost:5148/api/conges/justificatif/${demande.justificatifPath}`}
                      className="btn btn-sm btn-secondary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Télécharger
                    </a>
                  ) : (
                    "Aucun"
                  )}
                </td>
                <td>
                    {demande.statut === "En attente" ? (
                      <>
                        <button
                          onClick={() => mettreAJourStatut(demande.id, "Validé")}
                          className="btn btn-success"
                        >
                          Valider
                        </button>
                        <button
                          onClick={() => mettreAJourStatut(demande.id, "Refusé")}
                          className="btn btn-danger ms-2"
                        >
                          Refuser
                        </button>
                      </>
                    ) : (
                      <span className="text-muted">effectuée</span>
                    )}
                  </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DemandesCongesEmployes;
