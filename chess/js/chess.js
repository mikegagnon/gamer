
function assert(condition) {
    if (!condition) {
        console.error("Assertion failed");
    }
}

/*******************************************************************************
 * Gamer
 ******************************************************************************/

GAMER_CONFIG = {
    maxBoardWidth: 200,
    maxBoardHeight: 200
}

class GamerGame {
    constructor(gameClass, vizClass) {
        this.gameClass = gameClass;
        this.vizClass = vizClass;
    }
}

class Gamer {
    constructor(config = GAMER_CONFIG) {
        this.config = config;
        this.games = [];
    }

    addGame(gameClass, vizClass) {
        this.games.push(new GamerGame(gameClass, vizClass));
    }
}

class GamerViz {
    constructor(gamerDivId, viz) {
        this.gamerDivId = gamerDivId;
        this.viz = viz;
    }
}

class GamerController {
    constructor(gamerDivId, gamerGame) {

        var game = new gamerGame.gameClass();
        
        var viz = new gamerGame.vizClass()

        var gamerViz = new GamerViz(gamerDivId, viz);
    }
}

var GAMER = new Gamer();
var GAMER_DIV_ID = "gamer1";
var CONTROLLER = new GamerController(GAMER_DIV_ID, GAMER.games[0]);


function cellClick(row, col) {
    CONTROLLER.cellClick(row, col);
}


/*******************************************************************************
 * Chess constants
 ******************************************************************************/

NUM_ROWS = 8;
NUM_COLS = 8;

CAPTURE_DELAY = 700;

MIN_MAX_DEPTH = 4;

PLAYER_ONE = 1;
PLAYER_ONE_FILENAME = "player-1.png";
PLAYER_ONE_KING_FILENAME = "player-1-king.png";
PLAYER_ONE_SUGGESTION_FILENAME = "player-1-suggestion.png";
UP_PLAYER = PLAYER_ONE;

PLAYER_TWO = 2;
PLAYER_TWO_FILENAME = "player-2.png";
PLAYER_TWO_KING_FILENAME = "player-2-king.png";
PLAYER_TWO_SUGGESTION_FILENAME = "player-2-suggestion.png";
DOWN_PLAYER = PLAYER_TWO;

PLAYER_COLOR = {
    1: "Red",
    2: "Black"
}

KING = "King";
QUEEN = "Queen";
BISHOP = "Bishop";
ROOK = "Rook";
KNIGHT = "Knight";
PAWN = "Pawn";

MAXIMIZING_PLAYER = PLAYER_ONE;
MINIMIZING_PLAYER = PLAYER_TWO;

FIRST_PLAYER = PLAYER_ONE;

HUMAN_PLAYER = PLAYER_ONE; 
COMPUTER_PLAYER = PLAYER_TWO;

BLACK = PLAYER_TWO;
WHITE = PLAYER_ONE;


// Todo hline of stars
class Coordinate {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    equals(coord) {
        return this.row == coord.row &&
            this.col == coord.col;
    }

    deepCopy() {
        return new Coordinate(this.row, this.col);
    }
}

class Piece {
    constructor(type, player) {
        this.type = type;
        this.player = player;
        Object.freeze(this);
    }

    equals(piece) {
        return this.type == piece.type &&
            this.player == piece.player;
    }
}

EMPTY = new Piece(undefined, undefined);

