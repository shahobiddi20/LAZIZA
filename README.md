# LAZIZ0
<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="UTF-8">
<title>LAZIZA & LACHO Runner</title>
<style>
body { text-align:center; background:#111; color:white; font-family:Arial; }
canvas { background:#222; border:3px solid #fff; }
button { font-size:18px; margin:10px; padding:10px 20px; }
</style>
</head>

<body>

<h1>LAZIZA & LACHO Runner</h1>

<div id="menu">
  <p>Qahramonni tanlang:</p>
  <button onclick="startGame('LAZIZA')">LAZIZA (Hijobda)</button>
  <button onclick="startGame('LACHO')">LACHO (Oddiy)</button>
</div>

<canvas id="game" width="800" height="300" style="display:none;"></canvas>

<script>
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let player, obstacle, score, gameSpeed, gameLoop;

function startGame(hero){
  document.getElementById("menu").style.display="none";
  canvas.style.display="block";

  player = { x:50, y:220, w:40, h:60, vy:0, jump:false, hero:hero };
  obstacle = { x:800, y:240, w:30, h:40 };
  score = 0;
  gameSpeed = 4;

  document.addEventListener("keydown", jump);
  gameLoop = setInterval(update, 20);
}

function jump(e){
  if(e.code=="Space" && !player.jump){
    player.vy = -12;
    player.jump = true;
  }
}

function update(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // player
  player.y += player.vy;
  player.vy += 0.7;
  if(player.y > 220){
    player.y = 220;
    player.jump = false;
  }

  // obstacle
  obstacle.x -= gameSpeed;
  if(obstacle.x < -30){
    obstacle.x = 800;
    score++;
  }

  // collision
  if(player.x < obstacle.x + obstacle.w &&
     player.x + player.w > obstacle.x &&
     player.y < obstacle.y + obstacle.h &&
     player.y + player.h > obstacle.y){
       gameOver();
  }

  draw();
}

function draw(){
  ctx.fillStyle = player.hero=="LAZIZA" ? "#ff00ff" : "#00ffff";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  ctx.fillStyle="red";
  ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);

  ctx.fillStyle="white";
  ctx.font="20px Arial";
  ctx.fillText("Qahramon: "+player.hero,10,25);
  ctx.fillText("Hisob: "+score,10,50);
  ctx.fillText("SPACE = sakrash",600,25);
}

function gameOver(){
  clearInterval(gameLoop);
  alert("O'yin tugadi!\nHisob: "+score);
  location.reload();
}
</script>

</body>
</html>
