

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

/*******************************************************************************
 * Piece
 ******************************************************************************/
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
 * Deprecated: Coordinate
 ******************************************************************************/
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


/*******************************************************************************
 * Chess constants
 ******************************************************************************/

CHESS = {
    UP_PLAYER: 1,
    DOWN_PLAYER: 2,
    FIRST_PLAYER: 1,
    WHITE: 1,
    BLACK: 2,
    KING: "King",
    QUEEN: "Queen",
    BISHOP: "Bishop",
    ROOK: "Rook",
    KNIGHT: "Knight",
    PAWN: "Pawn",
    GAME_NOT_OVER: new GameOver(false, undefined, undefined),
    EMPTY: new Piece(undefined, undefined)
}

MIN_MAX_DEPTH = 3;


var INIT_POSITION = [
    [new Piece(CHESS.ROOK, CHESS.BLACK), new Piece(CHESS.KNIGHT, CHESS.BLACK), new Piece(CHESS.BISHOP, CHESS.BLACK), new Piece(CHESS.QUEEN, CHESS.BLACK), new Piece(CHESS.KING, CHESS.BLACK), new Piece(CHESS.BISHOP, CHESS.BLACK), new Piece(CHESS.KNIGHT, CHESS.BLACK), new Piece(CHESS.ROOK, CHESS.BLACK)],
    [new Piece(CHESS.PAWN, CHESS.BLACK), new Piece(CHESS.PAWN, CHESS.BLACK), new Piece(CHESS.PAWN, CHESS.BLACK), new Piece(CHESS.PAWN, CHESS.BLACK), new Piece(CHESS.PAWN, CHESS.BLACK), new Piece(CHESS.PAWN, CHESS.BLACK), new Piece(CHESS.PAWN, CHESS.BLACK), new Piece(CHESS.PAWN, CHESS.BLACK)],
    [CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY],
    [CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY],
    [CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY],
    [CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY],
    [new Piece(CHESS.PAWN, CHESS.WHITE), new Piece(CHESS.PAWN, CHESS.WHITE), new Piece(CHESS.PAWN, CHESS.WHITE), new Piece(CHESS.PAWN, CHESS.WHITE), new Piece(CHESS.PAWN, CHESS.WHITE), new Piece(CHESS.PAWN, CHESS.WHITE), new Piece(CHESS.PAWN, CHESS.WHITE), new Piece(CHESS.PAWN, CHESS.WHITE)],
    [new Piece(CHESS.ROOK, CHESS.WHITE), new Piece(CHESS.KNIGHT, CHESS.WHITE), new Piece(CHESS.BISHOP, CHESS.WHITE), new Piece(CHESS.QUEEN, CHESS.WHITE), new Piece(CHESS.KING, CHESS.WHITE), new Piece(CHESS.BISHOP, CHESS.WHITE), new Piece(CHESS.KNIGHT, CHESS.WHITE), new Piece(CHESS.ROOK, CHESS.WHITE)],
];

