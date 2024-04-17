let popup = document.getElementById("popup");
<<<<<<< HEAD
let rulesPopup = document.getElementById("openRulesPopup");


  
function openPopup() {
  popup.classList.add("open-popup");
  closeRulesPopup();
=======
  
function openPopup() {
  popup.classList.add("open-popup");
>>>>>>> edb3a37dbbe7aee396f80dac2c6f02989e846a4d
}

function closePopup() {
  popup.classList.remove("open-popup");
<<<<<<< HEAD

}

function openRulesPopup() {
  rulesPopup.classList.add("open-rules-popup");
  closePopup();
}

function closeRulesPopup() {
  rulesPopup.classList.remove("open-rules-popup");
=======
>>>>>>> edb3a37dbbe7aee396f80dac2c6f02989e846a4d
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