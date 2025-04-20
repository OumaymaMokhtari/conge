import React, { useState, useEffect } from "react";
import axios from "axios";

const ModifierCongeModal = ({ show, onClose, conge, onSave }) => {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [typeConge, setTypeConge] = useState("");
  const [commentaire, setCommentaire] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (conge) {
      setDateDebut(conge.dateDebut?.split("T")[0] || "");
      setDateFin(conge.dateFin?.split("T")[0] || "");
      setTypeConge(conge.typeConge || "");
      setCommentaire(conge.commentaire || "");
    }
  }, [conge]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    console.log("ID du congé à modifier :", conge?.id);
      await axios.put(
        `http://localhost:5148/api/conges/modifier/${conge.id}`,
        
        {
          dateDebut,
          dateFin,
          typeConge,
          commentaire,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        } 
      );
      onSave();
    } catch (err) {
      console.error("Erreur modification :", err);
      alert("Échec de la modification");
    }
  };

  if (!show || !conge) return null;

  return (
    <>
      {/* ✅ Un seul overlay */}
      <div className="modal-custom-overlay" onClick={onClose}></div>

      <div
        className="modal d-block modal-custom"
        tabIndex="-1"
        onClick={(e) => e.stopPropagation()} // empêche fermeture si on clique dans la modale
      >
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Modifier la demande</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label>Date de début</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label>Date de fin</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label>Type de congé</label>
                <select
                  className="form-control"
                  value={typeConge}
                  onChange={(e) => setTypeConge(e.target.value)}
                >
                  <option>Sans solde</option>
                  <option>Payé</option>
                  <option>Maladie</option>
                </select>
              </div>
              <div className="mb-3">
                <label>Commentaire</label>
                <textarea
                  className="form-control"
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary">
                Enregistrer
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ModifierCongeModal;
