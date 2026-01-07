const GRID_COLS = 15;
const GRID_ROWS = 8;
const TOTAL_CELLS = GRID_COLS * GRID_ROWS;

const createInitialState = () => ({
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

{ gameState };

function resetGameState() {
  gameState = createInitialState();
}

function updateGameState(updates) {
  Object.assign(gameState, updates);
}