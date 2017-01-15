

/*******************************************************************************
 * Piece
 ******************************************************************************/
class Piece {
    constructor(type, player) {
        this.type = type;
        this.player = player;
    }

    equals(piece) {
        return this.type == piece.type &&
            this.player == piece.player;
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

        this.gameOver = new GameOver();

        this.gamerConfig = {
            clickMode: CLICK_MODE_SELECT_AND_PLACE,
            checkered: true,
            lightSquareColor: "#ffcf9b",
            darkSquareColor: "#d38c3f",
            possibleMoveBoxShadow: "0px 0px 0px 2px black inset",
            selectPieceBoxShadow: "0px 0px 0px 2px red inset",
            squareMargin: 0
        }

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

        return "chess/img/" + color + "-" + pieceStr + ".svg";
    }

    deepCopy() {
        var newGame = new Chess(this.matrix);
        newGame.player = this.player;
        newGame.gameOver = this.gameOver.deepCopy();
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

    getSquare2(row, col) {
        if (row >= 0 && row < this.numRows &&
            col >= 0 && col < this.numCols) {
            return this.matrix[row][col];
        } else {
            return undefined;
        }
    }

    // Assume the move is in the list of possiblePlacements
    // TODO: change to legal
    isMoveValid(select, place) {

        var [row1, col1] = select;
        var [row2, col2] = place;

        // Make sure it's not putting king in check
        var gameCopy = this.deepCopy();
        var movePiece = gameCopy.matrix[row1][col1];
        gameCopy.matrix[row1][col1] = CHESS.EMPTY;
        gameCopy.matrix[row2][col2] = movePiece;
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
    consecutiveEmptySquares(select, dr, dc) {
        var placements = [];

        var [placeRow, placeCol] = select;

        placeRow += dr;
        placeCol += dc;

        // TODO: gameover undefined?
        while(this.getSquare2(placeRow, placeCol) == CHESS.EMPTY) {
            var place = [placeRow, placeCol];
            placements.push(place);
            placeRow += dr;
            placeCol += dc;       
        }

        var lastPiece = this.getSquare2(placeRow, placeCol);
        if (lastPiece != undefined && lastPiece.player == this.getOpponent()) {
            var place = [placeRow, placeCol];
            placements.push(place);
        }

        return placements;
    }

    getPossiblePlacementsBishop(select) {
        return this.consecutiveEmptySquares(select, -1, -1)
            .concat(this.consecutiveEmptySquares(select, -1, 1))
            .concat(this.consecutiveEmptySquares(select, 1, -1))
            .concat(this.consecutiveEmptySquares(select, 1, 1));        
    }

    getPossiblePlacementsRook(select) {
        return this.consecutiveEmptySquares(select, -1, 0)
            .concat(this.consecutiveEmptySquares(select, 1, 0))
            .concat(this.consecutiveEmptySquares(select, 0, -1))
            .concat(this.consecutiveEmptySquares(select, 0, 1));        
    }

    getPossiblePlacementsQueen(select) {
        return this.consecutiveEmptySquares(select, -1, -1)
            .concat(this.consecutiveEmptySquares(select, -1, 1))
            .concat(this.consecutiveEmptySquares(select, 1, -1))
            .concat(this.consecutiveEmptySquares(select, 1, 1)) 
            .concat(this.consecutiveEmptySquares(select, -1, 0))
            .concat(this.consecutiveEmptySquares(select, 1, 0))
            .concat(this.consecutiveEmptySquares(select, 0, -1))
            .concat(this.consecutiveEmptySquares(select, 0, 1));        
    }

    getPossiblePlacementsKnight(select) {

        var [r, c] = select;

        var placements = [
            [r + 2, c + 1],
            [r + 2, c - 1],
            [r - 2, c + 1],
            [r - 2, c - 1],
            [r + 1, c + 2],
            [r - 1, c + 2],
            [r + 1, c - 2],
            [r - 1, c - 2],
        ];

        var placements = [];

        for (var i = 0; i < placements.length; i++) {
            var [r, c] = placements[i];
            var placePiece = this.getSquare2(r, c);
            if (placePiece != undefined &&
                (placePiece == CHESS.EMPTY ||
                placePiece.player == this.getOpponent())) {

                var place = [r, c];
                placements.push(place);
            }
        }

        return placements;
    }

    // TODO: prevent king from moving into check
    getPossiblePlacementsKing(select) {

        var [r, c] = select;

        var placements = [
            [r + 0, c + 1],
            [r + 0, c - 1],
            [r + 1, c + 1],
            [r + 1, c + 0],
            [r + 1, c - 1],
            [r - 1, c + 1],
            [r - 1, c + 0],
            [r - 1, c - 1],
        ];

        var placements = [];

        for (var i = 0; i < placements.length; i++) {
            var [r, c] = placements[i];
            var placePiece = this.getSquare2(r ,c);
            if (placePiece != undefined &&
                (placePiece == CHESS.EMPTY ||
                placePiece.player == this.getOpponent())) {

                var place = [r, c];
                placements.push(place);
            }
        }

        return placements;
    }

    // assuming there is a pawn at coord, is it in its homerow?
    pawnHomeRow(select) {
        var [r, c] = select;
        var pawn = this.getSquare2(r, c);

        if (pawn.player == CHESS.UP_PLAYER) {
            return r == this.numRows - 2;
        } else {
            return r == 1;
        }
    }

    getPossiblePlacementsPawn(select) {
        var dr;

        if (this.player == CHESS.UP_PLAYER) {
            dr = -1;
        } else if (this.player == CHESS.DOWN_PLAYER) {
            dr = 1;
        } else {
            assert(false);
        }

        var placements = [];
        var [r, c] = select;

        // move forward one
        r += dr;
        var diagonalLeftCol = c - 1;
        var diagonalRightCol = c + 1;

        var dlPiece = this.getSquare2(r, diagonalLeftCol);
        var drPiece = this.getSquare2(r, diagonalRightCol);

        if (dlPiece != undefined && dlPiece.player == this.getOpponent()) {
            var place = [r, diagonalLeftCol];
            placements.push(place);
        }

        if (drPiece != undefined && drPiece.player == this.getOpponent()) {
            var place = [r, diagonalRightCol];
            placements.push(place);
        }

        if (this.getSquare2(r, c) == CHESS.EMPTY) {
            var place = [r, c];
            placements.push(place);

            r += dr;
            if (this.pawnHomeRow(select) &&
                this.getSquare2(r, c) == CHESS.EMPTY) {

                var place = [r, c];
                placements.push(place);
            }
        }

        return placements;
    }

    removeInvalidPlacements(select, placements) {
        var newPlacements = [];
        for (var i = 0; i < placements.length; i++) {
            var place = placements[i];
            if (this.isMoveValid(select, place)) {
                newPlacements.push(place);
            }
        }
        return newPlacements;
    }

    getPossiblePlacements(select, ignoreAbandonment = false) {

        var [r, c] = select;
        var piece = this.getSquare2(r, c);

        if (piece == CHESS.EMPTY ||
            piece == undefined ||
            piece.player != this.player) {
            return [];
        }

        var placements;

        // TODO: en passant
        if (piece.type == CHESS.PAWN) {
            placements = this.getPossiblePlacementsPawn(select);
        } else if (piece.type == CHESS.BISHOP) {
            placements = this.getPossiblePlacementsBishop(select);
        } else if (piece.type == CHESS.ROOK) {
            placements = this.getPossiblePlacementsRook(select);
        } else if (piece.type == CHESS.QUEEN) {
            placements = this.getPossiblePlacementsQueen(select);
        } else if (piece.type == CHESS.KNIGHT) {
            placements = this.getPossiblePlacementsKnight(select);
        } else if (piece.type == CHESS.KING) {
            placements = this.getPossiblePlacementsKing(select);
        } else {
            assert(false);
        }

        // TODO: explain ignoreAbandonment
        if (ignoreAbandonment) {
            return placements;
        } else {
            return this.removeInvalidPlacements(select, placements);  
        }
    }

    // abandonment is when you abandon your king,
    // which is only permissible if you're capturing another king
    isOpponentsKingInCheck() {

        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {
                var select = [row, col];
                var placements = this.getPossiblePlacements(select, true);

                for (var i = 0; i < placements.length; i++) {
                    var place = placements[i];
                    var [r, c] = place;
                    var piece = this.getSquare2(r, c);
                    if (piece != undefined && piece.type == CHESS.KING) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    makeMove(select, place) {
        return this.selectAndPlace(select, place);
    }

    selectAndPlace(select, place) {
        var [selectRow, selectCol] = select;
        var [placeRow, placeCol] = place;

        var movePiece = this.matrix[selectRow][selectCol];
        this.matrix[selectRow][selectCol] = CHESS.EMPTY;
        this.matrix[placeRow][placeCol] = movePiece;

        // TODO: message back draws, checmates, checks, etc. to Gamer
        var check = this.isOpponentsKingInCheck();

        this.player = this.getOpponent();

        this.checkGameOver();
    }

    checkGameOver() {
        
        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {
                var select = [row, col];
                var placements = this.getPossiblePlacements(select);
                if (placements.length > 0) {
                    return;
                }
            }
        }

        this.gameOver.victor = this.getOpponent();
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
        return this.game.gameOver.isGameOver();
    }

    getCounts() {
        var counts = {};

        counts[PLAYER_ONE] = {};
        counts[PLAYER_TWO] = {};

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
                var piece = this.game.getSquare2(row, col);

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
        if (this.game.gameOver.isGameOver()) {
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
                var select = [row, col];
                var placements = this.game.getPossiblePlacements(select)
                for (var i = 0; i < placements.length; i++) {
                    var place = placements[i];
                    moves.push([select, place]);
                }
            }
        }

        var children = [];

        for (var i = 0; i < moves.length; i++) {
            var [select, place] = moves[i];
            var newGame = this.game.deepCopy();
            newGame.selectAndPlace(select, place);
            var child = new ChessNode(newGame, [select, place]);
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
    return getBestMove(new ChessNode(chessGame), 4);
}

GAMER.addAi("Chess", "chessMinMaxDepth1", chessMinMaxDepth1);
GAMER.addAi("Chess", "chessMinMaxDepth2", chessMinMaxDepth2);
GAMER.addAi("Chess", "chessMinMaxDepth3", chessMinMaxDepth3);
GAMER.addAi("Chess", "chessMinMaxDepth4", chessMinMaxDepth4);

