import { Engine } from './wukong.js';


// Function to get the best move from the engine
export function getBestMove(fen) {
    const wukong= new Engine();
    wukong.setBoard(fen);


    const searchDepth = 4;

    const bestMove = wukong.search(searchDepth);


    const uciMove = wukong.moveToString(bestMove);

    return uciMove;
}
