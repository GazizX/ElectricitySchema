import { gameState, GRID_COLS, TOTAL_CELLS } from "./gameState.js";
import { loadLeaderboard } from "./storage.js";

// DOM-элементы
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const attemptsEl = document.getElementById("attempts");

export function initializeGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  for (let i = 0; i < TOTAL_CELLS; i++) {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    cell.dataset.index = i;
    grid.appendChild(cell);
  }
}

export function renderElementsPanel(availableElements) {
  const panel = document.getElementById("elements-panel");
  panel.innerHTML = "";

  const icons = {
    resistor: "Ω",
    bulb: "💡",
    led: "🔴",
    relay: "🔌",
    power: "⚡",
    switch: "🔘",
    wire_h: "—",
    wire_v: "|",
    wire_corner: "┗",
  };

  for (const [type, count] of Object.entries(availableElements)) {
    const el = document.createElement("div");
    el.className = "element";
    el.dataset.type = type;
    el.draggable = true;

    const img = document.createElement("img");
    img.src = `./assets/${type}.webp`;
    img.alt = type;
    img.onerror = () => {
      img.remove();
      el.textContent = icons[type] || "?";
    };
    el.appendChild(img);
    el.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", type);
      el.style.opacity = "0.5";
    });
    el.addEventListener("dragend", () => {
      el.style.opacity = "1";
    });

    panel.appendChild(el);
  }
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export function updateTimerUI() {
  timerEl.textContent = formatTime(gameState.timeLeft);
}

export function updateAttemptsUI() {
  attemptsEl.textContent = gameState.attemptsLeft;
}

export function updateScoreUI() {
  scoreEl.textContent = gameState.score;
}

export function updateLevelUI(level) {
  document.getElementById("current-level").textContent = level;
}

export function updateTaskDescription(task) {
  document.getElementById("task-description").innerHTML = task;
}

export function showNotification(message, type = "error") {
  const notif = document.getElementById("notification");
  notif.textContent = message;
  notif.className = `notification ${type}`;
  notif.style.display = "block";
  setTimeout(() => (notif.style.display = "none"), 3000);
}

export function activateBulb(el) {
  const img = el.querySelector("img");
  if (img) {
    if (!img.dataset.originalSrc) img.dataset.originalSrc = img.src;
    img.src = "./assets/bulb_active.webp";
    el.classList.add("on");
  }
}

export function showScreen(screenId) {
  document.getElementById("auth-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("leaderboard-screen").style.display = "none";
  if (screenId !== "auth"){
    document.getElementById("auth-background").style.display = "none";
  } else {
    document.getElementById("auth-background").style.display = "block";
  }
  document.getElementById(`${screenId}-screen`).style.display = "block";
}

export function renderLeaderboard() {
  const leaderboard = loadLeaderboard();
  const tbody = document.getElementById("leaderboard-body");

  if (leaderboard.length === 0) {
    tbody.innerHTML = `<tr><td colspan="2" class="empty">Пока нет рекордов</td></tr>`;
    return;
  }

  let html = "";
  leaderboard.slice(0, 15).forEach((player) => {
    html += `
      <tr>
        <td>${player.nickname}</td>
        <td><strong>${player.score}</strong></td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

export function showConfirm(message, onConfirm, onCancel) {
  const confirmDiv = document.createElement("div");
  confirmDiv.className = "modal";
  confirmDiv.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Подтверждение</h3>
        <span class="close">&times;</span>
      </div>
      <p>${message}</p>
      <div style="display: flex; gap: 10px; width: 100%;">
        <button id="confirm-yes" class="btn btn-primary" style="flex:1">Да</button>
        <button id="confirm-no" class="btn btn-secondary" style="flex:1">Нет</button>
      </div>
    </div>
  `;
  document.body.appendChild(confirmDiv);

  const yesBtn = confirmDiv.querySelector("#confirm-yes");
  const noBtn = confirmDiv.querySelector("#confirm-no");
  const closeBtn = confirmDiv.querySelector(".close");

  const cleanup = () => {
    if (confirmDiv.parentNode) confirmDiv.parentNode.removeChild(confirmDiv);
  };

  yesBtn.addEventListener("click", () => {
    cleanup();
    if (onConfirm) onConfirm();
  });
  noBtn.addEventListener("click", () => {
    cleanup();
    if (onCancel) onCancel();
  });
  closeBtn.addEventListener("click", cleanup);
}

export function showLevelCompleteModal(onRetry, onNextLevel) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <h2>✅ Уровень пройден!</h2>
      <p>Ваш счёт обновлён.</p>
      <div style="display: flex; gap: 10px; width: 100%;">
        <button id="retry-level" class="btn btn-primary" style="flex:1">Еще раз</button>
        <button id="next-level" class="btn btn-secondary" style="flex:1">Следующий уровень</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const retryBtn = modal.querySelector("#retry-level");
  const nextBtn = modal.querySelector("#next-level");

  retryBtn.addEventListener("click", () => {
    document.body.removeChild(modal);
    if (onRetry) onRetry();
  });
  nextBtn.addEventListener("click", () => {
    document.body.removeChild(modal);
    if (onNextLevel) onNextLevel();
  });
}

export function showLevelSelectModal(currentLevel, onSelect) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Выберите уровень</h3>
        <span class="close">&times;</span>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 15px;">
        <button class="btn btn-primary level-btn" data-level="1">Уровень 1</button>
        <button class="btn btn-primary level-btn" data-level="2">Уровень 2</button>
        <button class="btn btn-primary level-btn" data-level="3">Уровень 3</button>
      </div>
      <p style="margin-top: 15px; font-size: 0.9rem; color: #666;">
        Текущий: Уровень ${currentLevel}
      </p>
    </div>
  `;
  document.body.appendChild(modal);

  const closeBtn = modal.querySelector(".close");
  const buttons = modal.querySelectorAll(".level-btn");

  const cleanup = () => {
    if (modal.parentNode) modal.parentNode.removeChild(modal);
  };

  closeBtn.addEventListener("click", cleanup);

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const level = parseInt(btn.dataset.level);
      cleanup();
      if (onSelect) onSelect(level);
    });
  });
}

export function highlightInputElement(elementType) {
  document.querySelectorAll(".placed-element.highlight").forEach((el) => {
    el.classList.remove("highlight");
  });
  if (elementType !== null) {
    document
      .querySelectorAll(`.placed-element.${elementType}`)
      .forEach((el) => {
        el.classList.add("highlight");
      });
  }
}

export function animateElectricFlow(path) {
  path.forEach((cellIndex, i) => {
    setTimeout(() => {
      const cell = document.querySelector(
        `.grid-cell[data-index="${cellIndex}"]`
      );
      if (!cell) return;
      const element = cell.querySelector(".placed-element");
      if (element) {
        cell.classList.add("current");
        setTimeout(() => cell.classList.remove("current"), 200);
        if (element.classList.contains("bulb")) {
          activateBulb(element);
        }
      }
    }, i * 300);
  });
}
