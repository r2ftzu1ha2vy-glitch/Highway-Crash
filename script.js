const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");
function resize(){canvas.width=innerWidth;canvas.height=innerHeight}
resize();addEventListener("resize",resize);

// Images
const playerImg=new Image();playerImg.src="https://iili.io/fPIveyX.png";
const enemyImg=new Image();enemyImg.src="https://iili.io/fPAwx71.png";
const bikeImg=new Image();bikeImg.src="https://iili.io/fP51511.png";

// Track
const trackWidth=300;
let trackX,laneW;

// Input
let holding=false;
addEventListener("mousedown",()=>holding=true);
addEventListener("mouseup",()=>holding=false);
addEventListener("touchstart",()=>holding=true);
addEventListener("touchend",()=>holding=false);
addEventListener("keydown",e=>{if(e.code==="Space")holding=true});
addEventListener("keyup",e=>{if(e.code==="Space")holding=false});

// State
let paused=false,gameOver=false,exploding=false;
let score=0,high=localStorage.getItem("racerHigh")||0,boom=0,timer=0;

// Player
const car={x:0,y:0,w:65,h:120,speed:6};
const carImg={w:80,h:150};

// Enemy
const enemyBox={w:80,h:120};
const enemyImgSize={w:100,h:160};

// Bike
const bikeBox={w:30,h:60};
const bikeImgSize={w:50,h:100};

let enemies=[],bikes=[],lines=[],trees=[];
let et=0,bt=0;

// UI
const pauseBtn={x:0,y:10,w:60,h:40};
const menuBox={w:260,h:200};
const resumeBtn={x:0,y:0,w:180,h:40};
const restartBtn={x:0,y:0,w:180,h:40};
const crashRestartBtn={x:0,y:0,w:220,h:60};

function init(){
 trackX=canvas.width/2-trackWidth/2;
 laneW=trackWidth/3;
 car.x=canvas.width/2-car.w/2;
 car.y=canvas.height-180;
 enemies=[];bikes=[];
 lines=Array.from({length:30},(_,i)=>({y:i*40}));
 trees=[];
 for(let i=0;i<20;i++){
  trees.push({x:trackX-40,y:i*100});
  trees.push({x:trackX+trackWidth+40,y:i*100});
 }
 pauseBtn.x=canvas.width/2-pauseBtn.w/2;

 menuBox.x=canvas.width/2-menuBox.w/2;
 menuBox.y=canvas.height/2-menuBox.h/2;

 resumeBtn.x=canvas.width/2-resumeBtn.w/2;
 resumeBtn.y=menuBox.y+70;

 restartBtn.x=canvas.width/2-restartBtn.w/2;
 restartBtn.y=menuBox.y+120;

 crashRestartBtn.x=canvas.width/2-crashRestartBtn.w/2;
 crashRestartBtn.y=canvas.height/2+80;

 paused=false;gameOver=false;exploding=false;boom=0;score=0;timer=0;
}
init();

canvas.addEventListener("click",e=>{
 const r=canvas.getBoundingClientRect();
 const mx=e.clientX-r.left,my=e.clientY-r.top;

 if(mx>pauseBtn.x&&mx<pauseBtn.x+pauseBtn.w&&my>pauseBtn.y&&my<pauseBtn.y+pauseBtn.h&&!gameOver){
  paused=!paused;
 }

 if(paused){
  if(mx>resumeBtn.x&&mx<resumeBtn.x+resumeBtn.w&&my>resumeBtn.y&&my<resumeBtn.y+resumeBtn.h) paused=false;
  if(mx>restartBtn.x&&mx<restartBtn.x+restartBtn.w&&my>restartBtn.y&&my<restartBtn.y+restartBtn.h) init();
 }

 if(gameOver){
  if(mx>crashRestartBtn.x&&mx<crashRestartBtn.x+crashRestartBtn.w&&
     my>crashRestartBtn.y&&my<crashRestartBtn.y+crashRestartBtn.h){
    init();
  }
 }
});

function crash(){
 exploding=true;boom=0;
 if(score>high){high=score;localStorage.setItem("racerHigh",high);}
}

function update(){
 if(paused||gameOver)return;
 const speed=5+score*0.15;

 if(!exploding){
  holding?car.x+=car.speed:car.x-=car.speed;
  car.x=Math.max(trackX,Math.min(trackX+trackWidth-car.w,car.x));
 }

 lines.forEach(l=>{l.y+=speed;if(l.y>canvas.height)l.y=-40});
 trees.forEach(t=>{t.y+=speed;if(t.y>canvas.height)t.y=-100});

 et++;
 if(et>100-score){
  et=0;
  let lane=Math.floor(Math.random()*3);
  enemies.push({x:trackX+lane*laneW+(laneW-enemyBox.w)/2,y:-enemyBox.h,w:enemyBox.w,h:enemyBox.h,s:speed});
 }

 bt++;
 if(bt>160-score*2){
  bt=0;
  let pLane=Math.floor((car.x-trackX+car.w/2)/laneW),lane;
  do{lane=Math.floor(Math.random()*3);}while(lane===pLane);
  bikes.push({x:trackX+lane*laneW+laneW/2-bikeBox.w/2,y:-bikeBox.h,w:bikeBox.w,h:bikeBox.h,s:speed+3});
 }

 enemies.forEach(e=>e.y+=e.s);
 bikes.forEach(b=>b.y+=b.s);

 if(!exploding){
  [...enemies,...bikes].forEach(o=>{
   if(car.x<o.x+o.w&&car.x+car.w>o.x&&car.y<o.y+o.h&&car.y+car.h>o.y) crash();
  });
 }

 if(exploding){boom+=8;if(boom>120)gameOver=true;}

 timer++;if(timer>60){score++;timer=0;}
}