var INIT_POSITION = [
    [new Piece(ROOK, BLACK), new Piece(KNIGHT, BLACK), new Piece(BISHOP, BLACK), new Piece(QUEEN, BLACK), new Piece(KING, BLACK), new Piece(BISHOP, BLACK), new Piece(KNIGHT, BLACK), new Piece(ROOK, BLACK)],
    [new Piece(PAWN, BLACK), new Piece(PAWN, BLACK), new Piece(PAWN, BLACK), new Piece(PAWN, BLACK), new Piece(PAWN, BLACK), new Piece(PAWN, BLACK), new Piece(PAWN, BLACK), new Piece(PAWN, BLACK)],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [new Piece(PAWN, WHITE), new Piece(PAWN, WHITE), new Piece(PAWN, WHITE), new Piece(PAWN, WHITE), new Piece(PAWN, WHITE), new Piece(PAWN, WHITE), new Piece(PAWN, WHITE), new Piece(PAWN, WHITE)],
    [new Piece(ROOK, WHITE), new Piece(KNIGHT, WHITE), new Piece(BISHOP, WHITE), new Piece(QUEEN, WHITE), new Piece(KING, WHITE), new Piece(BISHOP, WHITE), new Piece(KNIGHT, WHITE), new Piece(ROOK, WHITE)],
];


/*var INIT_POSITION = [
    [EMPTY, EMPTY, EMPTY, new Piece(KING, WHITE), EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, new Piece(QUEEN, BLACK)],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [new Piece(QUEEN, BLA/*), EMPTY, EMPTY, EMPTY, new Piece(KING, BLACK), EMPTY, EMPTY, EMPTY],
];*/


Object.freeze(INIT_POSITION);

/*******************************************************************************
 * Move is the interface between Chess and Viz TODO better description
 ******************************************************************************/
class Move {
    constructor(begin, end, movePiece, capturePiece, check, gameOver) {
        this.begin = begin;
        this.end = end;
        this.movePiece = movePiece;
        this.capturePiece = capturePiece;
        this.check = check;
        this.gameOver = gameOver;
        Object.freeze(this);
    }

    equals(move) {
        return this.begin.equals(move.begin) &&
            this.end.equals(move.end) &&
            this.movePiece.equals(move.movePiece) &&
            this.capturePiece.equals(move.capturePiece) &&
            this.gameOver.equals(move.gameOver);
 
    }
}

/*******************************************************************************
 * GameOver
 ******************************************************************************/
// GameOver objects store information about the end of the game.
class GameOver {

    // TODO: document
    constructor(gameEnded, draw, victor) {
        this.gameEnded = gameEnded;
        this.draw = draw;
        this.victor = victor;

        // Make GameOver immutable
        Object.freeze(this);
    }

    equals(gameOver) {
        return this.gameEnded == gameOver.gameEnded &&
            this.draw == gameOver.draw &&
            this.victor == gameOver.victor;
    }
}

GAME_NOT_OVER = new GameOver(false, undefined, undefined);

/*******************************************************************************
 * Chess class
 ******************************************************************************/
class Chess {

    getOpponent() {
        if (this.player == PLAYER_ONE) {
            return PLAYER_TWO;
        } else {
            return PLAYER_ONE;
        }
    }

    constructor(player = PLAYER_ONE, initPosition = INIT_POSITION) {

        this.numRows = initPosition.length;
        this.numCols = initPosition[0].length;        

        assert(this.numRows % 2 == 0);
        assert(this.numCols % 2 == 0);

        assert(player == PLAYER_ONE || player == PLAYER_TWO);

        this.matrix = new Array(this.numRows);
        for (var row = 0; row < this.numRows; row++) {
            this.matrix[row] = new Array(this.numCols);
            for (var col = 0; col < this.numCols; col++) {
                this.matrix[row][col] = initPosition[row][col];
            }
        }

        this.player = player;

        this.gameOver = GAME_NOT_OVER;

    }

    getNumRows() {
        return this.numRows;
    }

    getNumCols() {
        return this.numCols;
    }

    deepCopy() {
        var newGame = new Chess(this.player, this.matrix);
        newGame.gameOver = this.gameOver;
        return newGame;
    }

    // for debugging
    getPieces() {
        var pieceCoords = [];

        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {
                if (this.matrix[row][col] != EMPTY) {
                    pieceCoords.push([row, col,this.matrix[row][col]]);
                }
            }
        }

