import { levels } from "./levels.js";
import {
  findPathBetween,
  getParameterName,
} from "./utils.js";

let gameState = {
  nickname: "",
  currentLevel: 1,
  score: 0,
  timeLeft: 180,
  attemptsLeft: 3,
  placedElements: [],
  timer: null,
  currentTask: "assembly",
  hintsUsed: 0,
};

const GRID_COLS = 15;
const GRID_ROWS = 8;
const TOTAL_CELLS = GRID_COLS * GRID_ROWS;
const authScreen = document.getElementById("auth-screen");
const gameScreen = document.getElementById("game-screen");
const nicknameInput = document.getElementById("nickname");
const startGameBtn = document.getElementById("start-game");
const currentLevelEl = document.getElementById("current-level");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const attemptsEl = document.getElementById("attempts");
const checkBtn = document.getElementById("check-btn");
const resetBtn = document.getElementById("reset-btn");
const hintBtn = document.getElementById("hint-btn");
const taskDescription = document.getElementById("task-description");
const grid = document.getElementById("grid");

function initializeGrid() {
  grid.innerHTML = "";
  for (let i = 0; i < TOTAL_CELLS; i++) {
    
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    cell.dataset.index = i;
    grid.appendChild(cell);
  }
}

startGameBtn.addEventListener("click", () => {
  const nickname = nicknameInput.value.trim();
  if (nickname) {
    gameState.nickname = nickname;
    localStorage.setItem("electricGameNickname", nickname);
    authScreen.style.display = "none";
    gameScreen.style.display = "block";
    loadLevel(1);
  }
});

function getLevelVariations(levelNum) {
  return levels[`level${levelNum}`] || [];
}

function loadLevel(levelNum) {
  const variations = getLevelVariations(levelNum);
  if (variations.length === 0) {
    showNotification(`Уровень ${levelNum} не найден.`, "error");
    return;
  }

  const randomIndex = Math.floor(Math.random() * variations.length);
  const variation = variations[randomIndex];
  gameState.currentLevel = levelNum;
  gameState.timeLeft = variation.time;
  gameState.attemptsLeft = variation.attempts;
  gameState.currentTask = "assembly";
  gameState.placedElements = [];
  gameState.elementParams = {};
  gameState.currentVariation = variation;

  currentLevelEl.textContent = levelNum;
  scoreEl.textContent = gameState.score;
  timerEl.textContent = formatTime(variation.time);
  attemptsEl.textContent = variation.attempts;
  taskDescription.innerHTML = `
    ${variation.task}`;

  document.querySelectorAll(".placed-element").forEach((el) => el.remove());

  renderElementsPanel(variation.availableElements);

  if (gameState.timer) clearInterval(gameState.timer);
  gameState.timer = setInterval(updateTimer, 1000);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

function updateTimer() {
  if (gameState.timeLeft <= 0) {
    clearInterval(gameState.timer);
    saveAttempt(false);
    showNotification("Время вышло! Возвращаемся на главный экран.", "error");
    setTimeout(() => {
      authScreen.style.display = "block";
      gameScreen.style.display = "none";
      gameState = {
        nickname: "",
        currentLevel: 1,
        score: 0,
        timeLeft: 180,
        attemptsLeft: 3,
        placedElements: [],
        timer: null,
        currentTask: "assembly",
        hintsUsed: 0,
        elementParams: {},
      };
    }, 2000);
    return;
  }
  gameState.timeLeft--;
  timerEl.textContent = formatTime(gameState.timeLeft);
}

function openParameterModal(elementType, cellIndex) {
  const variation = gameState.currentVariation;
  if (!variation?.parameters) return;

  const target = variation.parameters.target;
  if (target.element !== elementType) return;
  const modal = document.getElementById("parameter-modal");
  if (!modal) return;
  console.log(target);
  modal.style.display = "block";
  document.getElementById("param-img").src = `./assets/${elementType}.png`;
  document.getElementById("modal-title").textContent =
    {
      current: "Сила тока",
      voltage: "Напряжение",
      resistance: "Сопротивление",
    }[target.property] || "Параметр";
  document.getElementById("param-unit").textContent = target.unit;
  document.getElementById("param-value").dataset.elementType = elementType;
  document.getElementById("param-value").dataset.property = target.property;
  console.log(target.property, elementType);
}

const deleteZone = document.getElementById("delete-zone");
  deleteZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  });
  
  deleteZone.addEventListener("drop", (e) => {
    e.preventDefault();
    const elementType = e.dataTransfer.getData("text/plain");
    const oldIndex = e.dataTransfer.getData("oldCellIndex");
    
    if (oldIndex) {
      const idx = gameState.placedElements.findIndex((c) => c.cell == oldIndex);
      if (idx !== -1) {
        gameState.placedElements.splice(idx, 1);
      }
      const oldCell = document.querySelector(`[data-index="${oldIndex}"]`);
      if (oldCell) {
        oldCell.innerHTML = "";
      }
      
      showNotification(`Элемент удалён`, "success");
    }
    
    deleteZone.style.display = "none";
  });

