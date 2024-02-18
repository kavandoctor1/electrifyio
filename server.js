const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Readable } = require('stream');

// Function to convert a base64 string to a stream
function base64ToStream(base64String) {
  // Convert base64 string to a buffer
  const buffer = Buffer.from(base64String, 'base64');
  
  // Create a readable stream from the buffer
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null); // Signifies the end of the stream (EOF)
  
  return stream;
}


const aws=require('aws-sdk')
const config = {
    aws_local_config: {
        //Provide details for local configuration
    },
    aws_remote_config: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
    }
}
aws.config.update(config.aws_remote_config);
const docClient = new aws.DynamoDB.DocumentClient()
const apiGateway = new aws.APIGateway();
const s3 = new aws.S3(config.aws_remote_config)


function sendNFT(url){
  const options1 = {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.NFT,
      'Content-Type': 'application/json'
    },
    body: `{"metadata":{"description":"test","image":"${url}","name":"rajashekar"},"recipient":"email:vrajashekar2022mscs@gmail.com:polygon","reuploadLinkedFiles":false}`
  };
  
  fetch('https://staging.crossmint.com/api/2022-06-09/collections/default-polygon/nfts', options1)
    .then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));


}


async function uploadS3(name,stream){
  const uploadParams = {
    ACL: 'public-read',
    Bucket: 'nftjapan',
    Key: name,
    Body: stream,
    ContentType: 'image/png'
  };
  var result = -1;
  // console.log('uploading', uploadParams);
  await s3.upload(uploadParams, (error, data) => {
    if (error) {
        console.error('Error uploading to S3:', error);
    } else {
        console.log('Upload Success for file:', data.Location);
        sendNFT(data.Location);
    }
  });

  return result;
}


const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Set static folder
app.use(express.static("public"));

// Socket setup
const io = socket(server);

const makeNFT = async function(base64Data){
  await uploadS3(Math.floor(Math.random()*100000000)+'.png',base64ToStream(base64Data));
}
// Players array
let balls = [];
let lowerwall = 100;
let resetting = false;

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
      if (! resetting){
      balls[data.index] = data;
      io.sockets.emit("update", data);
      }
  });


  socket.on("restart", () => {
    console.log('restart');
    lowerwall = 100;
    balls = [];
    io.sockets.emit("restart");
  });

  socket.on("bottom", (data) => {
    if(! resetting){
      console.log('bottom');
      lowerwall = data;
      io.sockets.emit("bottom",lowerwall);
    }
  });

  socket.on("reset", async function(data) {
    resetting = true;
    console.log('reset');
    for(var i = 0; i < balls.length; i ++){
      balls[i] = new Ball(100+100*i,250,0,0,0,0,0,0,3,i,balls[i].color);
    }
    
    await io.sockets.emit("reset", [balls,data]);
    resetting = false;
  })



  socket.on("makeNFT", async (base64Data) => {
    // Assuming makeNFT is async and handles the NFT creation
    await makeNFT(base64Data);
});
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
