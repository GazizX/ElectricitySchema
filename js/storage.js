ESchema_localStorage = localStorage;
function saveNickname(nickname) {
  ESchema_localStorage.setItem("electricGameNickname", nickname);
}

function loadNickname() {
  return ESchema_localStorage.getItem("electricGameNickname");
}

function savePlayerScore(nickname, finalScore) {
  const leaderboard = JSON.parse(ESchema_localStorage.getItem("electricGameLeaderboard") || "[]");
  
  const existingPlayer = leaderboard.find(player => player.nickname === nickname);
  
  if (existingPlayer) {
    if (finalScore > existingPlayer.score) {
      existingPlayer.score = finalScore;
      existingPlayer.timestamp = new Date().toISOString();
    }
  } else {
    leaderboard.push({
      nickname,
      score: finalScore,
      timestamp: new Date().toISOString()
    });
  }

  leaderboard.sort((a, b) => b.score - a.score);
  ESchema_localStorage.setItem("electricGameLeaderboard", JSON.stringify(leaderboard));
}

function saveAttempt(attempt) {
  const attempts = JSON.parse(ESchema_localStorage.getItem("electricGameAttempts") || "[]");
  attempts.push(attempt);
  ESchema_localStorage.setItem("electricGameAttempts", JSON.stringify(attempts));
}

function loadLeaderboard() {
  return JSON.parse(ESchema_localStorage.getItem("electricGameLeaderboard") || "[]");
}