document.addEventListener("DOMContentLoaded", () => {
  const board = document.querySelector(".chessboard");

  const pieces = {
      white: {
          king: "&#9812;",
          queen: "&#9813;",
          rook: "&#9814;",
          bishop: "&#9815;",
          knight: "&#9816;",
          pawn: "&#9817;"
      },
      black: {
          king: "&#9818;",
          queen: "&#9819;",
          rook: "&#9820;",
          bishop: "&#9821;",
          knight: "&#9822;",
          pawn: "&#9823;"
      }
  };

  let selectedPiece = null;
  let isDragging = false;
  let offsetX, offsetY;

  for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
          const square = document.createElement("div");
          square.classList.add("square");
          square.classList.add((row + col) % 2 === 0 ? "light" : "dark");
          square.dataset.row = row;
          square.dataset.col = col;

          if (row === 1) {
              square.innerHTML = `<div class="piece black">${pieces.black.pawn}</div>`;
          } else if (row === 6) {
              square.innerHTML = `<div class="piece white">${pieces.white.pawn}</div>`;
          } else if (row === 0 || row === 7) {
              let pieceColor = row === 0 ? "black" : "white";
              let piece;
              switch (col) {
                  case 0:
                  case 7:
                      piece = "rook";
                      break;
                  case 1:
                  case 6:
                      piece = "knight";
                      break;
                  case 2:
                  case 5:
                      piece = "bishop";
                      break;
                  case 3:
                      piece = "queen";
                      break;
                  case 4:
                      piece = "king";
                      break;
              }
              square.innerHTML = `<div class="piece ${pieceColor}">${pieces[pieceColor][piece]}</div>`;
          }

          board.appendChild(square);
      }
  }

  const piecesOnBoard = document.querySelectorAll(".piece");
  piecesOnBoard.forEach(piece => {
      piece.addEventListener("mousedown", startDrag);
  });

  const themeSelect = document.getElementById("theme-select");
  themeSelect.addEventListener("change", handleThemeChange);

  //for drag and drop
  board.addEventListener("mouseup", stopDrag);
  board.addEventListener("mouseleave", stopDrag);

  // for click and move the piece
  board.addEventListener("click", clickMovePiece);
  });

  
  function clickMovePiece(event) {
    if (isDragging || !selectedPiece) return;

    const clickedSquare = event.target.closest(".square");
  
    if (clickedSquare) {
      if (!clickedSquare.querySelector(".piece")) {
        clickedSquare.appendChild(selectedPiece);
        console.log("Moved piece to row: " + clickedSquare.dataset.row + " col: " + clickedSquare.dataset.col);
      } else {
        console.log("Cannot move to an occupied square.");
      }
    }
  }
  

function startDrag(event) {
  isDragging = true;
  selectedPiece = event.target;
  selectedPiece.style.zIndex = "1000";

  const rect = selectedPiece.getBoundingClientRect();
  offsetX = event.clientX - rect.left;
  offsetY = event.clientY - rect.top;


  document.addEventListener("mousemove", dragPiece);
}

function dragPiece(event) {
  if (isDragging && selectedPiece) {
      selectedPiece.style.position = "fixed";
      selectedPiece.style.left = `${event.clientX - offsetX}px`;
      selectedPiece.style.top = `${event.clientY - offsetY}px`;
  }
}

function stopDrag(event) {
  if (isDragging && selectedPiece) {
    isDragging = false;


    document.removeEventListener("mousemove", dragPiece);

    selectedPiece.style.position = "static";

    if (event.button === 0) {
      const targetSquare = document.elementFromPoint(event.clientX, event.clientY).closest(".square");
      if (targetSquare) {
        targetSquare.appendChild(selectedPiece);
        console.log("Dropped piece at row: " + targetSquare.dataset.row + " col: " + targetSquare.dataset.col);
      }
    }
  }
}


function handleThemeChange(event) {
  const theme = event.target.value;
  const chessboard = document.querySelector(".chessboard");
  chessboard.className = `chessboard ${theme}`;
}
