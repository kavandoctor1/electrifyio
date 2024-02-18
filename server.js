const express = require("express");
const socket = require("socket.io");
const http = require("http");

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Set static folder
app.use(express.static("public"));

// Socket setup
const io = socket(server);

// Players array
let balls = [];

io.on("connection", (socket) => {
  console.log("Made socket connection", socket.id);

  socket.on("join", (data) => {
    balls.push(data);
    console.log('join');
    console.log(balls);
    io.sockets.emit("join", data);
  });

  socket.on("joined", () => {
    console.log('joined');
    console.log(balls);
    
    socket.emit("joined", balls);
  });

    socket.on("update", (data) => {
      // console.log('update',balls);
    balls[data.index] = data;
    io.sockets.emit("update", data);
  });


  socket.on("restart", () => {
    console.log('restart');

    balls = [];
    io.sockets.emit("restart");
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
