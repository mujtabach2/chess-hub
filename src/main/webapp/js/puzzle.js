import isValidMove from "./chess.js";
import { Chess } from './chessImport.js'

// an empty constructor defaults the starting position
let chess = new Chess()
let solutions = []
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

        let currentPlayer = "white";
        let selectedPiece = null;
        let isDragging = false;
        let offsetX, offsetY;
        let previousSquare = null;

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
        function updateChessboardFromPGN(pgn) {
// Initialize an empty 8x8 chessboard represented by a 2D array
            let chessboard = new Array(8).fill(null).map(() => new Array(8).fill(''));

// Map letters to indices for chessboard columns
            let columnMap = {'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7};

// Split PGN by space to get individual moves
            let moves = pgn.split(/\s+/);

// Loop through each move in the PGN
            for (let move of moves) {
                // Check if the move represents a piece placement
                if (move[0].match(/[KQRBNPkqrbnp]/)) {
                    let piece = move[0];  // Get the piece symbol
                    let square = move.slice(1, 3);  // Get the square where the piece is placed
                    // Convert square notation to array indices
                    let col = columnMap[square[0]];
                    let row = 8 - parseInt(square[1]);
                    // Logging for debugging
                    console.log(`Piece: ${piece}, Square: ${square}, Row: ${row}, Col: ${col}`);
                    // Place the piece on the chessboard
                    chessboard[row][col] = piece;
                }
                // If the move is a capture, handle it
                else if (move.includes('x')) {
                    let piece = move[0];  // Get the moving piece
                    let targetSquare = move.slice(-2);  // Get the square where the capture happens
                    // Convert square notation to array indices
                    let col = columnMap[targetSquare[0]];
                    let row = 8 - parseInt(targetSquare[1]);
                    // Place the piece on the target square
                    chessboard[row][col] = piece;
                }
                // If the move is a pawn move, handle it
                else if (move[0].match(/[abcdefgh]/)) {
                    let targetSquare = move.slice(-2);  // Get the square where the pawn moves
                    // Convert square notation to array indices
                    let col = columnMap[targetSquare[0]];
                    let row = 8 - parseInt(targetSquare[1]);
                    // Place the pawn on the target square
                    chessboard[row][col] = 'P';
                }
            }
            console.log(chessboard);
            return chessboard;
        }

        // Function to update the board display based on the chessboard array

        const piecesOnBoard = document.querySelectorAll(".piece");
        piecesOnBoard.forEach((piece) => {
            piece.addEventListener("mousedown", startDrag);
        });

        //for drag and drop
        board.addEventListener("mouseup", stopDrag);
        board.addEventListener("mouseleave", stopDrag);

        // for click and move the piece
        board.addEventListener("click", selectPiece);

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

                        validateSolutionMove(solutions, previousSquare.dataset.row , coltoLetter(previousSquare.dataset.col),clickedSquare.dataset.row, coltoLetter(clickedSquare.dataset.col))

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
            console.log(chessBoard)
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
                                    validateSolutionMove(solutions, previousSquare.dataset.row ,coltoLetter(previousSquare.dataset.col) ,targetSquare.dataset.row ,coltoLetter(targetSquare.dataset.col))

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
                                    validateSolutionMove(solutions, previousSquare.dataset.row ,coltoLetter(previousSquare.dataset.col) ,targetSquare.dataset.row ,coltoLetter(targetSquare.dataset.col))
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

            // Remove event listeners to disable further moves
            board.removeEventListener("click", selectPiece);
            board.removeEventListener("mousedown", startDrag);
            document.removeEventListener("mousemove", dragPiece);
            document.removeEventListener("mousemove", highlightValidMoves);
            board.removeEventListener("mouseup", stopDrag);
            board.removeEventListener("mouseleave", stopDrag);
        }

        callApiForPuzzle()
        function callApiForPuzzle() {
            fetch("https://lichess.org/api/puzzle/daily")
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch puzzle");
                    }
                    return response.json();
                })
                .then(data => {
                    if (data && data.game && data.game.pgn) {
                        const pgn = data.game.pgn;
                        console.log("Fetched puzzle:", pgn);
                        const fen = pgnToFen(pgn);
                        console.log("FEN representation:", fen);
                        const updatedBoard = fenTo2DArray(fen);
                        updateBoardDisplay(updatedBoard);  // Update visual representation of the board
                        solutions = data.puzzle.solution
                    } else {
                        throw new Error("Invalid puzzle data received");
                    }
                })
                .catch(error => {
                    console.error("Error fetching puzzle:", error);
                });
        }

        function fenTo2DArray(fen) {
            const turnDisplay = document.getElementById("turn-display");
            const ranks = fen.split(' ')[0].split('/');
            const board = [];
            const lastChar = fen[fen.length - 10];

            if (lastChar === 'w'){
                currentPlayer = 'white';
            } else {
                currentPlayer = 'black';
            }
            turnDisplay.textContent = `Current Turn: ${currentPlayer}`;

            for (let rank of ranks) {
                const row = [];
                for (let char of rank) {
                    if (isNaN(char)) {
                        row.push(char);
                    } else {
                        for (let i = 0; i < parseInt(char); i++) {
                            row.push('');
                        }
                    }
                }
                board.push(row);
            }

            console.log(board);
            return board;
        }


        const pieceNames = {
            'K': 'king',
            'Q': 'queen',
            'R': 'rook',
            'B': 'bishop',
            'N': 'knight',
            'P': 'pawn'
        };

        function updateBoardDisplay(board) {
            const squares = document.querySelectorAll(".square");  // Get all squares

            // Remove existing piece elements and event listeners
            squares.forEach(square => {
                const pieceElement = square.querySelector(".piece");
                if (pieceElement) {
                    pieceElement.remove(); // Remove existing piece element
                    pieceElement.removeEventListener("mousedown", startDrag); // Remove event listener
                }
            });

            // Update board display
            for (let row = 7; row >= 0; row--) {
                for (let col = 0; col < 8; col++) {
                    const square = squares[row * 8 + col]; // Calculate index based on row and col
                    const piece = board[row][col];
                    chessBoard[row][col] = piece;

                    if (piece) {
                        const pieceColor = piece === piece.toUpperCase() ? "white" : "black";
                        const pieceType = piece.toUpperCase();
                        const pieceName = pieceNames[pieceType];
                        square.innerHTML = `<div class="piece ${pieceColor}">${pieces[pieceColor][pieceName]}</div>`;

                        // Attach event listener to newly added pieces
                        const newPieceElement = square.querySelector(".piece");
                        newPieceElement.addEventListener("mousedown", startDrag);

                    } else {
                        square.innerHTML = ""; // Clear square if empty
                    }
                }
            }
        }

        const colToLetterMap = {
            0: 'a',
            1: 'b',
            2: 'c',
            3: 'd',
            4: 'e',
            5: 'f',
            6: 'g',
            7: 'h',

        };

        function coltoLetter(colNumber) {
            colNumber = parseInt(colNumber) ;
            if (colNumber < 0 || colNumber > 26) {
                throw new Error("Invalid column number. Must be between 1 and 26.");
            }
            return colToLetterMap[colNumber];
        }
        function pgnToFen(pgn) {
            chess.loadPgn(pgn);
            console.log(chess.ascii());
            return chess.fen();
        }
        function validateSolutionMove(solutions,fromRow, fromCol, toRow, toCol) {

            console.log(solutions)


            fromRow = 8 - parseInt(fromRow);
            toRow = 8 - parseInt(toRow);


            const playerMoves = `${fromCol}${fromRow}${toCol}${toRow}`;
            console.log(playerMoves)


            if (solutions.includes(playerMoves)) {
                displayGameOverMessage("You solved the puzzle!");
            }
            else {
                displayGameOverMessage("Incorrect move. Try again!");
            }
        }
    }
);