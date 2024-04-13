export default function isValidMove(piece, fromRow, fromCol, toRow, toCol, lastMove, board, currentPlayer) {
    // Check if the move puts the opponent's king in check
    const opponentColor = currentPlayer === 'white' ? 'black' : 'white';
    // const opponentKingSquare = findKingSquare(opponentColor, board);
    // const isInCheck = isSquareAttacked(opponentKingSquare.row, opponentKingSquare.col, opponentColor, board);

    // // Check if the move is valid
    // // If it puts the opponent's king in check, it's an invalid move
    // if (isInCheck) {
    //     // Simulate the move and check if the opponent's king is still in check
    //     const tempBoard = simulateMove(piece, fromRow, fromCol, toRow, toCol, board);
    //     const isStillInCheck = isSquareAttacked(opponentKingSquare.row, opponentKingSquare.col, opponentColor, tempBoard);

    //     if (isStillInCheck) {
    //         // Move results in the opponent's king still being in check
    //         return false;
    //     }
    // }

    switch (piece) {
        case "king":
            // King can move one square in any direction or perform castling
            return (Math.abs(toRow - fromRow) <= 1 && Math.abs(toCol - fromCol) <= 1) ||
                   (canCastle(piece, fromRow, fromCol, toRow, toCol, board));
        case "queen":
            // Queen can move any number of squares diagonally, horizontally, or vertically
            return (Math.abs(toRow - fromRow) === Math.abs(toCol - fromCol)) || (fromRow === toRow || fromCol === toCol);
        case "rook":
            // Rook can move any number of squares horizontally or vertically
            return fromRow === toRow || fromCol === toCol;
        case "bishop":
            // Bishop can move any number of squares diagonally
            return Math.abs(toRow - fromRow) === Math.abs(toCol - fromCol);
        case "knight":
            // Knight can move in an L-shape: two squares in one direction and one square in a perpendicular direction
            return (Math.abs(toRow - fromRow) === 2 && Math.abs(toCol - fromCol) === 1) || 
                   (Math.abs(toRow - fromRow) === 1 && Math.abs(toCol - fromCol) === 2);
        case "pawn":
            // Pawn moves differently based on color and direction
            if (currentPlayer === "white") {
                return (fromCol === toCol && toRow === fromRow - 1) || // Can move one square forward
                       (fromCol === toCol && fromRow === 6 && toRow === 4) || // Can move two squares forward on initial move
                       (lastMove && lastMove.piece === "pawn" && lastMove.fromRow === 6 && lastMove.toRow === 4 && // En passant
                        toCol === lastMove.toCol && Math.abs(toRow - fromRow) === 1 && Math.abs(toCol - fromCol) === 1);
            } else {
                return (fromCol === toCol && toRow === fromRow + 1) || // Can move one square forward
                       (fromCol === toCol && fromRow === 1 && toRow === 3) || // Can move two squares forward on initial move
                       (lastMove && lastMove.piece === "pawn" && lastMove.fromRow === 1 && lastMove.toRow === 3 && // En passant
                        toCol === lastMove.toCol && Math.abs(toRow - fromRow) === 1 && Math.abs(toCol - fromCol) === 1);
            }
        default:
            return false;
    }
}

function findKingSquare(color, board) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = board[row][col];
            if (square.piece && square.piece.type === 'king' && square.piece.color === color) {
                return { row, col };
            }
        }
    }
}

function isSquareAttacked(row, col, color, board) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c].piece;
            if (piece && piece.color !== color && isValidMove(piece.type, { dataset: { row: r, col: c } }, { dataset: { row, col } }, null, board, color)) {
                return true;
            }
        }
    }
    return false;
}
function canCastle(king, fromSquare, toSquare, board) {
const fromRow = parseInt(fromSquare.dataset.row);
const fromCol = parseInt(fromSquare.dataset.col);
const toRow = parseInt(toSquare.dataset.row);
const toCol = parseInt(toSquare.dataset.col);

// Check if the king is in its initial position
if (king.classList.contains("white")) {
    if (fromRow !== 7 || fromCol !== 4) return false; // King is not in initial position
} else {
    if (fromRow !== 0 || fromCol !== 4) return false; // King is not in initial position
}

// Check if the destination square is two squares away horizontally
if (Math.abs(toCol - fromCol) !== 2) return false;

// Check if there are any pieces between the king and the rook
const rookCol = toCol === 6 ? 7 : 0; // Determine the column of the rook
const rookSquare = board[fromRow][rookCol];
if (rookSquare.piece === null || rookSquare.piece.type !== "rook") return false;

// Check if any square between the king and the rook is occupied
if (toCol === 6) {
    for (let col = fromCol + 1; col < toCol; col++) {
        if (board[fromRow][col].piece !== null) return false;
    }
} else {
    for (let col = fromCol - 1; col > toCol; col--) {
        if (board[fromRow][col].piece !== null) return false;
    }
}

// Check if the king is not in check
// (This requires checking if the king would move through or end up in a square attacked by an opponent's piece)

// Check if the rook is not in check
// (This requires checking if the rook would move through or end up in a square attacked by an opponent's piece)

// Return true if all conditions are met for castling
return true;
}



