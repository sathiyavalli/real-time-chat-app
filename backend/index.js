// backend/index.js
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
      origin: "*", // allow all origins for now
      methods: ["GET", "POST"],
      credentials: true,
    },
  });  

app.use(cors());
app.use(express.json());

// Simple JSON-RPC handler
app.post("/rpc", (req, res) => {
  const { method, params, id } = req.body;
  if (method === "ping") {
    return res.json({ jsonrpc: "2.0", result: "pong", id });
  }
  res.status(404).json({ jsonrpc: "2.0", error: "Method not found", id });
});

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(3001, () => {
  console.log("Server listening on http://localhost:3001");
});
