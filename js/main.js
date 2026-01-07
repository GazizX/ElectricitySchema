const nicknameInput = document.getElementById("nickname");
const startGameBtn = document.getElementById("start-game");
const checkBtn = document.getElementById("check-btn");
const resetBtn = document.getElementById("reset-btn");
const hintBtn = document.getElementById("hint-btn");
const grid = document.getElementById("grid");
const deleteZone = document.getElementById("delete-zone");
const leaderboardBtn = document.getElementById("show-leaderboard");
const levelSelectBtn = document.getElementById("level-select");
const exitGameBtn = document.getElementById("exit-game");

// === ЗАГРУЗКА УРОВНЯ ===
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
  gameState.placedElements = [];
  gameState.elementParams = {};
  gameState.currentVariation = variation;

  updateLevelUI(levelNum);
  updateScoreUI();
  updateTimerUI();
  updateAttemptsUI();
  updateTaskDescription(variation.task);

  document.querySelectorAll(".placed-element").forEach((el) => el.remove());
  renderElementsPanel(variation.availableElements);

  if (gameState.timer) clearInterval(gameState.timer);
  gameState.timer = setInterval(() => {
    gameState.timeLeft--;
    updateTimerUI();
    if (gameState.timeLeft <= 0) {
      clearInterval(gameState.timer);
      showNotification("Время вышло!", "error");
      setTimeout(finishGameSession, 2000);
    }
  }, 1000);

  // Подсветка, если есть параметры
  if (variation.parameters) {
    setTimeout(() => {
      highlightInputElement(variation.parameters.target.element);
    }, 500);
  }
}

// === DRAG & DROP ===
deleteZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
});

deleteZone.addEventListener("drop", (e) => {
  e.preventDefault();
  const oldIndex = e.dataTransfer.getData("oldCellIndex");
  if (oldIndex) {
    const idx = gameState.placedElements.findIndex((c) => c.cell == oldIndex);
    if (idx !== -1) gameState.placedElements.splice(idx, 1);
    const oldCell = document.querySelector(`[data-index="${oldIndex}"]`);
    if (oldCell) oldCell.innerHTML = "";
    showNotification("Элемент удалён", "success");
  }
  deleteZone.style.display = "none";
});

grid.addEventListener("dragover", (e) => {
  e.preventDefault();
  deleteZone.style.display = "block";
});

grid.addEventListener("drop", (e) => {
  e.preventDefault();
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
  img.src = `./assets/${elementType}.webp`;
  img.className = "element-img";
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
      img.src =
        newStatus === "on"
          ? "./assets/switch_active.webp"
          : "./assets/switch.webp";
      const placed = gameState.placedElements.find((p) => p.cell === newIndex);
      if (placed) placed.state = newStatus;
    });
  }

  if (["power", "resistor", "bulb"].includes(elementType)) {
    element.addEventListener("click", () =>
      openParameterModal(elementType, newIndex)
    );
  }

  // УДАЛЕНИЕ ПО ПКМ
  element.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const idx = gameState.placedElements.findIndex((p) => p.cell === newIndex);
    if (idx !== -1) gameState.placedElements.splice(idx, 1);
    cell.innerHTML = "";
    showNotification("Элемент удалён (ПКМ)", "success");
  });

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

// === ПАРАМЕТРЫ ===
function openParameterModal(elementType, cellIndex) {
  const variation = gameState.currentVariation;
  if (!variation?.parameters) return;
  const target = variation.parameters.target;
  if (target.element !== elementType) return;

  const modal = document.getElementById("parameter-modal");
  modal.style.display = "block";
  document.getElementById("param-img").src = `./assets/${elementType}.webp`;
  document.getElementById("modal-title").textContent =
    {
      current: "Сила тока",
      voltage: "Напряжение",
      resistance: "Сопротивление",
    }[target.property] || "Параметр";
  document.getElementById("param-unit").textContent = target.unit;
  document.getElementById("param-value").dataset.elementType = elementType;
  document.getElementById("param-value").dataset.property = target.property;
}

// === СБРОС ПО ПРОБЕЛУ ===
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && gameState.currentVariation) {
    e.preventDefault();
    handleReset();
  }
});

function handleReset() {
  showConfirm("Сбросить текущий уровень?", () => {
    loadLevel(gameState.currentLevel);
  });
}

