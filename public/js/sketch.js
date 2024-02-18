const socket = io('https://web-production-3d76c.up.railway.app');
// const socket = io('localhost:3000')
socket.emit("joined");



var balls = [];
var currentball = -1;
var ballindex = -1;

var resetting = false;


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


// balls.push(new Ball(300,250,0,0,0,0,0,0,3))
// balls.push(new Ball(400,250,0,0,0,0,0,0,3))
document.getElementById("candy_button").addEventListener("click", () => {
    if(ballindex != -1){
        return;
    }
    let color = [Math.floor(Math.random() * 256),Math.floor(Math.random() * 256),Math.floor(Math.random() * 256)];
    currentball = new Ball(100+100*balls.length,250,0,0,0,0,0,0,3,balls.length,color);
    ballindex = balls.length;
    // document.getElementById(
    //   "current-player"
    // ).innerHTML = `<p>Anyone can roll</p>`;
    // balls.push(currentball);
    socket.emit("join", currentball);

});


document.getElementById("restart_button").addEventListener("click", () => {
  socket.emit("restart");
  console.log('RESTART')
});



socket.on("join", (ball) => {
    console.log('join', ball);
    balls.push(new Ball(ball.x,250,0,0,0,0,0,0,3,ball.index,ball.color));
  });

socket.on("update", (data) => {
    // console.log('update',data,balls);
    if(data.index != ballindex) balls[data.index] = data;
});

socket.on("reset", (data) => {
  // console.log('update',data,balls);
  balls = data[0];
  LOWERWALL = data[1];
  resetting = false;
});


socket.on("joined", (data) => {
    console.log('joined', data,balls);
    balls = [];
  // data.forEach((ball, index) => {
  //   balls.push(ball);
  // });
  for(var i = 0; i < data.length; i ++){
    balls.push(data[i]);
  }
  console.log(balls);
});



socket.on("restart", () => {
  balls = [];
  currentball = -1;
  ballindex = -1;
  console.log('restart');
  window.location.reload();
});


socket.on("bottom", (data) => {
  LOWERWALL = data;
});



const dt = 0.1;
const g = 9.8;
const blob_radius = 25;



const LEFTWALL = -300;
const UPPERWALL = 1000;
const RIGHTWALL = 1000;
var LOWERWALL = 100;

const dLOWER = 0.15;


var cnv;


function centerCanvas() {
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height)*.9;
  cnv.position(x, y);
}
function windowResized() {
  centerCanvas();
}
function setup(){
    // createCanvas(750, 500);
cnv = createCanvas(750, 500);
  cnv.style('display', 'block');
  cnv.parent('app');
  centerCanvas();

  
  background(44, 62, 80);

}

// Size of the ship
var r = 12;



// Draw the ship and other stuff
function display() {
  background(44, 62, 80);
    textSize(12);
    textStyle(NORMAL);

    strokeWeight(0);
    fill(61, 235, 52);
    rect(blob_radius,height-LOWERWALL, width-2*blob_radius, LOWERWALL);

    fill(0,0,0); //If more text is written elsewhere make sure the default is black
    stroke(0,0,0); // If more lines are drawn elsewhere make sure the default is black
    strokeWeight(0);
  
    // drawText("Click this screen first!",0.35*width,0.8*height);
    // drawText("then move the arrow keys!",0.32*width,0.75*height);
}

function collide(ball1,ball2, blob_radius){
  return (ball1.x-ball2.x)**2 + (ball1.y-ball2.y)**2 < (2*blob_radius+5)**2

}

function handleCollision(b1, b2) {
  let normalX = b2.x - b1.x;
  let normalY = b2.y - b1.y;
  let normalLength = sqrt(normalX*normalX + normalY*normalY);
  
  // Normalize the normal vector
  normalX /= normalLength;
  normalY /= normalLength;
  
  // Find the overlap
  let overlap = 52 - normalLength;

  // Move balls to remove overlap
  let correctionX = normalX * overlap / 2.0;
  let correctionY = normalY * overlap / 2.0;
  b1.x -= correctionX;
  b1.y -= correctionY;
  b2.x += correctionX;
  b2.y += correctionY;
  
  // Relative velocity
  let rvX = b2.vx - b1.vx;
  let rvY = b2.vy - b1.vy;
  
  // Velocity along the normal direction
  let velAlongNormal = rvX * normalX + rvY * normalY;
  
  // Do not resolve if velocities are separating
  if (velAlongNormal > 0) return;
  
  // Calculate restitution (elastic collision)
  let restitution = 1; // perfectly elastic
  
  // Calculate impulse scalar
  let impulse = -(1 + restitution) * velAlongNormal;
  impulse /= 1 / b1.mass + 1 / b2.mass;
  
  // Apply impulse to the balls' velocities
  let impulseX = impulse * normalX;
  let impulseY = impulse * normalY;
  
  b1.vx -= impulseX / b1.mass;
  b1.vy -= impulseY / b1.mass;
  b2.vx += impulseX / b2.mass;
  b2.vy += impulseY / b2.mass;
  return b1,b2;
}


