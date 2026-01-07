const NON_COMPONENT_TYPES = new Set([
  "power", "wire_h", "wire_v",
  "wire_corner_bl", "wire_corner_tl",
  "wire_corner_tr", "wire_corner_br", "wire"
]);

function checkAssemblySilent() {
  const variation = gameState.currentVariation;
  if (!variation) return { valid: false, reason: "Ошибка: уровень не загружен" };
  if (variation.layout.type !== "series") return { valid: false, reason: "Только последовательные цепи" };

  const cellsMap = {};
  let powerInfo = null;

  for (const el of gameState.placedElements) {
    if (el.type === "power") {
      powerInfo = { index: el.cell };
    } else {
      cellsMap[el.cell] = {
        index: el.cell,
        type: el.type,
        state: el.state || "on"
      };
    }
  }

  if (!powerInfo) return { valid: false, reason: "Нет питания" };
  return validateSeriesCircuit(cellsMap, GRID_COLS, powerInfo);
}

function validateSeriesCircuit(cellsMap, cols, powerInfo) {
  const topIndex = powerInfo.index - cols;
  const bottomIndex = powerInfo.index + cols;

  if (!cellsMap[topIndex] || !cellsMap[bottomIndex]) {
    return { valid: false, reason: "Подключите цепь к верхнему и нижнему выводу батареи" };
  }

  const path = findPathBetween(topIndex, bottomIndex, cellsMap, cols);
  if (!path) return { valid: false, reason: "Цепь не замкнута или соединения некорректны" };

  const pathComponents = path
    .map(idx => cellsMap[idx])
    .filter(cell => cell && !NON_COMPONENT_TYPES.has(cell.type))
    .map(cell => ({ type: cell.type, state: cell.state }));

  const expected = gameState.currentVariation.layout.elements.filter(t => t !== "power");

  if (pathComponents.length !== expected.length) {
    return { valid: false, reason: `Неверное количество компонентов: ожидается ${expected.length}` };
  }

  for (let i = 0; i < expected.length; i++) {
    if (pathComponents[i].type !== expected[i]) {
      return { valid: false, reason: `Неверный порядок: позиция ${i + 1} — ожидается "${expected[i]}", найдено "${pathComponents[i].type}"` };
    }
  }

  for (const comp of pathComponents) {
    if (comp.type === "switch" && comp.state !== "on") {
      return { valid: false, reason: "Выключатель разомкнут! Кликните по нему, чтобы включить." };
    }
  }

  const allComponents = Object.values(cellsMap).filter(cell => cell && !NON_COMPONENT_TYPES.has(cell.type));
  const pathIndices = new Set(path);
  const strayComponents = allComponents.filter(comp => !pathIndices.has(comp.index));
  if (strayComponents.length > 0) {
    return { valid: false, reason: "Обнаружены лишние компоненты вне основной цепи" };
  }

  return { valid: true };
}

function checkCalculation() {
  const variation = gameState.currentVariation;
  if (!variation?.parameters) return { valid: true };

  const { target } = variation.parameters;
  const userValue = gameState.elementParams?.[`${target.element}_${target.property}`];

  if (userValue === undefined) {
    const name = target.property === 'voltage' ? 'Напряжение' :
                 target.property === 'resistance' ? 'Сопротивление' : 'Сила тока';
    return { valid: false, reason: `Пожалуйста, введите значение ${name}` };
  }

  const correctAnswer = target.answer;
  const tolerance = target.tolerance ?? 0.02;

  if (Math.abs(userValue - correctAnswer) <= tolerance) {
    return { valid: true };
  } else {
    const name = target.property === 'voltage' ? 'Напряжение' :
                 target.property === 'resistance' ? 'Сопротивление' : 'Сила тока';
    return { valid: false, reason: `Неверное значение ${name}. Попробуйте снова.` };
  }
}

function calculateLevelScore() {
  const variation = gameState.currentVariation;
  let levelScore = 50;
  if (variation.parameters) levelScore += 30;

  const timeBonus = Math.floor((gameState.timeLeft / variation.time) * 20);
  levelScore += Math.min(timeBonus, 20);

  const attemptsBonus = (variation.attempts - gameState.attemptsLeft) * 10;
  levelScore += attemptsBonus;

  return levelScore;
}