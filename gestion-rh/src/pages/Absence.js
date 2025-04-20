import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const Absence = () => {
  const [absences, setAbsences] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [fichiers, setFichiers] = useState({});
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const employeId = localStorage.getItem("employeId");
  const token = localStorage.getItem("token");

  const chargerAbsences = () => {
    axios
      .get(`http://localhost:5148/api/absences/employe/${employeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setAbsences(res.data);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des absences", err);
      });
  };

  useEffect(() => {
    chargerAbsences();
  }, []);

  const lancerCamera = () => {
    setShowCamera(true);
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Erreur d'accès à la caméra :", err);
      });
  };

  const handleCapture = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg");

    try {
      const res = await axios.post("http://localhost:5148/api/scanner", {
        imageBase64: imageData,
      });

      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      setShowCamera(false);

      const { statut } = res.data;

      // Message basé sur le statut
      if (statut.includes("present")) {
        alert("Vous êtes présent. Bonne journée !");
      } else if (statut.includes("retard")) {
        alert("Vous êtes en retard, veuillez voir l'administration.");
      } else if (statut.includes("absent")) {
        alert("Vous êtes absent !");
      } else {
        alert("Horaire hors période de pointage.");
      }

      setTimeout(() => {
        chargerAbsences();
      }, 3000);
    } catch (err) {
      alert("Erreur lors de l'envoi de l'image");
      console.error(err);
    }
  };

  const isAbsenceRecente = (dateStr) => {
    const dateAbs = new Date(dateStr);
    const now = new Date();
    const diff = (now - dateAbs) / (1000 * 60 * 60); // en heures
    return diff <= 24;
  };

  const handleFileChange = (id, e) => {
    setFichiers({ ...fichiers, [id]: e.target.files[0] });
  };

  const envoyerJustificatif = async (id) => {
    const fichier = fichiers[id];
    if (!fichier) return alert("Veuillez choisir un fichier");

    const formData = new FormData();
    formData.append("fichier", fichier);

    try {
      await axios.post(`http://localhost:5148/api/absences/${id}/justificatif`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Justificatif envoyé !");
      chargerAbsences();
    } catch (err) {
      alert("Erreur lors de l’envoi");
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h2>Mes absences</h2>

      {!showCamera && (
        <button className="btn btn-primary mb-3" onClick={lancerCamera}>
          Scanner présence
        </button>
      )}

      {showCamera && (
        <div className="text-center mb-3">
          <video
            ref={videoRef}
            autoPlay
            style={{
              width: "70%",
              maxWidth: "600px",
              borderRadius: "10px",
            }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <br />
          <button className="btn btn-success mt-2" onClick={handleCapture}>
            Capturer et Envoyer
          </button>
        </div>
      )}

      {absences.length === 0 ? (
        <p>Aucune absence enregistrée.</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Date</th>
              <th>Raison</th>
              <th>Justificatif</th>
            </tr>
          </thead>
          <tbody>
            {absences.map((absence) => (
              <tr key={absence.id}>
                <td>{absence.dateAbsence?.split("T")[0]}</td>
                <td>{absence.raison}</td>
                <td>
                  {absence.justificatifPath ? (
                    <a
                      href={`http://localhost:5148/${absence.justificatifPath}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Voir
                    </a>
                  ) : isAbsenceRecente(absence.dateAbsence) ? (
                    <>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(absence.id, e)}
                      />
                      <button
                        className="btn btn-sm btn-primary mt-1"
                        onClick={() => envoyerJustificatif(absence.id)}
                      >
                        Envoyer
                      </button>
                    </>
                  ) : (
                    "Aucun"
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

export default Absence;