let pauseAnim=0;
function draw(){
 pauseAnim+=0.5;
 ctx.clearRect(0,0,canvas.width,canvas.height);

 ctx.fillStyle="green";
 ctx.fillRect(0,0,trackX,canvas.height);
 ctx.fillRect(trackX+trackWidth,0,canvas.width,canvas.height);

 ctx.fillStyle="#555";
 ctx.fillRect(trackX,0,trackWidth,canvas.height);

 ctx.strokeStyle="white";
 for(let i=1;i<3;i++){
  ctx.beginPath();
  ctx.moveTo(trackX+i*laneW,0);
  ctx.lineTo(trackX+i*laneW,canvas.height);
  ctx.stroke();
 }

 ctx.fillStyle="white";
 lines.forEach(l=>{
  ctx.fillRect(trackX+laneW-2,l.y,4,20);
  ctx.fillRect(trackX+2*laneW-2,l.y,4,20);
 });

 trees.forEach(t=>{
  ctx.fillStyle="darkgreen";
  ctx.beginPath();
  ctx.moveTo(t.x,t.y);
  ctx.lineTo(t.x-15,t.y+40);
  ctx.lineTo(t.x+15,t.y+40);
  ctx.fill();
 });

 enemies.forEach(e=>{
  ctx.save();
  ctx.translate(e.x+e.w/2,e.y+e.h/2);
  ctx.rotate(Math.PI);
  ctx.drawImage(enemyImg,-enemyImgSize.w/2,-enemyImgSize.h/2,enemyImgSize.w,enemyImgSize.h);
  ctx.restore();
 });

 bikes.forEach(b=>{
  ctx.save();
  ctx.translate(b.x+b.w/2,b.y+b.h/2);
  ctx.rotate(Math.PI);
  ctx.drawImage(bikeImg,-bikeImgSize.w/2,-bikeImgSize.h/2,bikeImgSize.w,bikeImgSize.h);
  ctx.restore();
 });

 if(!exploding){
  ctx.drawImage(playerImg,car.x+car.w/2-carImg.w/2,car.y+car.h/2-carImg.h/2,carImg.w,carImg.h);
 }

 if(exploding){
  ctx.beginPath();
  ctx.arc(car.x+car.w/2,car.y+car.h/2,boom,0,Math.PI*2);
  ctx.fillStyle="orange";ctx.fill();
 }

 // Pause button
 ctx.fillStyle="#111";
 ctx.fillRect(pauseBtn.x,pauseBtn.y,pauseBtn.w,pauseBtn.h);
 ctx.fillStyle="white";
 let slide=Math.sin(pauseAnim*0.1)*4;
 ctx.fillRect(pauseBtn.x+18,pauseBtn.y+10+slide,6,20);
 ctx.fillRect(pauseBtn.x+36,pauseBtn.y+10+slide,6,20);

 // UI
 ctx.fillStyle="white";
 ctx.font="24px Arial";
 ctx.textAlign="left";
 ctx.fillText("Score: "+score,20,40);
 ctx.textAlign="right";
 ctx.fillText("High: "+high,canvas.width-20,40);

 if(paused){
  ctx.fillStyle="white";
  ctx.fillRect(menuBox.x,menuBox.y,menuBox.w,menuBox.h);
  ctx.strokeStyle="black";
  ctx.strokeRect(menuBox.x,menuBox.y,menuBox.w,menuBox.h);

  ctx.textAlign="center";
  ctx.fillStyle="black";
  ctx.font="28px Arial";
  ctx.fillText("PAUSED",canvas.width/2,menuBox.y+40);

  ctx.strokeRect(resumeBtn.x,resumeBtn.y,resumeBtn.w,resumeBtn.h);
  ctx.strokeRect(restartBtn.x,restartBtn.y,restartBtn.w,restartBtn.h);

  ctx.font="22px Arial";
  ctx.fillText("RESUME",canvas.width/2,resumeBtn.y+28);
  ctx.fillText("RESTART",canvas.width/2,restartBtn.y+28);
 }

 if(gameOver){
  ctx.textAlign="center";
  ctx.font="50px Arial";
  ctx.fillText("YOU CRASHED",canvas.width/2,canvas.height/2);

  ctx.fillStyle="#222";
  ctx.fillRect(crashRestartBtn.x,crashRestartBtn.y,crashRestartBtn.w,crashRestartBtn.h);
  ctx.strokeStyle="white";
  ctx.strokeRect(crashRestartBtn.x,crashRestartBtn.y,crashRestartBtn.w,crashRestartBtn.h);

  ctx.fillStyle="white";
  ctx.font="28px Arial";
  ctx.fillText("RESTART",canvas.width/2,crashRestartBtn.y+40);
 }
}

function loop(){update();draw();requestAnimationFrame(loop)}
loop();
