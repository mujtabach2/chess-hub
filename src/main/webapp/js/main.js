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
      piece.addEventListener("mouseup", stopDrag);
    });
  
    const themeSelect = document.getElementById("theme-select");
    themeSelect.addEventListener("change", handleThemeChange);
  
    board.addEventListener("mouseup", dropPiece);
  
  });
  
  function startDrag(event) {
    selectedPiece = event.target;
    isDragging = true;
  
    const offsetX = event.clientX - selectedPiece.getBoundingClientRect().left;
    const offsetY = event.clientY - selectedPiece.getBoundingClientRect().top;
  
    window.addEventListener("mousemove", dragPiece);
  
    function dragPiece(event) {
      if (isDragging) {
        selectedPiece.style.position = "absolute";
        selectedPiece.style.left = `${event.clientX - offsetX}px`;
        selectedPiece.style.top = `${event.clientY - offsetY}px`;
      }
    }
  }
  
  function stopDrag(event) {
    isDragging = false;
    dropPiece(event);  
  }
  
  function dropPiece(event) {
    if (selectedPiece) {
      const targetSquare = event.target.closest(".square");
      if (targetSquare) {
        const targetRect = targetSquare.getBoundingClientRect();
        selectedPiece.style.position = "absolute";
        selectedPiece.style.left = `${targetRect.left + targetRect.width / 2 - selectedPiece.offsetWidth / 2}px`;
        selectedPiece.style.top = `${targetRect.top + targetRect.height / 2 - selectedPiece.offsetHeight / 2}px`;
  
        targetSquare.appendChild(selectedPiece);
      }
    }
  }
  
  function handleThemeChange(event) {
    const theme = event.target.value;
    const chessboard = document.querySelector(".chessboard");
    chessboard.className = `chessboard ${theme}`;
  }
  