/*var INIT_POSITION = [
    [CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, new Piece(CHESS.KING, CHESS.WHITE), CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY],
    [CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY],
    [CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, new Piece(CHESS.QUEEN, CHESS.BLACK)],
    [CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY],
    [CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY],
    [CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY],
    [CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY],
    [new Piece(CHESS.QUEEN, BLA/*), CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY, new Piece(CHESS.KING, CHESS.BLACK), CHESS.EMPTY, CHESS.EMPTY, CHESS.EMPTY],
];*/

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

    constructor(initPosition = INIT_POSITION) {

        this.player = PLAYER_ONE;

        this.numRows = initPosition.length;

        this.numCols = initPosition[0].length;        

        assert(this.numRows % 2 == 0);
        assert(this.numCols % 2 == 0);

        assert(
            this.player == PLAYER_ONE ||
            this.player == PLAYER_TWO);

        this.matrix = new Array(this.numRows);
        for (var row = 0; row < this.numRows; row++) {
            this.matrix[row] = new Array(this.numCols);
            for (var col = 0; col < this.numCols; col++) {
                this.matrix[row][col] = initPosition[row][col];
            }
        }

        this.gameOver = CHESS.GAME_NOT_OVER;

        this.gamerConfig = {
            clickMode: CLICK_MODE_SELECT_AND_PLACE,
            checkered: true,
            lightSquareColor: "#ffcf9b",
            darkSquareColor: "#d38c3f",
            possibleMoveBoxShadow: "0px 0px 0px 2px black inset",
            selectPieceBoxShadow: "0px 0px 0px 2px red inset",
            squareMargin: 0
        }
        Object.freeze(this.gamerConfig);

    }

    getImageFilename(piece) {
        if (piece == undefined ||
            piece.type == undefined) {
            return undefined;
        }

        var color;
        if (piece.player == CHESS.BLACK) {
            color = "black";
        } else {
            color = "white";
        }

        var pieceStr;
        if (piece.type == CHESS.PAWN) {
            pieceStr = "pawn";
        } else if (piece.type == CHESS.ROOK) {
            pieceStr = "rook";
        } else if (piece.type == CHESS.KNIGHT) {
            pieceStr = "knight";
        } else if (piece.type == CHESS.BISHOP) {
            pieceStr = "bishop";
        } else if (piece.type == CHESS.QUEEN) {
            pieceStr = "queen";
        } else if (piece.type == CHESS.KING) {
            pieceStr = "king";
        }

        return "img/" + color + "-" + pieceStr + ".svg";
    }

    deepCopy() {
        var newGame = new Chess(this.matrix);
        newGame.player = this.player;
        newGame.gameOver = this.gameOver;
        return newGame;
    }

    // for debugging
    getPieces() {
        var pieceCoords = [];

        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {
                if (this.matrix[row][col] != CHESS.EMPTY) {
                    pieceCoords.push([row, col,this.matrix[row][col]]);
                }
            }
        }

        return pieceCoords;
    }

    getSquare(row, col) {
        if (row >= 0 && row < this.numRows &&
            col >= 0 && col < this.numCols) {
            return this.matrix[row][col];
        } else {
            return undefined;
        }        
    }

    getSquare2(coord) {
        if (coord.row >= 0 && coord.row < this.numRows &&
            coord.col >= 0 && coord.col < this.numCols) {
            return this.matrix[coord.row][coord.col];
        } else {
            return undefined;
        }
    }

    // Assume the move is in the list of possibleMoves
    // TODO: change to legal
    isMoveValid(move) {

        // Make sure it's not putting king in check
        var gameCopy = this.deepCopy();
        gameCopy.matrix[move.begin.row][move.begin.col] = CHESS.EMPTY;
        gameCopy.matrix[move.end.row][move.end.col] = move.movePiece;
        gameCopy.player = this.getOpponent();

        if (gameCopy.isOpponentsKingInCheck()) {
            return false;
        }

        return true;
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
        while(this.getSquare2(end) == CHESS.EMPTY) {
            var endCopy = end.deepCopy();
            var move = new Move(begin, endCopy, movepiece, CHESS.EMPTY, undefined, CHESS.GAME_NOT_OVER);
            moves.push(move);
            end.row += dr;
            end.col += dc;       
        }

        var lastSquare = this.getSquare2(end);
        if (lastSquare != undefined && lastSquare.player == this.getOpponent()) {
            var endCopy = end.deepCopy();
            var move = new Move(begin, endCopy, movepiece, lastSquare, undefined, CHESS.GAME_NOT_OVER);
            moves.push(move);
        }

        return moves;
    }

    getPossibleMoves2Bishop(coord) {
        var piece = this.getSquare2(coord);

        assert(
            piece != CHESS.EMPTY &&
            piece != undefined &&
            piece.type == CHESS.BISHOP &&
            piece.player == this.player);

        var coords = [];

        return this.consecutiveEmptySquares(coord, piece, -1, -1)
            .concat(this.consecutiveEmptySquares(coord, piece, -1, 1))
            .concat(this.consecutiveEmptySquares(coord, piece, 1, -1))
            .concat(this.consecutiveEmptySquares(coord, piece, 1, 1));        
    }

    getPossibleMoves2Rook(coord) {
        var piece = this.getSquare2(coord);

        assert(
            piece != CHESS.EMPTY &&
            piece != undefined &&
            piece.type == CHESS.ROOK &&
            piece.player == this.player);

        var coords = [];

        return this.consecutiveEmptySquares(coord, piece, -1, 0)
            .concat(this.consecutiveEmptySquares(coord, piece, 1, 0))
            .concat(this.consecutiveEmptySquares(coord, piece, 0, -1))
            .concat(this.consecutiveEmptySquares(coord, piece, 0, 1));        
    }

    getPossibleMoves2Queen(coord) {
        var piece = this.getSquare2(coord);

        assert(
            piece != CHESS.EMPTY &&
            piece != undefined &&
            piece.type == CHESS.QUEEN &&
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

    getPossibleMoves2Knight(begin) {
        var piece = this.getSquare2(begin);

        assert(
            piece != CHESS.EMPTY &&
            piece != undefined &&
            piece.type == CHESS.KNIGHT &&
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
            var endPiece = this.getSquare2(end);
            if (endPiece != undefined &&
                (endPiece == CHESS.EMPTY || endPiece.player == this.getOpponent())) {
                var move = new Move(begin, end, piece, endPiece, false, CHESS.GAME_NOT_OVER);
                moves.push(move);
            }
        }

        return moves;
    }

    // TODO: prevent king from moving into check
    getPossibleMoves2King(begin) {
        var piece = this.getSquare2(begin);

        assert(
            piece != CHESS.EMPTY &&
            piece != undefined &&
            piece.type == CHESS.KING &&
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
            var endPiece = this.getSquare2(end);
            if (endPiece != undefined &&
                (endPiece == CHESS.EMPTY || endPiece.player == this.getOpponent())) {
                var move = new Move(begin, end, piece, endPiece, false, CHESS.GAME_NOT_OVER);
                moves.push(move);
            }
        }

        return moves;


    }

    // assuming there is a pawn at coord, is it in its homerow?
    pawnHomeRow(coord) {
        var piece = this.getSquare2(coord);

        assert(
            piece != CHESS.EMPTY &&
            piece != undefined &&
            piece.type == CHESS.PAWN);

        if (piece.player == CHESS.UP_PLAYER) {
            return coord.row == this.numRows - 2;
        } else {
            return coord.row == 1;
        }
    }

    getPossibleMoves2Pawn(coord) {
        var piece = this.getSquare2(coord);

        assert(
            piece != CHESS.EMPTY &&
            piece != undefined &&
            piece.type == CHESS.PAWN &&
            piece.player == this.player);

        var moves = [];
        var begin = coord.deepCopy();
        var dr;

        if (this.player == CHESS.UP_PLAYER) {
            dr = -1;
        } else if (this.player == CHESS.DOWN_PLAYER) {
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

        var dlPiece = this.getSquare2(diagonalLeft);
        var drPiece = this.getSquare2(diagonalRight);

        if (dlPiece != undefined && dlPiece.player == this.getOpponent()) {
            var move = new Move(begin, diagonalLeft, piece, dlPiece, false, CHESS.GAME_NOT_OVER);
            moves.push(move);
        }

        if (drPiece != undefined && drPiece.player == this.getOpponent()) {
            var move = new Move(begin, diagonalRight, piece, drPiece, false, CHESS.GAME_NOT_OVER);
            moves.push(move);
        }

        if (this.getSquare2(coord) == CHESS.EMPTY) {
            var end = coord.deepCopy();
            var move = new Move(begin, end, piece, CHESS.EMPTY, false, CHESS.GAME_NOT_OVER);
            moves.push(move);

            // move forward two
            coord.row += dr;
            if (homeRow && this.getSquare2(coord) == CHESS.EMPTY) {
                var end = coord.deepCopy();
                var move = new Move(begin, end, piece, CHESS.EMPTY, false, CHESS.GAME_NOT_OVER);
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

    getPossibleMoves(row, col) {
        var coordinate = new Coordinate(row, col);
        var moves = this.getPossibleMoves2(coordinate);

        var ends = [];
        for (var i = 0; i < moves.length; i++) {
            var move = moves[i];
            ends.push([move.end.row, move.end.col]);
        }
        return ends;
    }

    getPossibleMoves2(origCoord, ignoreAbandonment = false) {

        // copy so we don't destroy orig
        var coord = origCoord.deepCopy();

        var piece = this.getSquare2(coord);

        if (piece == CHESS.EMPTY ||
            piece == undefined ||
            piece.player != this.player) {
            return [];
        }

        var moves;

        // TODO, pawn captures, and set game state for en passant
        if (piece.type == CHESS.PAWN) {
            moves = this.getPossibleMoves2Pawn(coord);
        } else if (piece.type == CHESS.BISHOP) {
            moves = this.getPossibleMoves2Bishop(coord);
        } else if (piece.type == CHESS.ROOK) {
            moves = this.getPossibleMoves2Rook(coord);
        } else if (piece.type == CHESS.QUEEN) {
            moves = this.getPossibleMoves2Queen(coord);
        } else if (piece.type == CHESS.KNIGHT) {
            moves = this.getPossibleMoves2Knight(coord);
        } else if (piece.type == CHESS.KING) {
            moves = this.getPossibleMoves2King(coord);
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
                var moves = this.getPossibleMoves2(coord, true);

                for (var i = 0; i < moves.length; i++) {
                    var move = moves[i];
                    if (move.capturePiece.type == CHESS.KING) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

//    constructor(begin, end, movePiece, capturePiece, check, gameOver) {

    selectAndPlaceMove(begin, end) {
        var move = new Move(new Coordinate(begin[0], begin[1]),
        new Coordinate(end[0], end[1]), this.getSquare(begin[0], begin[1]),
        this.getSquare(end[0], end[1]),
        undefined,
        undefined);

        return this.makeMove2(move);
    }

    makeMove2(move) {

        this.matrix[move.begin.row][move.begin.col] = CHESS.EMPTY;
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
                var moves = this.getPossibleMoves2(coord, false);
                if (moves.length > 0) {
                    return;
                }
            }
        }

        this.gameOver = new GameOver(true, false, this.getOpponent());
    }

}


/*******************************************************************************
 * ChessNode class
 ******************************************************************************/

class ChessNode {

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

        counts[PLAYER_ONE] = new Object();
        counts[PLAYER_TWO] = new Object();

        counts[PLAYER_ONE][CHESS.PAWN] = 0;
        counts[PLAYER_ONE][CHESS.ROOK] = 0;
        counts[PLAYER_ONE][CHESS.BISHOP] = 0;
        counts[PLAYER_ONE][CHESS.QUEEN] = 0;
        counts[PLAYER_ONE][CHESS.KING] = 0;
        counts[PLAYER_ONE][CHESS.KNIGHT] = 0;

        counts[PLAYER_TWO][CHESS.PAWN] = 0;
        counts[PLAYER_TWO][CHESS.ROOK] = 0;
        counts[PLAYER_TWO][CHESS.BISHOP] = 0;
        counts[PLAYER_TWO][CHESS.QUEEN] = 0;
        counts[PLAYER_TWO][CHESS.KING] = 0;
        counts[PLAYER_TWO][CHESS.KNIGHT] = 0;

        for (var row = 0; row < this.game.numRows; row++){
            for (var col = 0; col < this.game.numRows; col++) {
                var coord = new Coordinate(row, col);
                var piece = this.game.getSquare2(coord);

                if (piece != CHESS.EMPTY) {   
                    counts[piece.player][piece.type] += 1;
                }
            }
        }

        return counts;

    }

    getNonLeafScore() {

        // TODO CONFIGIFY
        var WEIGHT_KING = 100;
        var WEIGHT_QUEEN = 30;
        var WEIGHT_BISHOP = 15;
        var WEIGHT_KNIGHT = 12;
        var WEIGHT_ROOK = 8;
        var WEIGHT_PAWN = 4;

        var counts = this.getCounts();

        var scorePlayerOne = counts[PLAYER_ONE][CHESS.KING] * WEIGHT_KING +
            counts[PLAYER_ONE][CHESS.QUEEN] * WEIGHT_QUEEN +
            counts[PLAYER_ONE][CHESS.BISHOP] * WEIGHT_BISHOP +
            counts[PLAYER_ONE][CHESS.KNIGHT] * WEIGHT_KNIGHT +
            counts[PLAYER_ONE][CHESS.ROOK] * WEIGHT_ROOK +
            counts[PLAYER_ONE][CHESS.PAWN] * WEIGHT_PAWN;

        var scorePlayerTwo = counts[PLAYER_TWO][CHESS.KING] * WEIGHT_KING +
            counts[PLAYER_TWO][CHESS.QUEEN] * WEIGHT_QUEEN +
            counts[PLAYER_TWO][CHESS.BISHOP] * WEIGHT_BISHOP +
            counts[PLAYER_TWO][CHESS.KNIGHT] * WEIGHT_KNIGHT +
            counts[PLAYER_TWO][CHESS.ROOK] * WEIGHT_ROOK +
            counts[PLAYER_TWO][CHESS.PAWN] * WEIGHT_PAWN;


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
                moves = moves.concat(this.game.getPossibleMoves2(coord));
            }
        }

        var children = [];

        for (var i = 0; i < moves.length; i++) {
            var move = moves[i];
            var newGame = this.game.deepCopy();
            newGame.makeMove2(move);
            var child = new ChessNode(newGame, move);
            children.push(child);
        }

        return children;

    }
}

/*******************************************************************************
 * Add Chess to Gamer
 ******************************************************************************/

GAMER.addGame("Chess", Chess);

/*******************************************************************************
 * Add chess AI's to Gamer
 ********************************s**********************************************/

function chessMinMaxDepth1(chessGame) {
    return getBestMove(new ChessNode(chessGame), 1);
}

function chessMinMaxDepth2(chessGame) {
    return getBestMove(new ChessNode(chessGame), 2);
}

function chessMinMaxDepth3(chessGame) {
    return getBestMove(new ChessNode(chessGame), 3);
}

function chessMinMaxDepth4(chessGame) {
    return getBestMove(new ChessNode(chessGame), 3);
}

GAMER.addAi("Chess", "chessMinMaxDepth1", chessMinMaxDepth1);
GAMER.addAi("Chess", "chessMinMaxDepth2", chessMinMaxDepth2);
GAMER.addAi("Chess", "chessMinMaxDepth3", chessMinMaxDepth3);
GAMER.addAi("Chess", "chessMinMaxDepth4", chessMinMaxDepth4);

