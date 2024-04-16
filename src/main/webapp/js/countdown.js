startAudio = new Audio("sound/start-effect.mp3 ");


// Start the timer intervals
timerInterval1 = setInterval(updateTimer1, 1000);
timerInterval2 = setInterval(updateTimer2, 1000);




// Timer related functions
function updateTimer1() {
  console.log("Updating timer 1");
  player1Time--;
  const timer1Display = document.getElementById("timer1");
  timer1Display.textContent = formatTime(player1Time);
  if (player1Time <= 0) {
    clearInterval(timerInterval1);
    alert("Player 1's time is up!");
  }
}

function updateTimer2() {
  console.log("Updating timer 2");
  player2Time--;
  const timer2Display = document.getElementById("timer2");
  timer2Display.textContent = formatTime(player2Time);
  if (player2Time <= 0) {
    clearInterval(timerInterval2);
    alert("Player 2's time is up!");
  }
}




function pauseTimer(player) {
  if (player === 1) {
    clearInterval(timerInterval1);
    pausedTime1 = player1Time;
  } else if (player === 2) {
    clearInterval(timerInterval2);
    pausedTime2 = player2Time;
  }
}

function resumeTimer(player) {
  if (player === 1 && typeof pausedTime1 !== "undefined") {
    player1Time = pausedTime1;
    timerInterval1 = setInterval(updateTimer1, 1000);
  } else if (player === 2 && typeof pausedTime2 !== "undefined") {
    player2Time = pausedTime2;
    timerInterval2 = setInterval(updateTimer2, 1000);
  }
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}




const startEffect = new Audio("sound/start-effect.mp3");
const moveEffect = new Audio("sound/move-effect.mp3");
const captureEffect = new Audio("sound/capture-effect.mp3");
const checkMateEffect = new Audio("sound/checkmate-effect.mp3");
