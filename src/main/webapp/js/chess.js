export default function isValidMove(piece, fromRow, fromCol, toRow, toCol, board, currentPlayer) {
  
    const fromPiece = board[fromRow][fromCol];
    const toPiece = board[toRow][toCol];

    if (fromPiece[0] === toPiece[0]) {
        return false;
    }

    
  
    switch (piece) {
        case "pawn":
            // Check if the pawn is moving forward
            const forwardDirection = currentPlayer === "white" ? -1 : 1;
            if (fromCol === toCol) {
                // Moving forward
                if ((fromRow + forwardDirection === toRow && !board[toRow][toCol]) ||
                    (fromRow + 2 * forwardDirection === toRow && fromRow === (currentPlayer === "white" ? 6 : 1) &&
                        !board[fromRow + forwardDirection][toCol] && !board[toRow][toCol])) {
                    return true;
                }
                // Check if the pawn is capturing diagonally
                if (Math.abs(toCol - fromCol) === 1 && fromRow + forwardDirection === toRow &&
                    board[toRow][toCol] && board[toRow][toCol][0] !== currentPlayer[0]) {
                    return true;
                }
            }
            // Implement special cases like en passant and pawn promotion if necessary.
            break;
        case "rook":
            // Rook can move horizontally or vertically
            if (fromRow === toRow || fromCol === toCol) {
                // Check if there are any pieces blocking its path
                if (fromRow === toRow) { // Horizontal move
                    const minCol = Math.min(fromCol, toCol);
                    const maxCol = Math.max(fromCol, toCol);
                    for (let c = minCol + 1; c < maxCol; c++) {
                        if (board[fromRow][c]) return false; // Piece blocking the path
                    }
                } else { // Vertical move
                    const minRow = Math.min(fromRow, toRow);
                    const maxRow = Math.max(fromRow, toRow);
                    for (let r = minRow + 1; r < maxRow; r++) {
                        if (board[r][fromCol]) return false; // Piece blocking the path
                    }
                }
                // Check if the destination square is empty or has an opponent's piece
                if (!board[toRow][toCol] || board[toRow][toCol][0] !== currentPlayer[0]) {
                    return true;
                }
            }
            break;
        case "knight":
            // Knight moves in an L shape (2 squares in one direction and 1 square in a perpendicular direction)
            const rowDiff = Math.abs(toRow - fromRow);
            const colDiff = Math.abs(toCol - fromCol);
            if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
                // Check if the destination square is empty or has an opponent's piece
                if (!board[toRow][toCol] || board[toRow][toCol][0] !== currentPlayer[0]) {
                    return true;
                }
            }
            break;
        case "bishop":
            // Bishop can move diagonally
            if (Math.abs(toRow - fromRow) === Math.abs(toCol - fromCol)) {
                // Check if there are any pieces blocking its path
                const rowIncrement = toRow > fromRow ? 1 : -1;
                const colIncrement = toCol > fromCol ? 1 : -1;
                for (let i = 1; i < Math.abs(toRow - fromRow); i++) {
                    if (board[fromRow + i * rowIncrement][fromCol + i * colIncrement]) return false; // Piece blocking the path
                }
                // Check if the destination square is empty or has an opponent's piece
                if (!board[toRow][toCol] || board[toRow][toCol][0] !== currentPlayer[0]) {
                    return true;
                }
            }
            break;
        case "queen":
            // Queen can move horizontally, vertically, or diagonally
            if ((fromRow === toRow || fromCol === toCol) || Math.abs(toRow - fromRow) === Math.abs(toCol - fromCol)) {
                // Check if there are any pieces blocking its path
                if (fromRow === toRow || fromCol === toCol) { // Horizontal or vertical move
                    if (fromRow === toRow) { // Horizontal move
                        const minCol = Math.min(fromCol, toCol);
                        const maxCol = Math.max(fromCol, toCol);
                        for (let c = minCol + 1; c < maxCol; c++) {
                            if (board[fromRow][c]) return false; // Piece blocking the path
                        }
                    } else { // Vertical move
                        const minRow = Math.min(fromRow, toRow);
                        const maxRow = Math.max(fromRow, toRow);
                        for (let r = minRow + 1; r < maxRow; r++) {
                            if (board[r][fromCol]) return false; // Piece blocking the path
                        }
                    }
                } else { // Diagonal move
                    const rowIncrement = toRow > fromRow ? 1 : -1;
                    const colIncrement = toCol > fromCol ? 1 : -1;
                    for (let i = 1; i < Math.abs(toRow - fromRow); i++) {
                        if (board[fromRow + i * rowIncrement][fromCol + i * colIncrement]) return false; // Piece blocking the path
                    }
                }
                // Check if the destination square is empty or has an opponent's piece
                if (!board[toRow][toCol] || board[toRow][toCol][0] !== currentPlayer[0]) {
                    return true;
                }
            }
            break;
        case "king":
            // King can move one square in any direction
            if (Math.abs(toRow - fromRow) <= 1 && Math.abs(toCol - fromCol) <= 1) {
                // Check if the destination square is empty or has an opponent's piece
                if (!board[toRow][toCol] || board[toRow][toCol][0] !== currentPlayer[0]) {
                    return true;
                }
            }
    
            break;
        default:
          
            return false;
    }

  
    return false;
}

function hasKingThreat(currentPlayer, board) {
    // Find the position of the king
    let kingPosition = null;
    const kingPiece = currentPlayer[0].toUpperCase() + 'k';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece === kingPiece) {
                kingPosition = { row, col };
                break;
            }
        }
        if (kingPosition) break;
    }

    if (!kingPosition) return true; // King not found, so the game is over

    // Iterate through the board to find opponent's pieces and check if they threaten the king
    const opponent = currentPlayer === 'white' ? 'black' : 'white';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece[0] === opponent[0]) {
                if (isValidMove(piece, row, col, kingPosition.row, kingPosition.col, board, opponent)) {
                    return true; // Found a threatening piece
                }
            }
        }
    }
    return false; 
}

export function isCheckmate(currentPlayer, board) {
    
    if (!hasKingThreat(currentPlayer, board)) {
        return false; 
    } else {
        return true; 
    }
}
