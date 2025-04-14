// server.js

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const Document = require("./Document");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins during development
    methods: ["GET", "POST"],
  },
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("✅ MongoDB connected"));

const DEFAULT_VALUE = "";

const userMap = {}; // store connected users by docId

io.on("connection", socket => {
  console.log("🔌 New connection:", socket.id);

  socket.on("join-room", async ({ docId, username }) => {
    socket.join(docId);
    socket.docId = docId;
    socket.username = username;

    // track users
    if (!userMap[docId]) userMap[docId] = [];
    userMap[docId].push(username);

    io.to(docId).emit("user-list", userMap[docId]);
    io.to(docId).emit("active-users", userMap[docId].length);

    console.log(`🧑 ${username} joined room: ${docId}`);
  });

  socket.on("get-document", async docId => {
    const document = await findOrCreateDocument(docId);
    socket.join(docId);
    socket.emit("load-document", document.data);

    socket.on("send-changes", delta => {
      socket.broadcast.to(docId).emit("receive-changes", delta);
    });

    socket.on("save-document", async data => {
      await Document.findByIdAndUpdate(docId, { data });
    });

    // Collaborative cursor position
    socket.on("send-cursor", ({ range, username, color }) => {
      socket.broadcast.to(docId).emit("receive-cursor", {
        socketId: socket.id,
        range,
        username,
        color,
      });
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.id);
      if (userMap[docId]) {
        userMap[docId] = userMap[docId].filter(u => u !== socket.username);
        io.to(docId).emit("user-list", userMap[docId]);
        io.to(docId).emit("active-users", userMap[docId].length);
      }
    });
  });
});

const findOrCreateDocument = async id => {
  if (!id) return;
  const doc = await Document.findById(id);
  if (doc) return doc;
  return await Document.create({ _id: id, data: DEFAULT_VALUE });
};

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
