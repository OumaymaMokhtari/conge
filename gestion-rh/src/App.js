import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faComment, faCalendar, faListUl, faListCheck, faUserCheck,faUserMinus ,faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import LeaveRequestForm from "./components/LeaveRequestForm";
import LeaveList from "./components/LeaveList";
import ChatPage from "./pages/ChatPage";
import Absence from "./pages/Absence";
import LoginForm from "./components/LoginForm";
import DemandesCongesEmployes from "./pages/DemandesCongesEmployes";
import AbsencesChef from "./pages/AbsencesChef";
import "./styles/global.css";
import axios from "axios";

const AppLayout = ({ currentUser, onLogout }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("employeId");
    localStorage.removeItem("role");
    onLogout();
    navigate("/login");
  };

  return (
    <div className="app-layout">
      <div className={`sidebar ${isChatOpen ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <span className="brand-work">Work</span><span className="brand-wise">Wise</span>
        </div>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link className="nav-link" to="/" onClick={() => setIsChatOpen(false)}>
              <FontAwesomeIcon icon={faHouse} />Tableau de bord
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/chat" onClick={() => setIsChatOpen(true)}>
              <FontAwesomeIcon icon={faComment} /> Chat
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/demande" onClick={() => setIsChatOpen(false)}>
              <FontAwesomeIcon icon={faCalendar} /> Congé
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/liste" onClick={() => setIsChatOpen(false)}>
              <FontAwesomeIcon icon={faListUl} /> Liste Congé
            </Link>
          </li>

          {currentUser?.role?.toLowerCase() === "chef" && (
            <li className="nav-item">
              <Link className="nav-link" to="/conges-employes" onClick={() => setIsChatOpen(false)}>
                <FontAwesomeIcon icon={faListCheck} /> Congés Employés
              </Link>
            </li>
          )}
          {currentUser?.role?.toLowerCase() === "chef" && (
            <li className="nav-item">
              <Link className="nav-link" to="/absences-chef" onClick={() => setIsChatOpen(false)}>
                <FontAwesomeIcon icon={faUserMinus} /> Absences Employés
              </Link>
            </li>
          )}
          <li className="nav-item">
          <Link className="nav-link" to="/absences" onClick={() => setIsChatOpen(false)}>
            <FontAwesomeIcon icon={faUserCheck} /> Absences
          </Link>
        </li>

            <li className="nav-item">
              <button onClick={handleLogout} className="logout-button">
                <FontAwesomeIcon icon={faRightFromBracket} /> 
              </button>
            </li>
        </ul>
      </div>

      <div className="main-content">
        <Routes>
          <Route path="/" element={<h1>Bienvenue sur Gestion RH</h1>} />
          <Route path="/chat" element={<ChatPage currentUser={currentUser} />} />
          <Route path="/demande" element={<LeaveRequestForm />} />
          <Route path="/liste" element={<LeaveList />} />
          <Route path="/absences" element={<Absence />} />
          <Route path="/absences-chef" element={<AbsencesChef />} />
          {currentUser?.role?.toLowerCase() === "chef" && (
            <Route path="/conges-employes" element={<DemandesCongesEmployes />} />
          )}
        </Routes>
        

      </div>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:5287/api/auth/currentUser", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          console.log("Utilisateur connecté :", res.data);
          setCurrentUser(res.data);
        })
        .catch(() => setCurrentUser(null));
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  return (
    <Router>
      <Routes>
        {isAuthenticated ? (
          <Route path="*" element={<AppLayout currentUser={currentUser} onLogout={handleLogout} />} />
        ) : (
          <>
            <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
            <Route path="*" element={<LoginForm onLogin={handleLogin} />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;