        return pieceCoords;
    }

    getSquare(coord) {
        if (coord.row >= 0 && coord.row < this.numRows &&
            coord.col >= 0 && coord.col < this.numCols) {
            return this.matrix[coord.row][coord.col];
        } else {
            return undefined;
        }
    }

    // Assume the move is in the list of possibleMoves
    isMoveValid(move) {

        // Make sure it's not putting king in check
        var gameCopy = this.deepCopy();
        gameCopy.matrix[move.begin.row][move.begin.col] = EMPTY;
        gameCopy.matrix[move.end.row][move.end.col] = move.movePiece;
        gameCopy.player = this.getOpponent();

        if (gameCopy.isOpponentsKingInCheck()) {
            return false;
        }

        return true;
    }


    // returns true iff piece moving to end puts the king in check
    isCheck(begin, end, movePiece) {
        var game = this.deepCopy();
        var capturePiece = game.matrix[end.row][end.col];
        var move = new Move(begin, end, movepiece, capturePiece, false, GAME_NOT_OVER);
        var resultMove = game.makeMove(move);
    }

    // Returns an array of coordinates (excluding coord), that are empty
    // and along the direction of dr, dc.
    //
    // TODO: better documentation
    consecutiveEmptySquares(begin, movepiece, dr, dc) {
        var moves = [];

        var end = begin.deepCopy();

        end.row += dr;
        end.col += dc;

        // TODO: gameover undefined?
        while(this.getSquare(end) == EMPTY) {
            var endCopy = end.deepCopy();
            var move = new Move(begin, endCopy, movepiece, EMPTY, undefined, GAME_NOT_OVER);
            moves.push(move);
            end.row += dr;
            end.col += dc;       
        }

        var lastSquare = this.getSquare(end);
        if (lastSquare != undefined && lastSquare.player == this.getOpponent()) {
            var endCopy = end.deepCopy();
            var move = new Move(begin, endCopy, movepiece, lastSquare, undefined, GAME_NOT_OVER);
            moves.push(move);
        }

        return moves;
    }

    getPossibleMovesBishop(coord) {
        var piece = this.getSquare(coord);

        assert(
            piece != EMPTY &&
            piece != undefined &&
            piece.type == BISHOP &&
            piece.player == this.player);

        var coords = [];

        return this.consecutiveEmptySquares(coord, piece, -1, -1)
            .concat(this.consecutiveEmptySquares(coord, piece, -1, 1))
            .concat(this.consecutiveEmptySquares(coord, piece, 1, -1))
            .concat(this.consecutiveEmptySquares(coord, piece, 1, 1));        
    }

    getPossibleMovesRook(coord) {
        var piece = this.getSquare(coord);

        assert(
            piece != EMPTY &&
            piece != undefined &&
            piece.type == ROOK &&
            piece.player == this.player);

        var coords = [];

        return this.consecutiveEmptySquares(coord, piece, -1, 0)
            .concat(this.consecutiveEmptySquares(coord, piece, 1, 0))
            .concat(this.consecutiveEmptySquares(coord, piece, 0, -1))
            .concat(this.consecutiveEmptySquares(coord, piece, 0, 1));        
    }

    getPossibleMovesQueen(coord) {
        var piece = this.getSquare(coord);

        assert(
            piece != EMPTY &&
            piece != undefined &&
            piece.type == QUEEN &&
            piece.player == this.player);

        var coords = [];

        return this.consecutiveEmptySquares(coord, piece, -1, -1)
            .concat(this.consecutiveEmptySquares(coord, piece, -1, 1))
            .concat(this.consecutiveEmptySquares(coord, piece, 1, -1))
            .concat(this.consecutiveEmptySquares(coord, piece, 1, 1)) 
            .concat(this.consecutiveEmptySquares(coord, piece, -1, 0))
            .concat(this.consecutiveEmptySquares(coord, piece, 1, 0))
            .concat(this.consecutiveEmptySquares(coord, piece, 0, -1))
            .concat(this.consecutiveEmptySquares(coord, piece, 0, 1));        
    }

    getPossibleMovesKnight(begin) {
        var piece = this.getSquare(begin);

        assert(
            piece != EMPTY &&
            piece != undefined &&
            piece.type == KNIGHT &&
            piece.player == this.player);

        var ends = [
            new Coordinate(begin.row + 2, begin.col + 1),
            new Coordinate(begin.row + 2, begin.col - 1),
            new Coordinate(begin.row - 2, begin.col + 1),
            new Coordinate(begin.row - 2, begin.col - 1),
            new Coordinate(begin.row + 1, begin.col + 2),
            new Coordinate(begin.row - 1, begin.col + 2),
            new Coordinate(begin.row + 1, begin.col - 2),
            new Coordinate(begin.row - 1, begin.col - 2)
        ];

        var moves = [];

        for (var i = 0; i < ends.length; i++) {
            var end = ends[i];
            var endPiece = this.getSquare(end);
            if (endPiece != undefined &&
                (endPiece == EMPTY || endPiece.player == this.getOpponent())) {
                var move = new Move(begin, end, piece, endPiece, false, GAME_NOT_OVER);
                moves.push(move);
            }
        }

        return moves;
    }

    // TODO: prevent king from moving into check
    getPossibleMovesKing(begin) {
        var piece = this.getSquare(begin);

        assert(
            piece != EMPTY &&
            piece != undefined &&
            piece.type == KING &&
            piece.player == this.player);

        var ends = [
            new Coordinate(begin.row + 0, begin.col + 1),
            new Coordinate(begin.row + 0, begin.col - 1),
            new Coordinate(begin.row + 1, begin.col + 1),
            new Coordinate(begin.row + 1, begin.col),
            new Coordinate(begin.row + 1, begin.col - 1),
            new Coordinate(begin.row - 1, begin.col + 1),
            new Coordinate(begin.row - 1, begin.col),
            new Coordinate(begin.row - 1, begin.col - 1)
        ];

        var moves = [];

        for (var i = 0; i < ends.length; i++) {
            var end = ends[i];
            var endPiece = this.getSquare(end);
            if (endPiece != undefined &&
                (endPiece == EMPTY || endPiece.player == this.getOpponent())) {
                var move = new Move(begin, end, piece, endPiece, false, GAME_NOT_OVER);
                moves.push(move);
            }
        }

        return moves;


    }

    // assuming there is a pawn at coord, is it in its homerow?
    pawnHomeRow(coord) {
        var piece = this.getSquare(coord);

        assert(
            piece != EMPTY &&
            piece != undefined &&
            piece.type == PAWN);

        if (piece.player == UP_PLAYER) {
            return coord.row == this.numRows - 2;
        } else {
            return coord.row == 1;
        }
    }

    getPossibleMovesPawn(coord) {
        var piece = this.getSquare(coord);

        assert(
            piece != EMPTY &&
            piece != undefined &&
            piece.type == PAWN &&
            piece.player == this.player);

        var moves = [];
        var begin = coord.deepCopy();
        var dr;

        if (this.player == UP_PLAYER) {
            dr = -1;
        } else if (this.player == DOWN_PLAYER) {
            dr = 1;
        } else {
            assert(false);
        }

        var homeRow = this.pawnHomeRow(coord);

        // move forward one
        coord.row += dr;
        var diagonalLeft = coord.deepCopy();
        var diagonalRight = coord.deepCopy();
        diagonalLeft.col -= 1;
        diagonalRight.col += 1;

        var dlPiece = this.getSquare(diagonalLeft);
        var drPiece = this.getSquare(diagonalRight);

        if (dlPiece != undefined && dlPiece.player == this.getOpponent()) {
            var move = new Move(begin, diagonalLeft, piece, dlPiece, false, GAME_NOT_OVER);
            moves.push(move);
        }

        if (drPiece != undefined && drPiece.player == this.getOpponent()) {
            var move = new Move(begin, diagonalRight, piece, drPiece, false, GAME_NOT_OVER);
            moves.push(move);
        }

        if (this.getSquare(coord) == EMPTY) {
            var end = coord.deepCopy();
            var move = new Move(begin, end, piece, EMPTY, false, GAME_NOT_OVER);
            moves.push(move);

            // move forward two
            coord.row += dr;
            if (homeRow && this.getSquare(coord) == EMPTY) {
                var end = coord.deepCopy();
                var move = new Move(begin, end, piece, EMPTY, false, GAME_NOT_OVER);
                moves.push(move);
            }
        }

        return moves;
    }

    removeInvalidMoves(moves) {
        var newMoves = [];
        for (var i = 0; i < moves.length; i++) {
            var move = moves[i];
            if (this.isMoveValid(move)) {
                newMoves.push(move);
            }
        }
        return newMoves;
    }

    getPossibleMoves(origCoord, ignoreAbandonment = false) {

        // copy so we don't destroy orig
        var coord = origCoord.deepCopy();

        var piece = this.getSquare(coord);

        if (piece == EMPTY ||
            piece == undefined ||
            piece.player != this.player) {
            return [];
        }

        var moves;

        // TODO, pawn captures, and set game state for en passant
        if (piece.type == PAWN) {
            moves = this.getPossibleMovesPawn(coord);
        } else if (piece.type == BISHOP) {
            moves = this.getPossibleMovesBishop(coord);
        } else if (piece.type == ROOK) {
            moves = this.getPossibleMovesRook(coord);
        } else if (piece.type == QUEEN) {
            moves = this.getPossibleMovesQueen(coord);
        } else if (piece.type == KNIGHT) {
            moves = this.getPossibleMovesKnight(coord);
        } else if (piece.type == KING) {
            moves = this.getPossibleMovesKing(coord);
        } else {
            assert(false);
        }

        if (ignoreAbandonment) {
            return moves;
        } else {
            return this.removeInvalidMoves(moves);  
        }
    }

    // abandonment is when you abandon your king,
    // which is only permissible if you're killing another king
    isOpponentsKingInCheck() {

        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {
                var coord = new Coordinate(row, col);
                var moves = this.getPossibleMoves(coord, true);

                for (var i = 0; i < moves.length; i++) {
                    var move = moves[i];
                    if (move.capturePiece.type == KING) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    makeMove(move) {

        this.matrix[move.begin.row][move.begin.col] = EMPTY;
        this.matrix[move.end.row][move.end.col] = move.movePiece;

        var check = this.isOpponentsKingInCheck();

        this.player = this.getOpponent();

        this.checkGameOver();

        return new Move(
            move.begin,
            move.end,
            move.movePiece,
            move.capturePiece,
            check,
            this.gameOver);
    }

    checkGameOver() {
        
        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {
                var coord = new Coordinate(row, col);
                var moves = this.getPossibleMoves(coord, false);
                if (moves.length > 0) {
                    return;
                }
            }
        }

        this.gameOver = new GameOver(true, false, this.getOpponent());
    }

}


/*******************************************************************************
 * Node class
 ******************************************************************************/

class Node {

    constructor(game, move = undefined) {
        this.game = game;
        this.move = move;
    }

    getMove() {
        return this.move;
    }

    isLeaf() {
        return this.game.gameOver.gameEnded;
    }

    getCounts() {
        var counts = new Object();

        counts["player_one"] = new Object();
        counts["player_two"] = new Object();

        counts["player_one"]["pawn"] = 0;
        counts["player_one"]["rook"] = 0;
        counts["player_one"]["bishop"] = 0;
        counts["player_one"]["queen"] = 0;
        counts["player_one"]["king"] = 0;
        counts["player_one"]["knight"] = 0;


        counts["player_two"]["pawn"] = 0;
        counts["player_two"]["rook"] = 0;
        counts["player_two"]["bishop"] = 0;
        counts["player_two"]["queen"] = 0;
        counts["player_two"]["king"] = 0;
        counts["player_two"]["knight"] = 0;

        /*
        var counts = {
            "player_one" : {
                "pawn": 0,
                "rook": 0,
                "knight": 0,
                "bishop": 0,
                "queen": 0,
                "king": 0,
            },
            "player_two" : {
                "pawn": 0,
                "rook": 0,
                "knight": 0,
                "bishop": 0,
                "queen": 0,
                "king": 0,
            }
        }*/



        for (var row = 0; row < this.game.numRows; row++){
            for (var col = 0; col < this.game.numRows; col++) {
                var coord = new Coordinate(row, col);
                var piece = this.game.getSquare(coord);

                var player;
                if (piece.player == PLAYER_ONE) {
                    player = "player_one";
                } else {
                    player = "player_two";
                }

                if (piece != EMPTY) {
                    var type;
                    if (piece.type == PAWN) {
                        type = "pawn";
                    } else if (piece.type == ROOK) {
                        type = "rook";
                    } else if (piece.type == KNIGHT) {
                        type = "knight";
                    } else if (piece.type == BISHOP) {
                        type = "bishop";
                    } else if (piece.type == QUEEN) {
                        type = "queen";
                    } else if (piece.type == KING) {
                        type = "king";
                    } else {
                        assert(false);
                    }

                    counts[player][type] += 1;
                }
            }
        }

        return counts;

    }

    getNonLeafScore() {

        var WEIGHT_KING = Number.MAX_SAFE_INTEGER;
        var WEIGHT_QUEEN = 30;
        var WEIGHT_BISHOP = 15;
        var WEIGHT_KNIGHT = 12;
        var WEIGHT_ROOK = 8;
        var WEIGHT_PAWN = 4;

        var counts = this.getCounts();

        var scorePlayerOne = counts["player_one"]["king"] * WEIGHT_KING +
            counts["player_one"]["queen"] * WEIGHT_QUEEN +
            counts["player_one"]["bishop"] * WEIGHT_BISHOP +
            counts["player_one"]["knight"] * WEIGHT_KNIGHT +
            counts["player_one"]["rook"] * WEIGHT_ROOK +
            counts["player_one"]["pawn"] * WEIGHT_PAWN;

        var scorePlayerTwo = counts["player_two"]["king"] * WEIGHT_KING +
            counts["player_two"]["queen"] * WEIGHT_QUEEN +
            counts["player_two"]["bishop"] * WEIGHT_BISHOP +
            counts["player_two"]["knight"] * WEIGHT_KNIGHT +
            counts["player_two"]["rook"] * WEIGHT_ROOK +
            counts["player_two"]["pawn"] * WEIGHT_PAWN;


        if (MAXIMIZING_PLAYER == PLAYER_ONE) {
            return scorePlayerOne - scorePlayerTwo;
        } else {
            return scorePlayerTwo - scorePlayerOne;
        }
    }

    // TODO: document
    getMaximize() {
        return this.game.player == MAXIMIZING_PLAYER;
    }

    getScore() {
        if (this.game.gameOver.gameEnded) {
            if (this.game.gameOver.victor == MAXIMIZING_PLAYER) {
                return Number.MAX_SAFE_INTEGER;
            } else if (this.game.gameOver.victor == MINIMIZING_PLAYER) {
                return Number.MIN_SAFE_INTEGER;
            } else {
                return 0;
            }
        } else {
            return this.getNonLeafScore();
        }
    }

    // Recall, in a game tree every node (except a leaf node)
    // is a parent. The children of a parent represent
    // all the possible moves a parent can make.
    getChildren() {

        var moves = [];

        for (var row = 0; row < this.game.numRows; row++) {
            for (var col = 0; col < this.game.numCols; col++) {
                var coord = new Coordinate(row, col);
                moves = moves.concat(this.game.getPossibleMoves(coord));
            }
        }

        var children = [];

        for (var i = 0; i < moves.length; i++) {
            var move = moves[i];
            var newGame = this.game.deepCopy();
            newGame.makeMove(move);
            var child = new Node(newGame, move);
            children.push(child);
        }
s
        return children;

    }
}


/*******************************************************************************
 * ChessViz class
 ******************************************************************************/
class ChessViz {

    constructor() {
        this.checkered = true;
    }

    drawLightSquare(element) {

    }

    drawDarkSquare(element) {

    }

    drawSuggestion(element) {

    }

    undoDrawSuggesteion(element) {

    }

    drawSelectPiece(element) {

    }

    undoDrawSelectPiece(element) {

    }

    drawMove(move) {
        [
            new RemoveImage(move.begin, delay),
            new AddImage(move.end, "foo.png", delay)
        ]

    }
}

/*******************************************************************************
 * Add to gamer
 ******************************************************************************/

GAMER.addGame(Chess, ChessViz);

/*******************************************************************************
 * MinMax function
 ******************************************************************************/

// Arguments:
//    node is the node for which we want to calculate its score
//    maximizingPlayer is true if node wants to maximize its score
//    maximizingPlayer is false if node wants to minimize its score
//
// minMax(node, player) returns the best possible score
// that the player can achieve from this node
//
// node must be an object with the following methods:
//    node.isLeaf()
//    node.getScore()
//    node.getChildren()
//    node.getMove()
function minMax(
    node,
    depth,
    maximizingPlayer,
    alpha=Number.MIN_SAFE_INTEGER,
    beta=Number.MAX_SAFE_INTEGER) {

    if (node.isLeaf() || depth == 0) {
        return node.getScore();
    }

    // If the node wants to maximize its score:
    else if (maximizingPlayer) {
        var bestScore = Number.MIN_SAFE_INTEGER;

        // find the child with the highest score
        var children = node.getChildren();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var maximize = child.getMaximize();
            var childScore = minMax(child, depth - 1, maximize, alpha, beta);
            bestScore = Math.max(childScore, bestScore);
            alpha = Math.max(alpha, bestScore);

            if (beta <= alpha) {
                break;
            }

        }
        return bestScore;
    }

    // If the node wants to minimize its score:
    else {
        var bestScore = Number.MAX_SAFE_INTEGER;

        // find the child with the lowest score
        var children = node.getChildren();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var maximize = child.getMaximize();
            var childScore = minMax(child, depth -1, maximize, alpha, beta);
            bestScore = Math.min(childScore, bestScore);
            beta = Math.min(beta, bestScore);

            if (beta <= alpha) {
                break;
            }
        }
        return bestScore;
    }
}

