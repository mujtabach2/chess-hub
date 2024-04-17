let popup = document.getElementById("popup");
let rulesPopup = document.getElementById("openRulesPopup");


  
function openPopup() {
  popup.classList.add("open-popup");
  closeRulesPopup();
}

function closePopup() {
  popup.classList.remove("open-popup");

}

function openRulesPopup() {
  rulesPopup.classList.add("open-rules-popup");
  closePopup();
}

function closeRulesPopup() {
  rulesPopup.classList.remove("open-rules-popup");
}

function selectTheme(theme) {
  const chessboard = document.querySelector(".chessboard");
  chessboard.className = `chessboard ${theme}`;
  localStorage.setItem("selectedTheme", theme);
  closePopup();
}

window.onload = function () {
  const storedTheme = localStorage.getItem("selectedTheme");
  const chessboard = document.querySelector(".chessboard");

  if (storedTheme) {
    console.log("Stored theme:", storedTheme);
    chessboard.className = `chessboard ${storedTheme}`;
  }
};