import isValidMove from "./chess.js";
import { isCheckmate } from "./chess.js";
let ws;

document.addEventListener("DOMContentLoaded", () => {
  // Variables
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

  let code = "1";
  let currentPlayer = "white";
  let clientPlayer = null;
  let selectedPiece = null;
  let isDragging = false;
  let offsetX, offsetY;
  let previousSquare = null;
  let isCaptured = false;
  let player1Time = 60 * 10;
  let player2Time = 60 * 10;
  let timerInterval1 = setInterval(updateTimer1, 1000);
  let timerInterval2;

  let chessBoard = [
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

  // Connect to the WebSocket server
  ws = new WebSocket("ws://localhost:8080/chessproject-1.0-SNAPSHOT/ws/"+code);

  ws.onopen = function () {
    console.log("The WebSocket connection has been opened");
  };

  ws.onmessage = function (event) {
    const data = JSON.parse(event.data);
    if (data.type === "move") {
        chessBoard = data.state;
        updateChessboardArray(data.fromRow, data.fromCol, data.toRow, data.toCol);
        updateMoveList(data.selectedPiece, data.move);
        switchTurn(true); // Switch turn after successful move
    } else if (data.type === "colourAssignment") {
      clientPlayer = data.color;
      console.log("You're " + clientPlayer+"!");
    }
  };

  // Function to update the chessboard array when a piece is moved
  function updateChessboardArray(fromRow, fromCol, toRow, toCol) {
    const piece = chessBoard[fromRow][fromCol];
    
    // Update the chessBoard array to move the piece
    chessBoard[fromRow][fromCol] = ""; // Clear the previous position
    chessBoard[toRow][toCol] = piece; // Place the piece in the new position
  
    // Check if a piece is being captured
    const toSquare = document.querySelector(`.square[data-row="${toRow}"][data-col="${toCol}"]`);
    if (toSquare.hasChildNodes()) { //sometimes, 2 pieces can occupy the same square, remove captured piece
      const capturedPieceElement = toSquare.querySelector(".piece");
      toSquare.removeChild(capturedPieceElement);
    }
  
    // Update the UI
    const fromSquare = document.querySelector(`.square[data-row="${fromRow}"][data-col="${fromCol}"]`);
    const pieceElement = fromSquare.querySelector(".piece");
    fromSquare.removeChild(pieceElement);
    toSquare.appendChild(pieceElement);
  }

  // Create the chessboard
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

  //switch turn
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


  // Function to get all possible moves for a piece
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

  // Function to select piece
  function selectPiece(event) {
    const clickedSquare = event.target.closest(".square");

    if (!clickedSquare) return;

    // Remove previous highlights
    const highlightedSquares = document.querySelectorAll(".highlighted");
    highlightedSquares.forEach((square) =>
      square.classList.remove("highlighted")
    );

    if(clientPlayer !== currentPlayer) {
      console.log("It's not your turn!");
      return;
    }

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

  // Function to move the piece when clicked
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
          console.log("Drag to capture opponent piece");
        } else {
          // Target square has your own piece - cannot move there
          console.log("Cannot move to a square occupied by your own piece.");
          switchTurn(true);
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
              sendMove(currentPlayer, selectedPiece, chessBoard, parseInt(previousSquare.dataset.row), 
                parseInt(previousSquare.dataset.col), parseInt(clickedSquare.dataset.row), 
                parseInt(clickedSquare.dataset.col));
              switchTurn(true);
            } else {
          // Change the color of the square to indicate an invalid move
          clickedSquare.style.backgroundColor = "red";
          setTimeout(() => {
            clickedSquare.style.backgroundColor = "";
          }, 1000);
          switchTurn(true);
        }
      }

      selectedPiece = null;
      previousSquare = null;
    } else {
      console.log("Cannot move to the same square.");
      switchTurn(true);
    }
  }

  // Function to highlight valid moves when dragging a piece
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

  // Function to start dragging a piece
  function startDrag(event) {
    selectedPiece = event.target.closest(".piece");
    if (!selectedPiece) return;

    if(clientPlayer !== currentPlayer) {
      console.log("It's not your turn!");
      return;
    }

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

  // Function to drag the piece
  function dragPiece(event) {
    if (isDragging && selectedPiece) {
      selectedPiece.style.position = "fixed";
      selectedPiece.style.left = `${event.clientX - offsetX}px`;
      selectedPiece.style.top = `${event.clientY - offsetY}px`;
    }
  }

  // Function to stop dragging the piece
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
                sendMove(currentPlayer, selectedPiece, chessBoard, 
                  parseInt(previousSquare.dataset.row), parseInt(previousSquare.dataset.col),
                  parseInt(targetSquare.dataset.row), parseInt(targetSquare.dataset.col));
                  switchTurn(true);
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
                // Update the chessBoard array to remove the captured piece
                console.log(chessBoard);
                const toRow = parseInt(targetSquare.dataset.row);
                const toCol = parseInt(targetSquare.dataset.col);
                chessBoard[toRow][toCol] = "";

                // Remove the opponent's piece from the board
                captureEffect.play();
                const opponentPiece = targetSquare.firstChild;
                targetSquare.removeChild(opponentPiece);
                isCaptured = true;
                
                // Move the player's piece to the target square
                targetSquare.appendChild(selectedPiece);        
                
                sendMove(currentPlayer, selectedPiece, chessBoard, 
                  parseInt(previousSquare.dataset.row), parseInt(previousSquare.dataset.col),
                  toRow, toCol);
                switchTurn(true);
                isCaptured = false;
              } else {
                console.log(
                  "Invalid move. Cannot capture opponent's piece."
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
  
  // Timer for player 2 (black)
  function updateTimer2() {
    player2Time--;
    const timer2Display = document.getElementById("black-timer");
    timer2Display.textContent = formatTime(player2Time);
    if (player2Time <= 0) {
      clearInterval(timerInterval2);
      displayGameOverMessage("White Wins!");
    }
  }
  
 // Function to format the time in MM:SS format
  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  
  // Theme switcher
  function handleThemeChange(event) {
    const theme = event.target.value;
    const chessboard = document.querySelector(".chessboard");
    chessboard.className = `chessboard ${theme}`;
  }

  let popup = document.getElementById('game-popup');
  let winText = document.getElementById('win');
  let closeBtn = document.getElementById('close-popup');
  let closeBtn2 = document.getElementById('closepopup');

  // Function to open the game over popup
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

// Function to close the game over popup
function closePopup() {
  popup.classList.remove('game-over-popup');
}

// Function to display the game over message
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
    //Sends the player and the move in standard chess notation to the server
    function sendMove(player, selectedPiece, chessBoard, fromRow, fromCol, toRow, toCol) {
      const data = {
          type: "move",
          player: player,
          move: convertToStandardNotation(selectedPiece, fromCol, toRow, toCol), // Convert the move to standard chess notation
          state : chessBoard,
          selectedPiece: selectedPiece.innerHTML.trim(),
          fromRow: fromRow,
          fromCol: fromCol,
          toRow: toRow,
          toCol: toCol
      };

      updateMoveList(selectedPiece.innerHTML.trim(), data.move);

      ws.send(JSON.stringify(data));
    }

    //Converts the column number to a letter
    function convertColumn(col) {
      return String.fromCharCode(97 + col);
    }

    //Converts the move to standard chess notation i.e Ke2, Nf3, etc. https://www.chess.com/terms/chess-notation
    function convertToStandardNotation(selectedPiece, fromCol, toRow, toCol) {
      let pieceName = "";
      let move = "";

      // Get the piece name from the unicode character
      if (selectedPiece) {
        // Check if selectedPiece contains HTML content
        if (selectedPiece.innerHTML) {
            // Use trim() after ensuring that innerHTML is not null or undefined
            const pieceUni = selectedPiece.innerHTML.trim();
            pieceName = unicodeToPieceName[pieceUni.normalize()];
        } else {
          // Handle the case where selectedPiece does not contain HTML content
            console.error("Selected piece does not contain HTML content.");
        }
      } else {
          console.error("No piece selected.");
      } 

      //conditional for pieces
      if (pieceName === "king") {
        move = "K";
      } else if (pieceName === "queen") {
        move = "Q";
      } else if (pieceName === "rook") {
        move = "R";
      } else if (pieceName === "bishop") {
        move = "B";
      } else if (pieceName === "knight") {
        move = "N";
      }

      //Now check if the move is a capture
      if (isCaptured === true && pieceName === "pawn") {
        move += convertColumn(fromCol)+"x";
      } else if (isCaptured === true){
        move += "x";
      }

      //Finally add destination square to the move
      move += convertColumn(toCol) + (8 - toRow);
      return move;
    }

    // Function to update the move list
    function updateMoveList(piece, move) {
      const moveList = document.getElementById("moveList");
      const listItem = document.createElement("li");
      listItem.textContent = piece + ": " + move;
      moveList.appendChild(listItem);
    }
  });