function getBestMove(game, maximizingPlayer, depth = MIN_MAX_DEPTH) {

    var node = new Node(game);

    assert(!node.isLeaf());

    // If the node wants to maximize its score:
    if (maximizingPlayer) {
        var bestScore = Number.MIN_SAFE_INTEGER;
        var bestMove = undefined;

        // find the child with the highest score
        var children = node.getChildren();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var maximize = child.getMaximize();
            var childScore = minMax(child, depth - 1, maximize);
            bestScore = Math.max(childScore, bestScore);

            if (bestScore == childScore) {
                bestMove = child.getMove();
            }
        }
        return bestMove;
    }

    // If the node wants to minimize its score:
    else {
        var bestScore = Number.MAX_SAFE_INTEGER;
        var bestMove = undefined;

        // find the child with the lowest score
        var children = node.getChildren();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var maximize = child.getMaximize();
            var childScore = minMax(child, depth - 1, maximize);
            bestScore = Math.min(childScore, bestScore);

            if (bestScore == childScore) {
                bestMove = child.getMove();
            }
        }
        return bestMove;
    }
}


/*******************************************************************************
 * AI code
 ******************************************************************************/

function makeAiMove(game) {

    assert(!game.gameOver.gameEnded);

    //var node = new Node(game);

    var maximizing = MAXIMIZING_PLAYER == COMPUTER_PLAYER;

    var bestMove = getBestMove(game, maximizing);

    console.log(bestMove);

    return game.makeMove(bestMove);
}

/*******************************************************************************
 * Controller
 ******************************************************************************/
         
var cell_size = 50;

var GAMER_GAME = GAMER.games[0];

var GAME = new GAMER_GAME.gameClass(FIRST_PLAYER);


