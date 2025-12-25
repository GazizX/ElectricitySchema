export function saveNickname(nickname) {
  localStorage.setItem("electricGameNickname", nickname);
}

export function loadNickname() {
  return localStorage.getItem("electricGameNickname");
}

export function savePlayerScore(nickname, finalScore) {
  const leaderboard = JSON.parse(localStorage.getItem("electricGameLeaderboard") || "[]");
  
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
  localStorage.setItem("electricGameLeaderboard", JSON.stringify(leaderboard));
}

export function saveAttempt(attempt) {
  const attempts = JSON.parse(localStorage.getItem("electricGameAttempts") || "[]");
  attempts.push(attempt);
  localStorage.setItem("electricGameAttempts", JSON.stringify(attempts));
}

export function loadLeaderboard() {
  return JSON.parse(localStorage.getItem("electricGameLeaderboard") || "[]");
}