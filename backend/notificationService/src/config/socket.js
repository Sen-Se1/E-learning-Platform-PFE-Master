let io;

function initSocket(server) {
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", socket => {
    console.log("✅ Client connected:", socket.id);

    socket.on("join", data => {
      if (data.userId) {
        socket.join(`user:${data.userId}`);
      }

      if (data.role) {
        socket.join(`role:${data.role}`);
      }

      console.log("📌 Joined rooms:", data);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
}

module.exports = {
  initSocket,
  getIO
};