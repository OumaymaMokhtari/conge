import React, { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import ObjectId from "bson-objectid";
import axios from "axios";
import "../styles/global.css";

const ChatWindow = ({ selectedEmployee }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connection, setConnection] = useState(null);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  // Charger les messages
  useEffect(() => {
    if (!selectedEmployee || !token) return;

    axios
      .get(`http://localhost:5287/api/message/messages/${selectedEmployee.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setMessages(res.data))
      .catch((err) =>
        console.error("Erreur lors de la récupération des messages :", err)
      );
  }, [selectedEmployee]);

  // SignalR connection
  useEffect(() => {
    if (!selectedEmployee || !token) return;

    const connect = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5287/chatHub", {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    setConnection(connect);

    connect
      .start()
      .then(() => console.log("SignalR connecté"))
      .catch((err) => console.error(" Erreur de connexion SignalR :", err));

    const handleMessageReceived = (senderId, receiverId, content, timestamp) => {
      setMessages((prev) => {
        if (
          !prev.some(
            (msg) =>
              msg.content === content &&
              msg.senderId === senderId &&
              msg.timestamp === timestamp
          )
        ) {
          return [...prev, { senderId, receiverId, content, timestamp }];
        }
        return prev;
      });
    };

    connect.on("ReceiveMessage", handleMessageReceived);

    return () => {
      connect.off("ReceiveMessage", handleMessageReceived);
      if (connect.state === "Connected") {
        connect
          .stop()
          .then(() => console.log("🔌 SignalR déconnecté"))
          .catch((err) => console.error("Erreur de déconnexion SignalR :", err));
      }
    };
  }, [selectedEmployee]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!selectedEmployee || newMessage.trim() === "") return;

    const receiverId = selectedEmployee.id;
    const content = newMessage.trim();

    setNewMessage("");

    if (connection && connection.state === "Connected") {
      await connection
        .invoke("SendMessage", receiverId, content)
        .catch((err) => console.error("Erreur d'envoi SignalR :", err));
    } else {
      console.error("SignalR non connecté !");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !token) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:5287/api/File/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const fileUrl = response.data.fileUrl;

      if (connection && connection.state === "Connected") {
        await connection
          .invoke("SendMessage", selectedEmployee.id, fileUrl)
          .catch((err) =>
            console.error("Erreur d'envoi du fichier via SignalR :", err)
          );
      }
    } catch (error) {
      console.error("Erreur upload fichier :", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>
          {selectedEmployee ? selectedEmployee.name : "Aucun utilisateur sélectionné"}
        </h2>
      </div>

      <div className="message-container">
        {messages.map((msg, index) => (
          <React.Fragment key={msg.id || index}>
            {index === 0 ||
            new Date(messages[index - 1].timestamp).toLocaleDateString() !==
              new Date(msg.timestamp).toLocaleDateString() ? (
              <div className="date-separator">
                {new Date(msg.timestamp).toLocaleDateString()}
              </div>
            ) : null}

            <div
              className={`message ${
                msg.senderId === currentUserId ? "sent" : "received"
              }`}
            >
              {msg.content.includes("http") ? (
                <a href={msg.content} target="_blank" rel="noopener noreferrer">
                  Télécharger le fichier
                </a>
              ) : (
                <p>{msg.content}</p>
              )}
              <span className="timestamp">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </React.Fragment>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      <div className="input-container">
        <input type="file" onChange={handleFileChange} className="file-input" />
        <input
          className="input-message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Taper votre message..."
        />
        <button className="send-button" onClick={sendMessage}>
          Envoyer
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
