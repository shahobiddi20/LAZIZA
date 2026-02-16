const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const heroNameEl = document.getElementById("heroName");
const scoreEl = document.getElementById("score");
const missionEl = document.getElementById("mission");
const overlay = document.getElementById("overlay");
const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");
const restartBtn = document.getElementById("restartBtn");

const gravity = 0.6;
const jumpPower = -12;

let state = null;
let animationId = null;

const missions = [
  { threshold: 5, text: "1-vazifa: 5 ta to'siqdan yiqilmasdan o'ting." },
  { threshold: 10, text: "2-vazifa: 10 ballga yeting." },
  { threshold: 20, text: "3-vazifa: 20 ball bilan chempion bo'ling!" }
];

const heroStyles = {
  LAZIZA: {
    dress: "#ec4899",
    hijab: "#7c3aed",
    skin: "#f7c59f"
  },
  LACHO: {
    dress: "#f97316",
    hair: "#111827",
    skin: "#f7c59f"
  }
};

function setup(hero) {
  state = {
    hero,
    player: { x: 120, y: 232, w: 42, h: 68, vy: 0, onGround: true },
    obstacles: [{ x: canvas.width + 50, w: 36, h: 54 }],
    score: 0,
    speed: 4.4,
    running: true,
    missionIndex: 0
  };

  menu.classList.add("hidden");
  heroNameEl.textContent = hero;
  scoreEl.textContent = "0";
  missionEl.textContent = missions[0].text;
  overlay.classList.add("hidden");

  if (animationId) cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(loop);
}

function jump() {
  if (!state || !state.running) return;
  if (state.player.onGround) {
    state.player.vy = jumpPower;
    state.player.onGround = false;
  }
}

function spawnObstacle(lastX) {
  const gap = 260 + Math.random() * 180;
  const h = 42 + Math.random() * 26;
  const w = 28 + Math.random() * 22;
  return { x: lastX + gap, w, h };
}

function update() {
  const { player, obstacles } = state;

  player.vy += gravity;
  player.y += player.vy;

  if (player.y >= 232) {
    player.y = 232;
    player.vy = 0;
    player.onGround = true;
  }

  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    obs.x -= state.speed;

    if (!obs.counted && obs.x + obs.w < player.x) {
      obs.counted = true;
      state.score += 1;
      state.speed += 0.08;
      scoreEl.textContent = String(state.score);
      updateMission();
    }
  }

  if (obstacles[0].x + obstacles[0].w < 0) {
    obstacles.shift();
  }

  const last = obstacles[obstacles.length - 1];
  if (!last || last.x < canvas.width - 180) {
    obstacles.push(spawnObstacle(last ? last.x : canvas.width));
  }

  if (checkCollision()) {
    endGame();
  }
}

function updateMission() {
  const current = missions[state.missionIndex];
  if (!current) {
    missionEl.textContent = "Barcha vazifalar bajarildi!";
    missionEl.style.color = "#10b981";
    return;
  }

  if (state.score >= current.threshold) {
    state.missionIndex += 1;
    const next = missions[state.missionIndex];
    if (next) {
      missionEl.textContent = `✅ ${current.threshold} ball olindi! Keyingi: ${next.text}`;
      missionEl.style.color = "#f9fafb";
    } else {
      missionEl.textContent = "🏆 Zo'r! Hamma vazifalarni tugatdingiz.";
      missionEl.style.color = "#10b981";
    }
  }
}

function checkCollision() {
  const p = state.player;

  return state.obstacles.some((o) => {
    const ox = o.x;
    const oy = 300 - o.h;

    return (
      p.x < ox + o.w &&
      p.x + p.w > ox &&
      p.y < oy + o.h &&
      p.y + p.h > oy
    );
  });
}

function drawPlayer() {
  const p = state.player;
  const style = heroStyles[state.hero];

  ctx.fillStyle = style.dress;
  ctx.fillRect(p.x + 8, p.y + 22, p.w - 16, p.h - 22);

  ctx.fillStyle = style.skin;
  ctx.beginPath();
  ctx.arc(p.x + p.w / 2, p.y + 16, 12, 0, Math.PI * 2);
  ctx.fill();

  if (state.hero === "LAZIZA") {
    ctx.fillStyle = style.hijab;
    ctx.beginPath();
    ctx.arc(p.x + p.w / 2, p.y + 13, 13, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(p.x + 12, p.y + 14, p.w - 24, 11);
  } else {
    ctx.fillStyle = style.hair;
    ctx.beginPath();
    ctx.arc(p.x + p.w / 2, p.y + 10, 12, Math.PI, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#111827";
  ctx.fillRect(p.x + 14, p.y + p.h - 6, 6, 6);
  ctx.fillRect(p.x + p.w - 20, p.y + p.h - 6, 6, 6);
}

function drawObstacle(obstacle) {
  const x = obstacle.x;
  const y = 300 - obstacle.h;

  ctx.fillStyle = "#6b7280";
  ctx.fillRect(x, y, obstacle.w, obstacle.h);

  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + obstacle.w / 2, y - 18);
  ctx.lineTo(x + obstacle.w, y);
  ctx.closePath();
  ctx.fill();
}

function drawGround() {
  ctx.fillStyle = "#365314";
  ctx.fillRect(0, 300, canvas.width, 40);

  ctx.strokeStyle = "#4ade80";
  ctx.lineWidth = 2;
  for (let i = 0; i < canvas.width; i += 30) {
    ctx.beginPath();
    ctx.moveTo((i + performance.now() * 0.12) % canvas.width, 300);
    ctx.lineTo((i + performance.now() * 0.12) % canvas.width + 12, 314);
    ctx.stroke();
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGround();
  state.obstacles.forEach(drawObstacle);
  drawPlayer();
}

function loop() {
  if (!state || !state.running) return;
  update();
  render();
  animationId = requestAnimationFrame(loop);
}

function endGame() {
  state.running = false;
  cancelAnimationFrame(animationId);

  resultTitle.textContent = "O'yin tugadi";
  resultText.textContent = `${state.hero} ${state.score} ball oldi.`;
  overlay.classList.remove("hidden");
}

restartBtn.addEventListener("click", () => {
  overlay.classList.add("hidden");
  menu.classList.remove("hidden");
  heroNameEl.textContent = "—";
  scoreEl.textContent = "0";
  missionEl.textContent = "Boshlanishini kutmoqda...";
});

document.querySelectorAll("[data-hero]").forEach((button) => {
  button.addEventListener("click", () => setup(button.dataset.hero));
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault();
    jump();
  }
});
