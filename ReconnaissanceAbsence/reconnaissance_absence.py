import cv2
import face_recognition
import os
import pyodbc
from datetime import date

# Dossiers
DOSSIER_EMPLOYES = "employes_faces"
DOSSIER_CAPTURE = "captures"
FICHIER_CAPTURE = os.path.join(DOSSIER_CAPTURE, "aujourdhui.jpg")

# Créer le dossier 'captures' s'il n'existe pas
os.makedirs(DOSSIER_CAPTURE, exist_ok=True)

# Étape 1 : Capture depuis webcam
def capturer_image():
    camera = cv2.VideoCapture(0)

    if not camera.isOpened():
        print("Impossible d'ouvrir la webcam.")
        return False

    print("Appuie sur la touche 'c' pour capturer une image.")
    print("Appuie sur la touche 'q' pour quitter sans capturer.")

    while True:
        ret, frame = camera.read()
        if not ret:
            print("Erreur de lecture webcam.")
            break

        cv2.imshow("Caméra - Reconnaissance Absence", frame)
        key = cv2.waitKey(1) & 0xFF

        if key == ord("c"):
            cv2.imwrite(FICHIER_CAPTURE, frame)
            print(f"Image enregistrée dans {FICHIER_CAPTURE}")
            break
        elif key == ord("q"):
            print("Capture annulée.")
            break

    camera.release()
    cv2.destroyAllWindows()
    return os.path.exists(FICHIER_CAPTURE)

# Étape 2 : Reconnaissance faciale
def charger_visages():
    encodings = []
    ids = []

    for fichier in os.listdir(DOSSIER_EMPLOYES):
        if fichier.endswith(".jpg"):
            employe_id = int(fichier.split(".")[0])
            chemin = os.path.join(DOSSIER_EMPLOYES, fichier)
            image = face_recognition.load_image_file(chemin)
            enc = face_recognition.face_encodings(image)
            if enc:
                encodings.append(enc[0])
                ids.append(employe_id)
    return encodings, ids

def reconnaitre(enc_connus, ids_connus):
    image = face_recognition.load_image_file(FICHIER_CAPTURE)
    encs = face_recognition.face_encodings(image)
    if not encs:
        print("Aucun visage détecté.")
        return None
    match = face_recognition.compare_faces(enc_connus, encs[0])
    if True in match:
        return ids_connus[match.index(True)]
    return None

# Étape 3 : Enregistrement dans SQL Server
def enregistrer_absents(id_reconnu):
    try:
        conn = pyodbc.connect(
            "DRIVER={ODBC Driver 17 for SQL Server};"
            "SERVER=DESKTOP-1BFFPN3\\MSSQLSERVER2;"
            "DATABASE=GestionCongesDB;"
            "Trusted_Connection=yes;"
        )
        cursor = conn.cursor()

        cursor.execute("SELECT Id FROM Employes")
        all_ids = [row.Id for row in cursor.fetchall()]

        for emp_id in all_ids:
            if emp_id != id_reconnu:
                cursor.execute("""
                    INSERT INTO Absences (EmployeId, DateAbsence, Raison)
                    VALUES (?, ?, ?)
                """, emp_id, date.today(), "Retard")
                print(f"Absence enregistrée pour employé {emp_id}")
            else:
                print(f"Employé {emp_id} reconnu — pas d'absence.")

        conn.commit()
        conn.close()
    except Exception as e:
        print("Erreur de connexion à la base :", e)

# Lancer tout
if __name__ == "__main__":
    if capturer_image():
        enc_connus, ids_connus = charger_visages()
        id_reconnu = reconnaitre(enc_connus, ids_connus)
        enregistrer_absents(id_reconnu)
