import isValidMove from "./chess.js";
import { isCheckmate } from "./chess.js";

document.addEventListener("DOMContentLoaded", () => {
  const board = document.querySelector(".chessboard");

  const pieces = {
    white: {
      king: "&#9812;",
      queen: "&#9813;",
      rook: "&#9814;",
      bishop: "&#9815;",
      knight: "&#9816;",
      pawn: "&#9817;",
    },
    black: {
      king: "&#9818;",
      queen: "&#9819;",
      rook: "&#9820;",
      bishop: "&#9821;",
      knight: "&#9822;",
      pawn: "&#9823;",
    },
  };

  const unicodeToPieceName = {
    "♔": "king",
    "♕": "queen",
    "♖": "rook",
    "♗": "bishop",
    "♘": "knight",
    "♙": "pawn",
    "♚": "king",
    "♛": "queen",
    "♜": "rook",
    "♝": "bishop",
    "♞": "knight",
    "♟": "pawn",
  };

  const ws = new WebSocket("ws://localhost:8080/chessproject-1.0/ws/1");

  ws.onopen = function () {
    console.log("WebSocket connection opened");
  };

  let currentPlayer = "white";
  let selectedPiece = null;
  let isDragging = false;
  let offsetX, offsetY;
  let previousSquare = null;
  let player1Time = 60 * 10;
  let player2Time = 60 * 10;
  let timerInterval1 = setInterval(updateTimer1, 1000);
  let timerInterval2;

  const chessBoard = [
    ["Br", "Bn", "Bb", "Bq", "Bk", "Bb", "Bn", "Br"],
    ["Bp", "Bp", "Bp", "Bp", "Bp", "Bp", "Bp", "Bp"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["Wp", "Wp", "Wp", "Wp", "Wp", "Wp", "Wp", "Wp"],
    ["Wr", "Wn", "Wb", "Wq", "Wk", "Wb", "Wn", "Wr"],
  ];

  const startEffect = new Audio("sound/start-effect.mp3");
  const moveEffect = new Audio("sound/move-effect.mp3");
  const captureEffect = new Audio("sound/capture-effect.mp3");
  const checkMateEffect = new Audio("sound/checkmate-effect.mp3");

  startEffect.play();

  // Function to update the chessboard array when a piece is moved
  function updateChessboardArray(fromRow, fromCol, toRow, toCol) {
    const piece = chessBoard[fromRow][fromCol];
    chessBoard[fromRow][fromCol] = ""; // Clear the previous position
    chessBoard[toRow][toCol] = piece; // Place the piece in the new position

    console.log(chessBoard);
  }

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
  piecesOnBoard.forEach((piece) => {
    piece.addEventListener("mousedown", startDrag);
  });

  //for drag and drop
  board.addEventListener("mouseup", stopDrag);
  board.addEventListener("mouseleave", stopDrag);

  // for click and move the piece
  board.addEventListener("click", selectPiece);

  function switchTurn(isValidMoveMade) {
    
    if (!isValidMoveMade) {
      console.log("No valid move made. Turn continues.");
      return;
    }
    currentPlayer = currentPlayer === "white" ? "black" : "white";
    console.log("Current turn: " + currentPlayer);

    // Pause or resume timers based on current player
    if (currentPlayer === "white") {
      clearInterval(timerInterval2); // Pause black timer
      timerInterval1 = setInterval(updateTimer1, 1000); // Resume white timer
    } else {
      clearInterval(timerInterval1); // Pause white timer
      timerInterval2 = setInterval(updateTimer2, 1000); // Start black timer
    }
    callCheckMate(currentPlayer, chessBoard);
  }

  function callCheckMate(currentPlayer, chessBoard) {
    if (isCheckmate(currentPlayer, chessBoard)) {
      checkMateEffect.play();
      console.log("Checkmate! Game over.");

      if (currentPlayer === "white") {
        displayGameOverMessage("Black Wins!");
      } else {

      displayGameOverMessage("White Wins!");
      }
      return;
    }
  }


  function getPossibleMoves(piece, row, col, chessBoard, currentPlayer) {

    const validMoves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (isValidMove(piece, row, col, r, c, chessBoard, currentPlayer)) {
          validMoves.push({ row: r, col: c });
        }
      }
    }
    return validMoves;
  }

  function selectPiece(event) {
    const clickedSquare = event.target.closest(".square");

    if (!clickedSquare) return;

    // Remove previous highlights
    const highlightedSquares = document.querySelectorAll(".highlighted");
    highlightedSquares.forEach((square) =>
      square.classList.remove("highlighted")
    );

    if (selectedPiece) {
      // Second click: Move the piece if valid
      console.log("Dropped piece on square:", clickedSquare);
      clickMovePiece(clickedSquare);
      selectedPiece = null;
    } else {
      // First click: Select the piece if it belongs to the current player
      const piece = clickedSquare.querySelector(".piece");
      if (piece && piece.classList.contains(currentPlayer)) {
        selectedPiece = piece;
        previousSquare = clickedSquare;

        // Highlight possible moves
        const pieceUni = selectedPiece.innerHTML.trim();
        const pieceName = unicodeToPieceName[pieceUni.normalize()];
        const possibleMoves = getPossibleMoves(
          pieceName,
          parseInt(previousSquare.dataset.row),
          parseInt(previousSquare.dataset.col),
          chessBoard,
          currentPlayer
        );

        possibleMoves.forEach(({ row, col }) => {
          const square = document.querySelector(
            `.square[data-row="${row}"][data-col="${col}"]`
          );
          square.classList.add("highlighted");
        });
      } else {
        // Handle the case when the player clicks on an empty square or opponent's piece
        console.log("You can only move your own pieces.");
      }
    }
  }

  function clickMovePiece(clickedSquare) {
    if (clickedSquare !== previousSquare) {
      const pieceColor = selectedPiece.classList.contains("white")
        ? "white"
        : "black";
      const pieceUni = selectedPiece.innerHTML.trim();
      const piece = unicodeToPieceName[pieceUni.normalize()];

      console.log("Selected piece color:", pieceColor);
      console.log("Current player:", currentPlayer);

      // Check if target square is empty or has opponent's piece (but not your own piece)
      const opponentPiece = clickedSquare.querySelector(".piece");
      if (opponentPiece) {
        console.log("Opponent piece found:", opponentPiece);
        const opponentColor = opponentPiece.classList.contains(
          currentPlayer === "white" ? "black" : "white"
        );
        console.log("Opponent piece color:", opponentColor);
        if (opponentColor) {
          // const opponentPieceName = unicodeToPieceName[opponentPiece.innerHTML.trim().normalize()];
          // console.log("Captured opponent's", opponentPieceName);

          // const capturedPiece = clickedSquare.querySelector(".piece");
          // if (capturedPiece && opponentColor) {  // Check if captured piece exists and is opponent's

          //   clickedSquare.removeChild(capturedPiece);
          // }

          //   clickedSquare.appendChild(selectedPiece);
          // // Update the chessboard array
          // updateChessboardArray(
          //   parseInt(previousSquare.dataset.row),
          //   parseInt(previousSquare.dataset.col),
          //   parseInt(clickedSquare.dataset.row),
          //   parseInt(clickedSquare.dataset.col)
          // );

          // console.log("Moved piece to row:", clickedSquare.dataset.row, "col:", clickedSquare.dataset.col);

          // switchTurn(true); // Switch turn after successful move
          console.log("Drag to capture opponent piece");
        } else {
          // Target square has your own piece - cannot move there
          console.log("Cannot move to a square occupied by your own piece.");
          return;
        }
      } else {
        // The clicked square is empty, check for valid move
        const isValid = isValidMove(
          piece,
          parseInt(previousSquare.dataset.row),
          parseInt(previousSquare.dataset.col),
          parseInt(clickedSquare.dataset.row),
          parseInt(clickedSquare.dataset.col),
          chessBoard,
          currentPlayer
        );
        if (isValid) {
          moveEffect.play();
          clickedSquare.appendChild(selectedPiece);
          updateChessboardArray(
            parseInt(previousSquare.dataset.row),
            parseInt(previousSquare.dataset.col),
            parseInt(clickedSquare.dataset.row),
            parseInt(clickedSquare.dataset.col)
          );
          console.log(
            "Moved piece to row: " +
            clickedSquare.dataset.row +
            " col: " +
            clickedSquare.dataset.col
          );
         
          switchTurn(isValid);
        } else {
          // Change the color of the square to indicate an invalid move
          clickedSquare.style.backgroundColor = "red";
          setTimeout(() => {
            clickedSquare.style.backgroundColor = "";
          }, 1000);
        }
      }

      selectedPiece = null;
      previousSquare = null;
    } else {
      console.log("Cannot move to the same square.");
    }
  }

  function highlightValidMoves(event) {
    // Remove previous highlights
    const highlightedSquares = document.querySelectorAll(".highlighted");
    highlightedSquares.forEach((square) =>
      square.classList.remove("highlighted")
    );

    const hoverSquare = document
      .elementFromPoint(event.clientX, event.clientY)
      .closest(".square");
    if (!hoverSquare) return;

    const pieceUni = selectedPiece.innerHTML.trim();
    const pieceName = unicodeToPieceName[pieceUni.normalize()];

    const possibleMoves = getPossibleMoves(
      pieceName,
      parseInt(previousSquare.dataset.row),
      parseInt(previousSquare.dataset.col),
      chessBoard,
      currentPlayer
    );

    possibleMoves.forEach(({ row, col }) => {
      const square = document.querySelector(
        `.square[data-row="${row}"][data-col="${col}"]`
      );
      square.classList.add("highlighted");
    });
  }

  function startDrag(event) {
    selectedPiece = event.target.closest(".piece");
    if (!selectedPiece) return;

    const pieceColor = selectedPiece.classList.contains("white")
      ? "white"
      : "black";
    if (pieceColor === currentPlayer) {
      isDragging = true;
      selectedPiece.style.zIndex = "1000";
      const rect = selectedPiece.getBoundingClientRect();
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;

      previousSquare = selectedPiece.parentElement;
      document.addEventListener("mousemove", dragPiece);
      document.addEventListener("mousemove", highlightValidMoves); // Add this line
    }
  }

  function dragPiece(event) {
    if (isDragging && selectedPiece) {
      selectedPiece.style.position = "fixed";
      selectedPiece.style.left = `${event.clientX - offsetX}px`;
      selectedPiece.style.top = `${event.clientY - offsetY}px`;
    }
  }
  function stopDrag(event) {
    console.log("stopping");
    if (isDragging && selectedPiece) {
      isDragging = false;

      document.removeEventListener("mousemove", dragPiece);
      document.removeEventListener("mousemove", highlightValidMoves);

      const highlightedSquares = document.querySelectorAll(".highlighted");
      highlightedSquares.forEach((square) =>
        square.classList.remove("highlighted")
      );

      selectedPiece.style.position = "static";

      const targetSquare = document
        .elementFromPoint(event.clientX, event.clientY)
        .closest(".square");
      if (targetSquare) {
        if (targetSquare !== previousSquare) {
          const pieceColor = selectedPiece.classList.contains("white")
            ? "white"
            : "black";
          if (pieceColor === currentPlayer) {
            if (!targetSquare.querySelector(".piece")) {
              const isValid = isValidMove(
                unicodeToPieceName[selectedPiece.innerHTML.trim().normalize()],
                parseInt(previousSquare.dataset.row),
                parseInt(previousSquare.dataset.col),
                parseInt(targetSquare.dataset.row),
                parseInt(targetSquare.dataset.col),

                chessBoard,
                currentPlayer
              );
              if (isValid) {
                moveEffect.play();
                targetSquare.appendChild(selectedPiece);
                updateChessboardArray(
                  parseInt(previousSquare.dataset.row),
                  parseInt(previousSquare.dataset.col),
                  parseInt(targetSquare.dataset.row),
                  parseInt(targetSquare.dataset.col)
                );

                console.log(
                  "Moved piece to row:",
                  targetSquare.dataset.row,
                  "col:",
                  targetSquare.dataset.col
                );
                const fromCol = parseInt(previousSquare.dataset.col);
                const fromRow = 8 - parseInt(previousSquare.dataset.row);
                const toCol = parseInt(targetSquare.dataset.col);
                const toRow = 8 - parseInt(targetSquare.dataset.row);

                // Convert coordinates to algebraic notation (e.g., a1, b2, etc.)
                const from = String.fromCharCode(97 + fromCol) + fromRow;
                const to = String.fromCharCode(97 + toCol) + toRow;

            
                const piece = selectedPiece.innerHTML.trim();
                const move = `${piece}${from} to ${to}`;

                // Update and display the move in the sidebar
                updateMoveList(move);
               
                switchTurn(isValid);
              } else {
                // Change the color of the square to indicate an invalid move
                targetSquare.style.backgroundColor = "red";
                setTimeout(() => {
                  targetSquare.style.backgroundColor = "";
                }, 1000);
              }
            } else {
              // Take the piece of the opponent
              console.log(
                "Opponent's piece found:",
                targetSquare.querySelector(".piece")
              );
              const opponentPiece = targetSquare.querySelector(".piece");
              const opponentPieceColor = opponentPiece.classList.contains(
                "white"
              )
                ? "white"
                : "black";
              const opponentPieceName =
                unicodeToPieceName[opponentPiece.innerHTML.trim().normalize()];

              const isValid = isValidMove(
                unicodeToPieceName[selectedPiece.innerHTML.trim().normalize()],
                parseInt(previousSquare.dataset.row),
                parseInt(previousSquare.dataset.col),
                parseInt(targetSquare.dataset.row),
                parseInt(targetSquare.dataset.col),
                chessBoard,
                currentPlayer
              );

              if (isValid) {
                // Remove the opponent's piece from the board
                captureEffect.play();
                targetSquare.removeChild(opponentPiece);

                // Move the player's piece to the target square
                targetSquare.appendChild(selectedPiece);
                updateChessboardArray(
                  parseInt(previousSquare.dataset.row),
                  parseInt(previousSquare.dataset.col),
                  parseInt(targetSquare.dataset.row),
                  parseInt(targetSquare.dataset.col)
                );

                console.log(
                  "Moved piece to row:",
                  targetSquare.dataset.row,
                  "col:",
                  targetSquare.dataset.col
                );
                console.log(
                  "Captured opponent's",
                  opponentPieceName,
                  "of color",
                  opponentPieceColor
                );

                const fromCol = parseInt(previousSquare.dataset.col);
                const fromRow = 8 - parseInt(previousSquare.dataset.row);
                const toCol = parseInt(targetSquare.dataset.col);
                const toRow = 8 - parseInt(targetSquare.dataset.row);

                // Convert coordinates to algebraic notation (e.g., a1, b2, etc.)
                const from = String.fromCharCode(97 + fromCol) + fromRow;
                const to = String.fromCharCode(97 + toCol) + toRow;

                const piece = selectedPiece.innerHTML.trim();
                const opponentPieceUni = opponentPiece.innerHTML.trim();
                const move = `${piece}${from} captures ${opponentPieceUni}${to}`;

                // Update and display the move in the sidebar
                updateMoveList(move);
               

                switchTurn(true); // Switch turn after successful move
              } else {
                console.log(
                  "Invalid move. Cannot capture opponent's piesdfsdfsace."
                );
                // Change the color of the square to indicate an invalid move
                targetSquare.style.backgroundColor = "red";
                setTimeout(() => {
                  targetSquare.style.backgroundColor = "";
                }, 1000);
              }
            }
          } else {
            console.log("You can only move your own pieces.");
          }
        } else {
          console.log("Cannot move to the same square.");
        }
      } else {
        console.log("Dropped outside the board.");
      }

      selectedPiece = null;
      previousSquare = null;
    }
  }

  // Timer related functions
  function updateTimer1() {
    player1Time--;
    const timer1Display = document.getElementById("white-timer");
    timer1Display.textContent = formatTime(player1Time);
    if (player1Time <= 0) {
      clearInterval(timerInterval1);
      displayGameOverMessage("Black Wins!");
      
    }
  }
  
  function updateTimer2() {
    player2Time--;
    const timer2Display = document.getElementById("black-timer");
    timer2Display.textContent = formatTime(player2Time);
    if (player2Time <= 0) {
      clearInterval(timerInterval2);
      displayGameOverMessage("White Wins!");
    }
  }
  

  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  

  function handleThemeChange(event) {
    const theme = event.target.value;
    const chessboard = document.querySelector(".chessboard");
    chessboard.className = `chessboard ${theme}`;
  }

  let popup = document.getElementById('game-popup');
  let winText = document.getElementById('win');
  let closeBtn = document.getElementById('close-popup');
  let closeBtn2 = document.getElementById('closepopup');

function openPopup() {
  popup.classList.add('game-over-popup');
}

if (closeBtn) {
  closeBtn.addEventListener('click', function() {
    location.reload();
  });
}

if (closeBtn2) { 
  closeBtn2.addEventListener('click', closePopup);
}

function closePopup() {
  popup.classList.remove('game-over-popup');
}

function displayGameOverMessage(message) {
  // Display the game over message
  winText.textContent = message;
  openPopup();

  //stop the timers
  clearInterval(timerInterval1);
  clearInterval(timerInterval2);

  // Remove event listeners to disable further moves
  board.removeEventListener("click", selectPiece);
  board.removeEventListener("mousedown", startDrag);
  document.removeEventListener("mousemove", dragPiece);
  document.removeEventListener("mousemove", highlightValidMoves);
  board.removeEventListener("mouseup", stopDrag);
  board.removeEventListener("mouseleave", stopDrag);
}
function updateMoveList(move) {
  const moveList = document.getElementById("moveList");
  const listItem = document.createElement("li");
  listItem.textContent = move;
  moveList.appendChild(listItem);
}


});