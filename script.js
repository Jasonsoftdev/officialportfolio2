// ----- Theme toggle -----
const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const swapTheme = document.getElementById("swapTheme");
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const saveTheme = (theme) => localStorage.setItem("theme", theme);
const applyTheme = (theme) => {
  if (theme === "light") root.setAttribute("data-theme", "light");
  else root.removeAttribute("data-theme");
};
applyTheme(localStorage.getItem("theme"));

themeToggle?.addEventListener("click", () => {
  const isLight = root.getAttribute("data-theme") === "light";
  const next = isLight ? "dark" : "light";
  applyTheme(next);
  saveTheme(next);
});

// Match theme to average brightness of photo (simple heuristic)
swapTheme?.addEventListener("click", () => {
  const img = document.querySelector("#photo img");
  if (!img) return;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 32; canvas.height = 32;
  try {
    ctx.drawImage(img, 0, 0, 32, 32);
  } catch (e) {
    // cross-origin images may block pixel read; silently fail
    return;
  }
  const data = ctx.getImageData(0, 0, 32, 32).data;
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    sum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  const avg = sum / (data.length / 4);
  const next = avg > 127 ? "light" : "dark";
  applyTheme(next);
  saveTheme(next);
});

// Smooth scroll for nav links
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ----- Contact form validation (client only) -----
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");

function setError(id, message) {
  const el = document.querySelector(`.error[data-for="${id}"]`);
  if (el) el.textContent = message || "";
}

function validate() {
  if (!form) return false;
  let ok = true;
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();

  setError("name", "");
  setError("email", "");
  setError("message", "");

  if (!name) { setError("name", "Please enter your name."); ok = false; }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) { setError("email", "Enter a valid email."); ok = false; }
  if (!message || message.length < 10) { setError("message", "Please write at least 10 characters."); ok = false; }
  return ok;
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validate()) return;

  // Demo: no backend yet
  statusEl.textContent = "Thanks! Your message was captured locally.";
  form.reset();
  setTimeout(() => { statusEl.textContent = ""; }, 4000);
});

// ----- Mini game: Star catcher -----
const canvas = document.getElementById("gameCanvas");
const ctx = canvas?.getContext ? canvas.getContext("2d") : null;
const scoreEl = document.getElementById("score");
const missesEl = document.getElementById("misses");
const restartBtn = document.getElementById("restartBtn");

if (canvas && ctx) {
  const W = canvas.width, H = canvas.height;

  let stars = [];
  let score = 0;
  let misses = 0;
  let running = true;

  const paddle = { x: W / 2 - 50, y: H - 28, w: 100, h: 16, speed: 6, dx: 0 };

  function reset() {
    stars = [];
    score = 0;
    misses = 0;
    running = true;
    paddle.x = W / 2 - paddle.w / 2;
    if (scoreEl) scoreEl.textContent = score;
    if (missesEl) missesEl.textContent = misses;
  }
  reset();

  function spawnStar() {
    const size = Math.random() * 10 + 6;
    stars.push({
      x: Math.random() * (W - size),
      y: -size,
      r: size / 2,
      vy: Math.random() * 1.5 + 1.3,
      glow: Math.random() > 0.5
    });
  }

  function drawBackground() {
    ctx.save();
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      const x = (Math.sin(i + Date.now()/900) + 1) / 2 * W;
      const y = (Math.cos(i + Date.now()/1000) + 1) / 2 * H;
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawPaddle() {
    ctx.save();
    const grad = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x + paddle.w, paddle.y);
    grad.addColorStop(0, "#6ae3ff");
    grad.addColorStop(1, "#b28dff");
    ctx.fillStyle = grad;
    roundRect(ctx, paddle.x, paddle.y, paddle.w, paddle.h, 8, true, false);
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  function drawStar(s) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = s.glow ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.7)";
    ctx.shadowColor = "#6ae3ff";
    ctx.shadowBlur = s.glow ? 20 : 8;
    ctx.fill();
    ctx.restore();
  }

  function update() {
    if (!running) return;

    ctx.clearRect(0, 0, W, H);
    drawBackground();

    // Move paddle
    paddle.x += paddle.dx;
    paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));

    // Spawn stars
    if (Math.random() < 0.03) spawnStar();

    // Update stars
    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i];
      s.y += s.vy;

      // Collision with paddle
      const withinX = s.x + s.r > paddle.x && s.x - s.r < paddle.x + paddle.w;
      const withinY = s.y + s.r > paddle.y && s.y - s.r < paddle.y + paddle.h;
      if (withinX && withinY) {
        score += 1;
        if (scoreEl) scoreEl.textContent = score;
        stars.splice(i, 1);
        continue;
      }

      if (s.y - s.r > H) {
        misses += 1;
        if (missesEl) missesEl.textContent = misses;
        stars.splice(i, 1);
        if (misses >= 3) {
          gameOver();
        }
      }
    }

    // Draw
    drawPaddle();
    stars.forEach(drawStar);

    requestAnimationFrame(update);
  }

  function gameOver() {
    running = false;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "bold 28px Inter, sans-serif";
    ctx.fillText("Game Over", W / 2, H / 2 - 20);
    ctx.font = "16px Inter, sans-serif";
    ctx.fillText(`Score: ${score}`, W / 2, H / 2 + 10);
    ctx.restore();
  }

  document.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (k === "arrowleft" || k === "a") paddle.dx = -paddle.speed;
    if (k === "arrowright" || k === "d") paddle.dx = paddle.speed;
  });
  document.addEventListener("keyup", (e) => {
    const k = e.key.toLowerCase?.() || e.key;
    if (["arrowleft", "arrowright", "a", "d"].includes(k)) paddle.dx = 0;
  });

  restartBtn?.addEventListener("click", () => {
    reset();
    running = true;
    update();
  });

  update();
}