grid.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
  document.getElementById("delete-zone").style.display = "block";
});

grid.addEventListener("drop", (e) => {
  e.preventDefault();

  const deleteZone = document.getElementById("delete-zone");
  deleteZone.style.display = "none";
  const elementType = e.dataTransfer.getData("text/plain");
  const oldIndex = e.dataTransfer.getData("oldCellIndex");

  const cell = document.elementFromPoint(e.clientX, e.clientY);
  if (!cell || !cell.classList.contains("grid-cell")) return;

  const newIndex = Number(cell.dataset.index);
  if (oldIndex) {
    const idx = gameState.placedElements.findIndex((c) => c.cell == oldIndex);
    if (idx !== -1) gameState.placedElements.splice(idx, 1);

    const oldCell = document.querySelector(`[data-index="${oldIndex}"]`);
    if (oldCell) oldCell.innerHTML = "";
  }
  cell.innerHTML = "";

  const element = document.createElement("div");
  element.className = `placed-element ${elementType}`;
  element.dataset.type = elementType;
  element.draggable = true;
  const img = document.createElement("img");
  img.className = "element-img";
  img.src = `./assets/${elementType}.png`;
  img.alt = elementType;
  img.onerror = () => {
    img.remove();
    element.textContent = getElementIcon(elementType);
  };
  element.appendChild(img);

  if (elementType === "switch") {
    element.dataset.state = "off";
    element.classList.add("off");

    element.addEventListener("click", () => {
      const isOn = element.dataset.state === "on";
      const newStatus = isOn ? "off" : "on";
      element.dataset.state = newStatus;
      element.classList.toggle("on", !isOn);
      element.classList.toggle("off", isOn);
      console.log(isOn);
      const imgEl = element.querySelector(".element-img");
      if (imgEl) {
        imgEl.src =
          newStatus === "on"
            ? "./assets/switch_active.png"
            : "./assets/switch.png";
      }
      console.log();
      const placed = gameState.placedElements.find((p) => p.cell === newIndex);
      if (placed) placed.state = newStatus;
    });
  }
  if (["power", "resistor", "bulb"].includes(elementType)) {
    element.addEventListener("click", () => {
      openParameterModal(elementType, newIndex);
    });
  }

  element.addEventListener("dragstart", (ev) => {
    ev.dataTransfer.setData("text/plain", elementType);
    ev.dataTransfer.setData("oldCellIndex", newIndex);
  });

  cell.appendChild(element);
  gameState.placedElements.push({
    type: elementType,
    cell: newIndex,
    ...(elementType === "switch" && { state: "off" }),
  });
});

