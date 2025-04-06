import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/global.css";

const AbsencesChef = () => {
  const [absences, setAbsences] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:5148/api/absences", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("✅ Absences récupérées :", res.data);
        setAbsences(res.data);
      })
      .catch((err) => {
        console.error("❌ Erreur lors du chargement des absences", err);
      });
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">📋 Absences des employés</h2>
      {absences.length === 0 ? (
        <p>Aucune absence enregistrée.</p>
      ) : (
        <table className="table table-striped">
          <thead className="table-dark">
            <tr>
              <th>Nom Employé</th>
              <th>Date</th>
              <th>Raison</th>
              <th>Justificatif</th>
            </tr>
          </thead>
          <tbody>
            {absences.map((absence) => (
              <tr key={absence.id}>
                <td>{absence.nomEmploye}</td>
                <td>{absence.dateAbsence?.split("T")[0]}</td>
                <td>{absence.raison}</td>
                <td>
                  {absence.justificatifPath ? (
                    <a
                      href={`http://localhost:5148/${absence.justificatifPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-secondary"
                    >
                      Voir
                    </a>
                  ) : (
                    "Non fourni"
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

export default AbsencesChef;