checkBtn.addEventListener("click", () => {
  let path;
  const assemblyResult = checkAssemblySilent();
  if (!assemblyResult.valid) {
    handleFailedAttempt(assemblyResult.reason);
    return;
  }

  const calcResult = checkCalculation();
  if (!calcResult.valid) {
    const variation = gameState.currentVariation;
    if (variation.parameters) {
      highlightInputElement(variation.parameters.target.element);
    }
    handleFailedAttempt(calcResult.reason);
    return;
  }
  highlightInputElement(null);
  const cellsMap = {};
  let powerInfo = null;

  for (const el of gameState.placedElements) {
    if (el.type === "power") {
      powerInfo = { index: el.cell };
    } else {
      cellsMap[el.cell] = {
        index: el.cell,
        type: el.type,
        state: el.state || "on",
      };
    }
  }

  if (powerInfo) {
    path = findPathBetween(
      powerInfo.index - GRID_COLS,
      powerInfo.index + GRID_COLS,
      cellsMap,
      GRID_COLS
    );
    if (path) {
      animateElectricFlow(path);
    }
  }
  handleLevelComplete(path ? 300 * path.length : 1500);
});

function handleFailedAttempt(reason) {
  showNotification("❌ " + reason, "error");
  gameState.attemptsLeft--;
  updateAttemptsUI();

  if (gameState.attemptsLeft <= 0) {
    showNotification(
      "Попытки закончились! Возвращаемся на главный экран.",
      "error"
    );
    setTimeout(() => {
      showScreen("auth");
      resetGameState();
    }, 2000);
  }
}

function handleLevelComplete(timeout) {
  const levelScore = calculateLevelScore();
  gameState.score += levelScore;
  updateScoreUI();
  showNotification("✅ Схема собрана правильно!", "success");

  setTimeout(() => {
    showLevelCompleteModal(
      () => loadLevel(gameState.currentLevel), // Еще раз
      () => {
        const totalLevels = Object.keys(levels).length;
        const nextLevel = gameState.currentLevel + 1;
        if (nextLevel <= totalLevels) {
          loadLevel(nextLevel);
        } else {
          showNotification("🏆 Поздравляем! Вы прошли все уровни!", "success");
          finishGameSession();
        }
      }
    );
  }, timeout);
}

// === ДРУГИЕ КНОПКИ ===
startGameBtn.addEventListener("click", () => {
  const nickname = nicknameInput.value.trim();
  if (nickname) {
    gameState.nickname = nickname;
    saveNickname(nickname);
    showScreen("game");
    loadLevel(1);
  }
});

resetBtn.addEventListener("click", handleReset);

hintBtn.addEventListener("click", () => {
  document.getElementById("help-modal").style.display = "block";
});

document.querySelector("#help-modal .close").addEventListener("click", () => {
  document.getElementById("help-modal").style.display = "none";
});

levelSelectBtn.addEventListener("click", () => {
  showLevelSelectModal(gameState.currentLevel, (levelNum) => {
    if (levelNum >= 1 && levelNum <= 3) {
      loadLevel(levelNum);
    }
  });
});

function finishGameSession() {
  if (gameState.nickname && gameState.score > 0) {
    savePlayerScore(gameState.nickname, gameState.score);
  }
  showScreen("auth");
  resetGameState();
  if (gameState.timer) clearInterval(gameState.timer);
}

document.getElementById("show-leaderboard").addEventListener("click", () => {
  renderLeaderboard();
  showScreen("leaderboard");
});

document.getElementById("back-to-auth").addEventListener("click", () => {
  showScreen("auth");
});

exitGameBtn.addEventListener("click", finishGameSession);

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
  if (isNaN(value)) {
    showNotification("Введите число", "error");
    return;
  }
  if (!gameState.elementParams) gameState.elementParams = {};
  gameState.elementParams[`${elementType}_${property}`] = value;
  document.getElementById("parameter-modal").style.display = "none";
  showNotification("Параметр сохранён", "success");
});

// === ИНИЦИАЛИЗАЦИЯ ===
initializeGrid();
showScreen("auth");
const savedNickname = loadNickname();
if (savedNickname) nicknameInput.value = savedNickname;

function initAuthBackground() {
  const bgContainer = document.getElementById("auth-background");
  const amount = 100;
  if (!bgContainer) return;

  for (let i = 0; i < amount; i++) {
    const emoji = document.createElement("div");
    emoji.className = "lightning";
    emoji.textContent = "⚡";

    const x = Math.random() * 100;
    const y = Math.random() * 100;
    emoji.style.left = `${x}%`;
    emoji.style.top = `${y}%`;

    const size = 16 + Math.random() * 50;
    emoji.style.fontSize = `${size}px`;

    emoji.style.opacity = 0.2 + Math.random() * 0.3;

    bgContainer.appendChild(emoji);
  }

  let mouseX = 50,
    mouseY = 50;
  document.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth) * 100;
    mouseY = (e.clientY / window.innerHeight) * 100;
  });

  function animate() {
    const emojis = document.querySelectorAll(".lightning");
    const sensitivity = 0.8;

    emojis.forEach((emoji, i) => {
      const rotateX = (mouseY - 50) * sensitivity;
      const rotateY = (mouseX - 50) * sensitivity;
      emoji.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    requestAnimationFrame(animate);
  }
  animate();
}

if (document.getElementById("auth-screen")) {
  initAuthBackground();
}
