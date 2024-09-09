const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const { spawn } = require("node-pty");

const app = express();
app.use(cors({ origin: "*" }));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  const ptyProcess = spawn("bash", [], {
    name: "xterm-color",
    env: process.env,
  });

  // Send a connected message to the client
  ws.send(
    JSON.stringify({
      event: "connected",
      message: "Socket connected successfully",
    })
  );

  ws.on("message", (message) => {
    console.log("Received:", message);

    const data = JSON.parse(message.toString());

    if (data.type === "command") {
      ptyProcess.write(data.data);
    }
  });

  ptyProcess.onData((data) => {
    const message = JSON.stringify({
      type: "data",
      data,
    });
    ws.send(message);
  });

  // Handle disconnection
  ws.on("close", () => {
    console.log("Client disconnected");
    ptyProcess.kill();
  });
});

server.listen(3000, () => {
  console.log("Server running at port 3000");
});