function renderElementsPanel(availableElements) {
  const panel = document.getElementById("elements-panel");
  panel.innerHTML = "";

  for (const [type, count] of Object.entries(availableElements)) {
    const el = document.createElement("div");
    el.className = "element";
    el.dataset.type = type;
    el.draggable = true;

    const img = document.createElement("img");
    img.src = `./assets/${type}.png`;
    img.alt = type;
    img.onerror = () => {
      img.remove();
      el.textContent = getElementIcon(type);
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

function getElementIcon(type) {
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
  return icons[type] || "?";
}

let currentDragElement = null;
let offsetX, offsetY;

function startDragging(e) {
  currentDragElement = e.target;
  const rect = currentDragElement.getBoundingClientRect();
  offsetX = e.clientX;
  offsetY = e.clientY;

  document.addEventListener("mousemove", dragElement);
  document.addEventListener("mouseup", stopDragging);
}

function dragElement(e) {
  if (!currentDragElement) return;

  const grid = document.querySelector(".grid");
  const rect = grid.getBoundingClientRect();
  let x = e.clientX;
  let y = e.clientY;
  x = Math.max(0, Math.min(x, rect.width - 80));
  y = Math.max(0, Math.min(y, rect.height - 60));

  currentDragElement.style.left = `${x}px`;
  currentDragElement.style.top = `${y}px`;
}

function stopDragging() {
  if (currentDragElement) {
    document.removeEventListener("mousemove", dragElement);
    document.removeEventListener("mouseup", stopDragging);
    currentDragElement = null;
  }
}

checkBtn.addEventListener("click", () => {
  const assemblyResult = checkAssemblySilent();
  if (!assemblyResult.valid) {
    handleFailedAttempt(assemblyResult.reason);
    return;
  }

  const calcResult = checkCalculation();
  if (!calcResult.valid) {
    handleFailedAttempt(calcResult.reason);
    return;
  }

  activateBulbs();
  completeLevel();
});

function handleFailedAttempt(reason) {
  showNotification("❌ " + reason, "error");
  gameState.attemptsLeft--;
  attemptsEl.textContent = gameState.attemptsLeft;

  if (gameState.attemptsLeft <= 0) {
    showNotification("Попытки закончились! Возвращаемся на главный экран.", "error");
    setTimeout(() => {
      saveAttempt(false);
      authScreen.style.display = "block";
      gameScreen.style.display = "none";
      clearInterval(gameState.timer);
    }, 2000);
  }
}

function activateBulbs() {
  document.querySelectorAll(".placed-element.bulb").forEach((el) => {
    const img = el.querySelector("img");
    if (img) {
      if (!img.dataset.originalSrc) {
        img.dataset.originalSrc = img.src;
      }
      img.src = "./assets/bulb_active.png";
      el.classList.add("on");
    }
  });
}

function checkCalculation() {
  const variation = gameState.currentVariation;
  if (!variation?.parameters) {
    return { valid: true };
  }
  console.log("gameState.elementParams:", gameState.elementParams);
  const { target } = variation.parameters;
  const userValue =
    gameState.elementParams?.[`${target.element}_${target.property}`];

  if (userValue === undefined) {
    return {
      valid: false,
      reason: `Пожалуйста, введите значение ${getParameterName(
        target.property
      )}`,
    };
  }

  const correctAnswer = target.answer;
  const tolerance = target.tolerance ?? 0.02;

  if (Math.abs(userValue - correctAnswer) <= tolerance) {
    return { valid: true };
  } else {
    return {
      valid: false,
      reason: `Неверное значение ${getParameterName(
        target.property
      )}. Попробуйте снова.`,
    };
  }
}
function validateSeriesCircuit(cellsMap, cols = GRID_COLS, powerInfo) {
  const topIndex = powerInfo.index - cols;
  const bottomIndex = powerInfo.index + cols;
  console.log(powerInfo);
  if (!cellsMap[topIndex] || !cellsMap[bottomIndex]) {
    return {
      valid: false,
      reason: "Подключите цепь к верхнему и нижнему выводу батареи",
    };
  }
  const path = findPathBetween(topIndex, bottomIndex, cellsMap, cols);
  if (!path) {
    return {
      valid: false,
      reason: "Цепь не замкнута или соединения некорректны",
    };
  }
  console.log("path:", path);
  const NON_COMPONENT_TYPES = new Set([
    "power",
    "wire_h",
    "wire_v",
    "wire_corner_bl",
    "wire_corner_tl",
    "wire_corner_tr",
    "wire_corner_br",
    "wire",
  ]);

  const pathComponents = path
    .map((idx) => cellsMap[idx])
    .filter((cell) => cell && !NON_COMPONENT_TYPES.has(cell.type))
    .map((cell) => ({ type: cell.type, state: cell.state, index: cell.index }));
  const expected = gameState.currentVariation.layout.elements.filter(
    (t) => t !== "power"
  );
  console.log(expected.length, pathComponents.length);
  if (pathComponents.length !== expected.length) {
    return {
      valid: false,
      reason: `Неверное количество компонентов: ожидается ${expected.length}`,
    };
  }

  for (let i = 0; i < expected.length; i++) {
    if (pathComponents[i].type !== expected[i]) {
      return {
        valid: false,
        reason: `Неверный порядок: позиция ${i + 1} — ожидается "${
          expected[i]
        }", найдено "${pathComponents[i].type}"`,
      };
    }
  }
  for (const comp of pathComponents) {
    if (comp.type === "switch" && comp.state !== "on") {
      return {
        valid: false,
        reason: "Выключатель разомкнут! Кликните по нему, чтобы включить.",
      };
    }
  }
  const allComponents = Object.values(cellsMap).filter(
    (cell) => cell && !NON_COMPONENT_TYPES.has(cell.type)
  );

  const pathIndices = new Set(path);
  const strayComponents = allComponents.filter(
    (comp) => !pathIndices.has(comp.index)
  );
  if (strayComponents.length > 0) {
    return {
      valid: false,
      reason: "Обнаружены лишние компоненты вне основной цепи",
    };
  }

  return { valid: true };
}

function checkAssemblySilent() {
  const variation = gameState.currentVariation;
  if (!variation) {
    return { valid: false, reason: "Ошибка: уровень не загружен" };
  }

  if (variation.layout.type !== "series") {
    return { valid: false, reason: "Только последовательные цепи" };
  }

  const gridEl = document.getElementById("grid");
  const cellsMap = {};
  let powerInfo = null;

  gridEl.querySelectorAll(".grid-cell").forEach((cell) => {
    const idx = Number(cell.dataset.index);
    const placed = cell.querySelector(".placed-element");
    if (placed) {
      const type = placed.dataset.type;
      if (type === "power") {
        powerInfo = { index: idx };
      } else {
        cellsMap[idx] = {
          index: idx,
          type: type,
          state: placed.dataset.state || "on",
        };
      }
    }
  });

  if (!powerInfo) {
    return { valid: false, reason: "Нет питания" };
  }

  return validateSeriesCircuit(cellsMap, GRID_COLS, powerInfo);
}

function checkAssembly() {
  const result = checkAssemblySilent();

  if (result.valid) {
    
    document.querySelectorAll(".placed-element.bulb").forEach((el) => {
      const img = el.querySelector("img");
      if (img) {
        if (!img.dataset.originalSrc) {
          img.dataset.originalSrc = img.src;
        }
        img.src = "./assets/bulb_active.png";
      }
    });

    const variation = gameState.currentVariation;
    if (variation.parameters) {
      showNotification(
        "✅ Схема собрана! Введите параметр в нужном элементе.",
        "success"
      );
    } else {
      completeLevel();
    }
  } else {
    showNotification("❌ " + result.reason, "error");
    gameState.attemptsLeft--;
    attemptsEl.textContent = gameState.attemptsLeft;

    if (gameState.attemptsLeft <= 0) {
      setTimeout(() => loadLevel(gameState.currentLevel), 300);
    }
  }

  return result;
}

function completeLevel() {
  const variation = gameState.currentVariation;
  let levelScore = 50;

  if (variation.calculation) {
    levelScore += 30;
  }

  const timeBonus = Math.floor((gameState.timeLeft / variation.time) * 20);
  levelScore += Math.min(timeBonus, 20);

  const attemptsBonus = (variation.attempts - gameState.attemptsLeft) * 10;
  levelScore += attemptsBonus;

  gameState.score += levelScore;
  scoreEl.textContent = gameState.score;

  showNotification("Схема собрана правильно! Поздравляем!", "success");
  saveAttempt(true);
  setTimeout(() => {
    
    const totalLevels = Object.keys(levels).length; 

    const nextLevel = gameState.currentLevel + 1;
    if (nextLevel <= totalLevels) {
      loadLevel(nextLevel);
    } else {
      showNotification(
        `Поздравляем! Вы прошли все уровни! Ваш итоговый счёт: ${gameState.score}`,
        "success"
      );
      setTimeout(() => loadLevel(1), 3000);
    }
  }, 2000);
}

resetBtn.addEventListener("click", () => {
  if (confirm("Сбросить текущий уровень?")) {
    loadLevel(gameState.currentLevel);
  }
});

hintBtn.addEventListener("click", () => {
  document.getElementById("help-modal").style.display = "block";
});

document.querySelector("#help-modal .close").addEventListener("click", () => {
  document.getElementById("help-modal").style.display = "none";
});

document.getElementById("level-select").addEventListener("click", () => {
  const level = prompt("Введите номер уровня (1-3):", gameState.currentLevel);
  const levelNum = parseInt(level);
  if (levelNum >= 1 && levelNum <= 3) {
    loadLevel(levelNum);
  }
});

document.getElementById("exit-game").addEventListener("click", () => {
  saveAttempt(false);
  authScreen.style.display = "block";
  gameScreen.style.display = "none";
  clearInterval(gameState.timer);
  
  gameState = {
    nickname: "",
    currentLevel: 1,
    score: 0,
    timeLeft: 180,
    attemptsLeft: 3,
    placedElements: [],
    timer: null,
    currentTask: "assembly",
    hintsUsed: 0,
  };
});

document
  .querySelector("#parameter-modal .close")
  .addEventListener("click", () => {
    document.getElementById("parameter-modal").style.display = "none";
  });

document.getElementById("save-param").addEventListener("click", () => {
  const input = document.getElementById("param-value");
  const elementType = input.dataset.elementType;
  const property = input.dataset.property;
  const value = parseFloat(input.value);
  console.log(property, elementType);
  if (isNaN(value)) {
    showNotification("Введите число", "error");
    return;
  }

  if (!gameState.elementParams) gameState.elementParams = {};
  gameState.elementParams[`${elementType}_${property}`] = value;

  document.getElementById("parameter-modal").style.display = "none";
  showNotification("Параметр сохранён", "success");
});

initializeGrid();

const savedNickname = localStorage.getItem("electricGameNickname");
if (savedNickname) {
  nicknameInput.value = savedNickname;
}

function buildCircuitGraph() {
  const graph = {};
  for (const el of gameState.placedElements) {
    graph[el.cell] = [];
  }

  for (const el of gameState.placedElements) {
    const neighbors = getNeighbors(el.cell);

    neighbors.forEach((n) => {
      
      if (gameState.placedElements.some((e) => e.cell === n)) {
        graph[el.cell].push(n);
      }
    });
  }

  return graph;
}

function saveAttempt(isCompleted = false) {
  const attempt = {
    nickname: gameState.nickname,
    level: gameState.currentLevel,
    score: gameState.score,
    timeLeft: gameState.timeLeft,
    completed: isCompleted,
    timestamp: new Date().toISOString()
  };

  const attempts = JSON.parse(localStorage.getItem("electricGameAttempts") || "[]");
  attempts.push(attempt);
  localStorage.setItem("electricGameAttempts", JSON.stringify(attempts));
}

function showNotification(message, type = "error") {
  const notif = document.getElementById("notification");
  notif.textContent = message;
  notif.className = `notification ${type}`;
  notif.style.display = "block";

  setTimeout(() => {
    notif.style.display = "none";
  }, 3000);
}

document.getElementById("show-leaderboard").addEventListener("click", () => {
  const attempts = JSON.parse(localStorage.getItem("electricGameAttempts") || "[]");
  
  if (attempts.length === 0) {
    document.getElementById("leaderboard-content").innerHTML = "<p>Пока нет записей.</p>";
  } else {
    
    const completed = attempts
      .filter(a => a.completed)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); 
    
    if (completed.length === 0) {
      document.getElementById("leaderboard-content").innerHTML = "<p>Нет завершённых попыток.</p>";
    } else {
      const html = `
        <table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ccc;">Игрок</th>
              <th style="text-align: center; padding: 8px; border-bottom: 1px solid #ccc;">Уровень</th>
              <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ccc;">Очки</th>
            </tr>
          </thead>
          <tbody>
            ${completed.map((a, i) => `
              <tr>
                <td style="padding: 8px;">${a.nickname}</td>
                <td style="text-align: center; padding: 8px;">${a.level}</td>
                <td style="text-align: right; padding: 8px;">${a.score}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      document.getElementById("leaderboard-content").innerHTML = html;
    }
  }
  
  document.getElementById("leaderboard-modal").style.display = "block";
});

document.querySelector("#leaderboard-modal .close").addEventListener("click", () => {
  document.getElementById("leaderboard-modal").style.display = "none";
});
