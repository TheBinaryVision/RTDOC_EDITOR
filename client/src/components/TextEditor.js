// TextEditor.jsx (Updated to remove Tailwind and use clean CSS)

import React, { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import QuillCursors from "quill-cursors";

Quill.register("modules/cursors", QuillCursors);

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ color: [] }, { background: [] }],
  ["code-block"],
  ["clean"],
];

const getColorForUsername = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 70%, 50%)`;
};

const SAVE_INTERVAL_MS = 2000;

const TextEditor = () => {
  const wrapperRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [activeUsers, setActiveUsers] = useState(1);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [documentTitle, setDocumentTitle] = useState("Untitled Document");
  const [username, setUsername] = useState("");
  const [saveStatus, setSaveStatus] = useState("All changes saved");

  const docId = window.location.pathname.split("/docs/")[1];

  useEffect(() => {
    const name = prompt("Enter your name:");
    setUsername(name || "Anonymous");
  }, []);

  useEffect(() => {
    const s = io("http://localhost:5000");
    setSocket(s);
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (socket && username) {
      socket.emit("join-room", { docId, username });
    }
  }, [socket, username, docId]);

  useEffect(() => {
    if (socket == null || quill == null) return;
    socket.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
    });
    socket.emit("get-document", docId);
  }, [socket, quill, docId]);

  useEffect(() => {
    if (!socket || !quill) return;
    const handler = (delta) => quill.updateContents(delta);
    socket.on("receive-changes", handler);
    return () => socket.off("receive-changes", handler);
  }, [socket, quill]);

  useEffect(() => {
    if (!socket || !quill) return;
    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };
    quill.on("text-change", handler);
    return () => quill.off("text-change", handler);
  }, [socket, quill]);

  useEffect(() => {
    if (!socket || !quill) return;
    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
      setSaveStatus("Saving...");
      setTimeout(() => setSaveStatus("All changes saved"), 800);
      toast.success("Document saved", { duration: 1000 });
    }, SAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [socket, quill]);

  useEffect(() => {
    if (!socket) return;
    socket.on("active-users", (count) => setActiveUsers(count));
    socket.on("user-list", (users) => setOnlineUsers(users));
    return () => {
      socket.off("active-users");
      socket.off("user-list");
    };
  }, [socket]);

  useEffect(() => {
    const editorDiv = document.createElement("div");
    wrapperRef.current.innerHTML = "";
    wrapperRef.current.append(editorDiv);

    const q = new Quill(editorDiv, {
      theme: "snow",
      modules: {
        toolbar: TOOLBAR_OPTIONS,
        cursors: true,
        history: { userOnly: true },
      },
    });
    q.disable();
    q.setText("Loading document...");
    setQuill(q);
  }, []);

  useEffect(() => {
    if (!socket || !quill || !username) return;
    const cursors = quill.getModule("cursors");
    socket.on("receive-cursor", ({ socketId, range, username, color }) => {
      if (socket.id === socketId) return;
      cursors.createCursor(socketId, username, color);
      cursors.moveCursor(socketId, range);
    });
    quill.on("selection-change", (range, oldRange, source) => {
      if (range && source === "user") {
        socket.emit("send-cursor", {
          range,
          username,
          color: getColorForUsername(username),
          docId,
        });
      }
    });
    return () => {
      socket.off("receive-cursor");
      cursors.clearCursors();
    };
  }, [socket, quill, username, docId]);

  return (
    <div style={{ padding: "1rem", backgroundColor: darkMode ? "#111" : "#f9f9f9", color: darkMode ? "#fff" : "#000" }}>
      <div style={{ fontStyle: "italic", marginBottom: "0.5rem" }}>{saveStatus}</div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        {onlineUsers.map((user, i) => (
          <div key={i} style={{ padding: "0.25rem 0.5rem", backgroundColor: "#4f46e5", color: "#fff", borderRadius: "9999px" }}>
            🧑 {user}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1rem" }}>
        <input
          type="text"
          value={documentTitle}
          onChange={(e) => setDocumentTitle(e.target.value)}
          placeholder="Enter Document Title"
          style={{ fontSize: "1.25rem", fontWeight: "bold", borderBottom: "2px solid #ccc", background: "transparent" }}
        />
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ backgroundColor: "#10b981", color: "#fff", padding: "0.25rem 0.75rem", borderRadius: "9999px" }}>🟢 {activeUsers} online</span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{ padding: "0.5rem 1rem", backgroundColor: darkMode ? "#ccc" : "#333", color: darkMode ? "#000" : "#fff", borderRadius: "0.5rem" }}
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "1rem", backgroundColor: "#2563eb", color: "#fff", padding: "0.5rem 1rem", borderRadius: "9999px", display: "inline-block" }}>
        👤 {username}
      </div>

      <div ref={wrapperRef} style={{ backgroundColor: darkMode ? "#1f2937" : "#fff", borderRadius: "0.5rem", padding: "1rem", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}></div>
    </div>
  );
};

export default TextEditor;