function collisions(balls, blob_radius){
  for(var i = 0; i < balls.length; i ++ ){
    for(var j = i+1; j < balls.length; j++){
      if(collide(balls[i], balls[j], blob_radius)){
        print('collision');
        handleCollision(balls[i],balls[j])
      }
    }
  }
}

function keyPressed() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW || keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
    // Prevent the default action (scroll / move caret)
    return false;
  }
}

function drawBlob( _x,  _y, _blob_radius,color,mass){
    if(mass == 3){
      strokeWeight(2);
      stroke(0);
    }
    else{
      strokeWeight(5);
      stroke(255);
    }
    //    fill(255);
    // noFill();
    fill(color[0],color[1],color[2]);
  	ellipseMode(RADIUS);
    ellipse(_x, height - _y, _blob_radius, _blob_radius);  
  


    fill(0,0,0); //If more text is written elsewhere make sure the default is black
    stroke(0,0,0); // If more lines are drawn elsewhere make sure the default is black
    strokeWeight(0);

}



function drawEllipse( _x,  _y,  _w,  _h){
  ellipse(_x, height - _y, _w, _h);  
}

function drawLine( _x1,  _y1,  _x2,  _y2){
  strokeWeight(2);
  line(_x1, height - _y1, _x2, height - _y2);  
//  strokeWeight(0);
}


function drawText( _str,  _x, _y){
    if (isNumeric(_str)){
        _str = round(100*_str)/100;
    }
    textSize(20);  
    strokeWeight(1);
    text(_str, _x, height- _y);
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}



function draw(){

    
    if(ballindex == -1 || balls.length <= ballindex || resetting){
        return;
    }
const actions = [LEFT_ARROW,RIGHT_ARROW,UP_ARROW,DOWN_ARROW,32]
    display();



    // for(var i = 0; i < balls.length; i++){
    let ball = balls[ballindex];
    ball.vx += ball.deltaVx;    
    ball.vy += ball.deltaVy;
    
    // Update location
    ball.x += ball.vx*dt;
    ball.y += ball.vy*dt;

    var heavy = keyIsDown(actions[4]);
    if(heavy){
        ball.mass = 5
    }
    else{
        ball.mass = 3
    }

    ball.Fy = 0;
    if (keyIsDown(actions[3])) {
        ball.Fy = -15;
    }
    if (keyIsDown(actions[2])) {
        ball.Fy = 15;
    }
    ball.deltaVy = (ball.Fy/ball.mass - g)*dt;
    
    if ( (ball.y - blob_radius < LOWERWALL) &  (ball.y - blob_radius > LOWERWALL - 20) & ( ball.x > 0) & ( ball.x < width ) ) {
        ball.vy = -0.95*ball.vy;
        ball.y = blob_radius + LOWERWALL + 1;
    }

    ball.Fx = 0;
    if (keyIsDown(actions[0])) {
        ball.Fx = -15;
    }
    if (keyIsDown(actions[1])) {
        ball.Fx = 15;
    }
    ball.deltaVx = ball.Fx*dt/ball.mass;

    if (ball.y < -blob_radius || ball.x < LEFTWALL || ball.x > RIGHTWALL || ball.y > UPPERWALL) {
        tase()
     drawText('Tased',0.42*width,height/2); 
        // balls[ballindex] = new Ball(100+100*ballindex,250,0,0,0,0,0,0,3,ballindex,balls[ballindex].color);
        socket.emit("reset",100)
        resetting = true;
     }
    

    for(ball of balls){
        drawBlob(ball.x,ball.y,blob_radius,ball.color,ball.mass,ballindex );
    }
    if(!resetting){
      collisions(balls, blob_radius);
      socket.emit("update", balls[ballindex]);
      // if(balls.length > 1) LOWERWALL -= dLOWER;

      if(ballindex == 0){
        socket.emit("bottom",LOWERWALL);
      }
    }
}



