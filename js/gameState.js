export const GRID_COLS = 15;
export const GRID_ROWS = 8;
export const TOTAL_CELLS = GRID_COLS * GRID_ROWS;

export const createInitialState = () => ({
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
  currentVariation: null,
});

let gameState = createInitialState();

export { gameState };

export function resetGameState() {
  gameState = createInitialState();
}

export function updateGameState(updates) {
  Object.assign(gameState, updates);
}