import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatWindow from "../components/ChatWindow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import "../styles/global.css";

const ChatPage = ({ currentUser }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const token = localStorage.getItem("token");

  // Charger les employés
  useEffect(() => {
    if (!token) return;

    axios
      .get("http://localhost:5287/api/employee", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setEmployees(res.data))
      .catch(console.error);
  }, [token]);

  // Messages non lus
  useEffect(() => {
    if (!currentUser || !token) return;

    axios
      .get("http://localhost:5287/api/message/unreadByUser", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUnreadCounts(res.data))
      .catch((err) => console.error("Erreur récupération messages non lus", err));
  }, [currentUser, token]);

  // Marquer comme lu
  useEffect(() => {
    if (!selectedEmployee || !currentUser || !token) return;

    axios
      .post(
        "http://localhost:5287/api/message/markAsRead",
        {
          senderId: selectedEmployee.id,
          receiverId: currentUser.userId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        setUnreadCounts((prev) => ({
          ...prev,
          [selectedEmployee.id]: 0,
        }));
      });
  }, [selectedEmployee]);

  return currentUser ? (
    <div className="chat-container">
      <div className="sidebar">
        <h2 className="chat-title">Cantact</h2>
        <input
          type="text"
          placeholder="Rechercher un contact..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar"
        />

        <ul className="user-list">
          {employees
            .filter(
              (e) =>
                e.id !== currentUser?.userId &&
                e.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((employee) => (
              <li
                key={employee.id}
                onClick={() => setSelectedEmployee(employee)}
                className="user-item"
              >
                {employee.name}
                {unreadCounts[employee.id] > 0 && (
                  <span className="badge">{unreadCounts[employee.id]}</span>
                )}
              </li>
            ))}
        </ul>
      </div>

      <div className="chat-window">
        {selectedEmployee ? (
          <ChatWindow selectedEmployee={selectedEmployee} />
        ) : (
          <p>Sélectionnez un employé pour discuter.</p>
        )}
      </div>
    </div>
  ) : (
    <p>Chargement en cours...</p>
  );
};

export default ChatPage;
