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
let lowerwall = 100;
class Ball{

  constructor(x,y,vx,vy,deltaVx,deltaVy,Fx,Fy,mass, index,color){
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.deltaVx = deltaVx;
    this.deltaVy = deltaVy;
    this.Fx = Fx;
    this.Fy = Fy;
    this.mass = mass;
    this.index = index;
    this.color = color
  }
}


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
    io.sockets.emit("update", balls);
  });


  socket.on("restart", () => {
    console.log('restart');
    lowerwall = 100;
    balls = [];
    io.sockets.emit("restart");
  });

  socket.on("bottom", (data) => {
    console.log('bottom');
    lowerwall = data;
    io.sockets.emit("bottom",lowerwall);
  });

  socket.on("reset", (data) =>{
    console.log('reset');
    for(var i = 0; i < balls.length; i ++){
      balls[i] = new Ball(100+100*i,250,0,0,0,0,0,0,3,i,balls[i].color);
    }
    io.sockets.emit("update", balls);
    io.sockets.emit("bottom",data);
  })
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
