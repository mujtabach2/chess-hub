import { Engine } from './wukong.js';



export function getBestMove(fen) {
    const wukong= new Engine();
    wukong.setBoard(fen);


    const searchDepth = 4;

    const bestMove = wukong.search(searchDepth);


    const uciMove = wukong.moveToString(bestMove);

    return uciMove;
}
