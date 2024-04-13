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
    let currentPlayer = "white"; // Start with white player
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
  
    const themeSelect = document.getElementById("theme-select");
    themeSelect.addEventListener("change", handleThemeChange);
  
    //for drag and drop
    board.addEventListener("mouseup", stopDrag);
    board.addEventListener("mouseleave", stopDrag);
  
    // for click and move the piece
    board.addEventListener("click", selectPiece);
  
    function switchTurn() {
        currentPlayer = currentPlayer === "white" ? "black" : "white";
        console.log("Current turn: " + currentPlayer);
    }
  
    function selectPiece(event) {
        const clickedSquare = event.target.closest(".square");
  
        if (!clickedSquare) return;
  
        if (selectedPiece) {
            // Second click: Move the piece if valid
            clickMovePiece(clickedSquare);
        } else {
            // First click: Select the piece if it belongs to the current player
            const piece = clickedSquare.querySelector(".piece");
            if (piece && piece.classList.contains(currentPlayer)) {
                selectedPiece = piece;
                previousSquare = clickedSquare;
            }
        }
    }
  
    function clickMovePiece(clickedSquare) {
        if (clickedSquare !== previousSquare) { // Check if it's not the same square
            const pieceColor = selectedPiece.classList.contains("white") ? "white" : "black";
            const pieceUni = selectedPiece.innerHTML.trim();
            console.log("Piece Unicode:", pieceUni);
    
            console.log("Keys in unicodeToPieceName:", Object.keys(unicodeToPieceName));
            const piece = unicodeToPieceName[pieceUni.normalize()];
            console.log("Piece:", piece);
            if (pieceColor === currentPlayer) {
                if (!clickedSquare.querySelector(".piece")) {
                    // Validate the move
                    const isValid = isValidMove(
                        piece,
                        parseInt(previousSquare.dataset.row),
                        parseInt(previousSquare.dataset.col),
                        parseInt(clickedSquare.dataset.row),
                        parseInt(clickedSquare.dataset.col),
                        null, // Provide appropriate value for lastMove if needed
                        chessBoard,
                        currentPlayer
                    );
                    if (isValid) {
                        // Perform the move if it's valid
                        clickedSquare.appendChild(selectedPiece);
                        updateChessboardArray(
                            parseInt(previousSquare.dataset.row),
                            parseInt(previousSquare.dataset.col),
                            parseInt(clickedSquare.dataset.row),
                            parseInt(clickedSquare.dataset.col)
                        );
                        console.log("Moved piece to row: " + clickedSquare.dataset.row + " col: " + clickedSquare.dataset.col);
                        switchTurn();
                    } else {
                        console.log("Invalid move.");
                    }
                } else {
                    console.log("Cannot move to an occupied square.");
                }
            } else {
                console.log("You can only move your own pieces.");
            }
            selectedPiece = null;
            previousSquare = null;
        } else {
            console.log("Cannot move to the same square.");
        }
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
  
            document.addEventListener("mousemove", dragPiece);
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
        if (isDragging && selectedPiece) {
            isDragging = false;
  
            document.removeEventListener("mousemove", dragPiece);
  
            selectedPiece.style.position = "static";
  
            if (event.button === 0) {
                const targetSquare = document.elementFromPoint(event.clientX, event.clientY).closest(".square");
                if (targetSquare) {
                    clickMovePiece(targetSquare);
                }
            }
        }
    }
  
    function handleThemeChange(event) {
        const theme = event.target.value;
        const chessboard = document.querySelector(".chessboard");
        chessboard.className = `chessboard ${theme}`;
    }
  });