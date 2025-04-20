import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/global.css";

const LeaveRequestForm = () => {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [duree, setDuree] = useState("");
  const [typeConge, setTypeConge] = useState("Sans solde");
  const [commentaire, setCommentaire] = useState("");
  const [justificatif, setJustificatif] = useState(null);
  const [solde, setSolde] = useState(null);

  const token = localStorage.getItem("token");
  const employeId = parseInt(localStorage.getItem("employeId"));
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (employeId) {
      axios
        .get(`http://localhost:5148/api/conges/solde/${employeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setSolde(res.data))
        .catch((err) => console.error("Erreur solde :", err));
    }
  }, [employeId]);

  useEffect(() => {
    const calculerDuree = async () => {
      if (dateDebut && dateFin) {
        try {
          const response = await axios.post(
            "http://localhost:5148/api/conges/calculer-duree",
            {
              dateDebut,
              dateFin,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setDuree(response.data);
        } catch (error) {
          console.error("Erreur calcul durée :", error);
          setDuree("");
        }
      } else {
        setDuree("");
      }
    };

    calculerDuree();
  }, [dateDebut, dateFin]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("employeId", employeId);
    formData.append("dateDebut", dateDebut);
    formData.append("dateFin", dateFin);
    formData.append("duree", parseInt(duree));
    formData.append("typeConge", typeConge);
    formData.append("commentaire", commentaire);
    if (typeConge === "Maladie" && justificatif) {
      formData.append("justificatif", justificatif);
    }

    try {
      await axios.post("http://localhost:5148/api/conges/avec-fichier", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Demande envoyée !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l’envoi.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Demander un congé</h2>

      {solde !== null && (
        <div className="alert alert-info" style={{textAlign: "center",maxWidth: "250px",margin: "0 auto"}}>
          <strong>Solde disponible : {solde} jours</strong>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-sections">
          <div className="form-left">
            <div className="form-group">
              <label>Type de congé :</label>
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

            {typeConge === "Maladie" && (
              <div className="form-group">
                <label>Justificatif médical :</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => setJustificatif(e.target.files[0])}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Commentaire :</label>
              <textarea
                className="form-control"
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
              />
            </div>
          </div>

          <div className="form-right">
            <div className="form-group">
              <label>Date de début :</label>
              <input
                type="date"
                className="form-control"
                value={dateDebut}
                min={today}
                onChange={(e) => setDateDebut(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Date de fin :</label>
              <input
                type="date"
                className="form-control"
                value={dateFin}
                min={today}
                onChange={(e) => setDateFin(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Durée :</label>
              <input
                type="number"
                className="form-control"
                value={duree}
                readOnly
              />
            </div>
          </div>
        </div>
        <div className="submit-container">
          <button type="submit" className="btn btn-primary" disabled={!duree || duree <= 0}>
            Soumettre
          </button>
        </div>

      </form>
    </div>
  );
};

export default LeaveRequestForm;