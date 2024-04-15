import isValidMove from "./chess.js";
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
    "♟": "pawn"
  };
  let currentPlayer = "white"; // change to player 1 or player 2 later
  let selectedPiece = null;
  let isDragging = false;
  let offsetX, offsetY;
  let previousSquare = null;
  const chessBoard = [
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["R", "N", "B", "Q", "K", "B", "N", "R"]
  ];

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
  piecesOnBoard.forEach(piece => {
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
  }

  function getPossibleMoves(piece, row, col, chessBoard, currentPlayer) {

    const validMoves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (isValidMove(piece, row, col, r, c, null, chessBoard, currentPlayer)) {
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
    highlightedSquares.forEach((square) => square.classList.remove("highlighted"));

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
          const square = document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
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
      const pieceColor = selectedPiece.classList.contains("white") ? "white" : "black";
      const pieceUni = selectedPiece.innerHTML.trim();
      const piece = unicodeToPieceName[pieceUni.normalize()];

      console.log("Selected piece color:", pieceColor);
      console.log("Current player:", currentPlayer);

      // Check if target square is empty or has opponent's piece (but not your own piece)
      const opponentPiece = clickedSquare.querySelector(".piece");
      if (opponentPiece) {
        console.log("Opponent piece found:", opponentPiece);
        const opponentColor = opponentPiece.classList.contains(currentPlayer === "white" ? "black" : "white");
        console.log("Opponent piece color:", opponentColor);
        if (opponentColor) {
          const opponentPieceName = unicodeToPieceName[opponentPiece.innerHTML.trim().normalize()];
          console.log("Captured opponent's", opponentPieceName);

          const capturedPiece = clickedSquare.querySelector(".piece");
          if (capturedPiece && opponentColor) {  // Check if captured piece exists and is opponent's

            clickedSquare.removeChild(capturedPiece);
          }

          clickedSquare.appendChild(selectedPiece);
          // Update the chessboard array
          updateChessboardArray(
            parseInt(previousSquare.dataset.row),
            parseInt(previousSquare.dataset.col),
            parseInt(clickedSquare.dataset.row),
            parseInt(clickedSquare.dataset.col)
          );

          console.log("Moved piece to row:", clickedSquare.dataset.row, "col:", clickedSquare.dataset.col);


          switchTurn(true); // Switch turn after successful move
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
          null, // assuming no castling for click move
          chessBoard,
          currentPlayer
        );
        if (isValid) {
          clickedSquare.appendChild(selectedPiece);
          updateChessboardArray(
            parseInt(previousSquare.dataset.row),
            parseInt(previousSquare.dataset.col),
            parseInt(clickedSquare.dataset.row),
            parseInt(clickedSquare.dataset.col)
          );
          console.log("Moved piece to row: " + clickedSquare.dataset.row + " col: " + clickedSquare.dataset.col);
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
    highlightedSquares.forEach((square) => square.classList.remove("highlighted"));

    const hoverSquare = document.elementFromPoint(event.clientX, event.clientY).closest(".square");
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
      const square = document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
      square.classList.add("highlighted");
    });
  }



  function startDrag(event) {
    selectedPiece = event.target.closest(".piece");
    if (!selectedPiece) return;

    const pieceColor = selectedPiece.classList.contains("white") ? "white" : "black";
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
      highlightedSquares.forEach((square) => square.classList.remove("highlighted"));


      selectedPiece.style.position = "static";

      const targetSquare = document.elementFromPoint(event.clientX, event.clientY).closest(".square");
      if (targetSquare) {
        if (targetSquare !== previousSquare) {
          const pieceColor = selectedPiece.classList.contains("white") ? "white" : "black";
          if (pieceColor === currentPlayer) {
            if (!targetSquare.querySelector(".piece")) {
              const isValid = isValidMove(
                unicodeToPieceName[selectedPiece.innerHTML.trim().normalize()],
                parseInt(previousSquare.dataset.row),
                parseInt(previousSquare.dataset.col),
                parseInt(targetSquare.dataset.row),
                parseInt(targetSquare.dataset.col),
                null,
                chessBoard,
                currentPlayer
              );
              if (isValid) {
                targetSquare.appendChild(selectedPiece);
                updateChessboardArray(
                  parseInt(previousSquare.dataset.row),
                  parseInt(previousSquare.dataset.col),
                  parseInt(targetSquare.dataset.row),
                  parseInt(targetSquare.dataset.col),
                );


                console.log("Moved piece to row:", targetSquare.dataset.row, "col:", targetSquare.dataset.col);
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
              const opponentPiece = targetSquare.querySelector(".piece");
              const opponentPieceColor = opponentPiece.classList.contains("white") ? "white" : "black";
              const opponentPieceName = unicodeToPieceName[opponentPiece.innerHTML.trim().normalize()];

              const isValid = isValidMove(
                unicodeToPieceName[selectedPiece.innerHTML.trim().normalize()],
                parseInt(previousSquare.dataset.row),
                parseInt(previousSquare.dataset.col),
                parseInt(targetSquare.dataset.row),
                parseInt(targetSquare.dataset.col),
                opponentPieceName,
                chessBoard,
                currentPlayer
              );
              if (isValid) {

                // Remove the opponent's piece from the board
                targetSquare.removeChild(opponentPiece);

                // Move the player's piece to the target square
                targetSquare.appendChild(selectedPiece);
                updateChessboardArray(
                  parseInt(previousSquare.dataset.row),
                  parseInt(previousSquare.dataset.col),
                  parseInt(targetSquare.dataset.row),
                  parseInt(targetSquare.dataset.col)
                );

                console.log("Moved piece to row:", targetSquare.dataset.row, "col:", targetSquare.dataset.col);
                console.log("Captured opponent's", opponentPieceName, "of color", opponentPieceColor);

                switchTurn(true); // Switch turn after successful move
              }
              else {
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

});