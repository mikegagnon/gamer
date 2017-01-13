
function assert(condition) {
    if (!condition) {
        console.error("Assertion failed");
    }
}

/*******************************************************************************
 * Gamer
 ******************************************************************************/
//
// Every game object must have the following methods:
//      .getNumRows()
//
//      .getNumCols()
//
//      .getSquare(row, col)
//          if (row, col) is in bounds, returns a "square" (which can be
//          anything) representing the state of the square located at
//          (row, col).
//
//      .getPossibleMoves(row, col)
//          returns an array of [row, col] pairs, TODO explain
//
//      But only if MODE_SELECT_AND_PLACE
//      .selectAndPlaceMove(select, place)
//          from is a [row, col] pair
//          to is a [row, col] pair
//
// Every viz object must have the following methods:
//      ...
//

GAMER_CONFIG = {
    maxBoardWidth: 400,
    maxBoardHeight: 400
}

// TODO: document
CLICK_MODE_PLACE = 1;
CLICK_MODE_SELECT_AND_PLACE = 2;

PLAYER_ONE = 1;
PLAYER_TWO = 2;

PLAYER_HUMAN = 1;
PLAYER_COMPUTER = 2;

PLAYER_ONE_LIFE_FORM = PLAYER_COMPUTER;
PLAYER_TWO_LIFE_FORM = PLAYER_COMPUTER;

class Gamer {
    constructor(gamerDivId, config = GAMER_CONFIG) {
        this.gamerDivId = gamerDivId;
        this.config = config;
        this.gameConstructors = [];
    }

    addGame(gameName, gameClass) {
        this.gameConstructors.push([gameName, gameClass]);
    }

    /***************************************************************************
     * Vizualization
     **************************************************************************/

    getCellSize() {
        var margin = this.game.gamerConfig.squareMargin;

        var cellWidth = Math.floor(this.config.maxBoardWidth /
            this.game.numCols) - margin;

        var cellHeight = Math.floor(this.config.maxBoardHeight /
            this.game.numRows) - margin;

        return Math.min(cellWidth, cellHeight);
    }

    removeViz() {
        $("#" + this.gamerDivId).html("");
    }

    getCellId(row, col) {
        return "cell-" + row + "-" + col;
    }

    drawCells() {

        for (var row = 0; row < this.game.numRows; row++) {

            var rowId = "row-" + row;
            var rowTag = "<div id='" + rowId + "'></div>"

            $("#" + this.gamerDivId).append(rowTag);
            $("#" + rowId).css("clear", "left");

            for (var col = 0; col < this.game.numCols; col++) {

                var cellId = this.getCellId(row, col);
                var cellTag = "<div id='" + cellId + "' " + 
                              "onClick='cellClick(" + row + ", " + col +" )'>" +
                              "</div>";
                $("#" + rowId).append(cellTag);
                $("#" + cellId).css("width", this.cellSize);
                $("#" + cellId).css("height", this.cellSize);
                $("#" + cellId).css("float", "left");
                $("#" + cellId).css("cursor", "pointer");

                // TODO: non checkered
                var cell = $("#" + cellId);
                if ((row % 2 == 0 && col % 2 == 0) ||
                    (row % 2 == 1 && col % 2 == 1)) {
                    $("#" + cellId).css("background-color",
                        this.game.gamerConfig.lightSquareColor);
                } else {
                    $("#" + cellId).css("background-color",
                        this.game.gamerConfig.darkSquareColor);
                }
            }
        }
    }

    drawGameState() {
        for (var row = 0; row < this.game.numRows; row++) {
            for (var col = 0; col < this.game.numCols; col++) {
                var piece = this.game.matrix[row][col];
                
                var cellId = this.getCellId(row, col);
                $("#" + cellId + " img").remove();

                var filename = this.game.getImageFilename(piece);
                if (filename != undefined) {
                    var imgTag = "<img src='" + filename + "' width='" + this.cellSize + "'>";
                    $("#" + cellId).append(imgTag);
                }
            }
        }
    }

    undoDrawSelectPiece() {
        if (this.selectedSquare == undefined) {
            return;
        }
        var [row, col] = this.selectedSquare;
        $("#" + this.getCellId(row, col)).css("box-shadow", "");
    }

    drawSelectPiece() {
        var [row, col] = this.selectedSquare;
        $("#" + this.getCellId(row, col)).css("box-shadow",
            this.game.gamerConfig.selectPieceBoxShadow);
    }

    undoDrawPossibleMoves() {
        if(this.possibleMoves == undefined) {
            return;
        }

        for (var i = 0; i < this.possibleMoves.length; i++) {
            var [row, col] = this.possibleMoves[i];
            $("#" + this.getCellId(row, col)).css("box-shadow", "");
        }
    }

    drawPossibleMoves() {
        assert(this.possibleMoves != undefined);

        for (var i = 0; i < this.possibleMoves.length; i++) {
            var [row, col] = this.possibleMoves[i];
            $("#" + this.getCellId(row, col)).css("box-shadow",
                this.game.gamerConfig.possibleMoveBoxShadow);
        }
    }

    // Also handles messages such as check, checkmate, victory announcments, ...
    // Move constructor(begin, end, movePiece, capturePiece, check, gameOver) {

    drawMoveSelectAndPlace(move) {
        this.undoDrawSelectPiece();
        this.undoDrawPossibleMoves();
        this.drawGameState();
    }

    checkGameOver(move) {
        //var animation = this.viz.drawMove(move);

        // TODO: look for game over in animation
        this.selectedSquare = undefined;
        this.possibleMoves = undefined;
        this.gameOver = false;
    }

    vizInit() {
        this.cellSize = this.getCellSize();
        this.removeViz();
        this.drawCells();
        this.drawGameState();
    }

    /***************************************************************************
     * Controller
     **************************************************************************/

    run() {
        var gamerConstructor = this.gameConstructors[0][1];
        this.game = new gamerConstructor();
        this.gameOver = false;
        this.vizInit();

        assert(
            this.game.gamerConfig.clickMode == CLICK_MODE_PLACE ||
            this.game.gamerConfig.clickMode == CLICK_MODE_SELECT_AND_PLACE)

        // TODO: document
        this.selectedSquare = undefined;
        this.possibleMoves = undefined;

        if (PLAYER_ONE_LIFE_FORM == PLAYER_COMPUTER &&
            PLAYER_TWO_LIFE_FORM == PLAYER_COMPUTER) {

            console.log("asdf");

            var THIS = this;

            function doAiMove() {
                console.log("move")
                var move = makeAiMove(THIS.game);
                THIS.drawGameState();

                if (!THIS.gameOver) {
                    window.setTimeout(doAiMove, 300);
                }
            }

            window.setTimeout(doAiMove, 300);

        } else if (PLAYER_ONE_LIFE_FORM == PLAYER_COMPUTER) {
            var move = makeAiMove(this.game);
            this.drawGameState();
        }
    }

    // Checks to see if a user clicked on a possible move. Iff so,
    // returns true.
    isPossibleMove(row, col) {
        for (var i = 0; i < this.possibleMoves.length; i++) {
            var [r, c] = this.possibleMoves[i];
            if (row == r && col == c) {
                return true;
            }
        }
        return false;
    }

    // The player has clicked (row, col) and we are in "select and place" mode.
    cellClickSelectAndPlace(row, col) {

        // If the player has already seleted a piece
        if (this.selectedSquare != undefined) {
            assert(this.possibleMoves != undefined);

            // If the player has clicked on a "place" -- i.e. a possible move
            if (this.isPossibleMove(row, col)) {
                var move = this.game.selectAndPlaceMove(this.selectedSquare, [row, col]);
                this.drawMoveSelectAndPlace(move);
                this.checkGameOver(move);

                this.selectedSquare = undefined;
                this.possibleMoves = undefined;

                if (!this.gameOver) {

                    var THIS = this;

                    function doAiMove() {
                        var move = makeAiMove(THIS.game);
                        THIS.drawGameState();
                    }

                    window.setTimeout(doAiMove, 300);
                }

                return;
            }
        }

        // If the player has selected a piece that has valid moves
        var possibleMoves = this.game.getPossibleMoves(row, col);
        if (possibleMoves.length > 0) {
            this.undoDrawSelectPiece();
            this.undoDrawPossibleMoves();
            this.selectedSquare = [row, col];
            this.possibleMoves = possibleMoves;
            this.drawSelectPiece();
            this.drawPossibleMoves();
        }
    }

    cellClick(row, col) {
        
        if (this.gameOver) {
            return;
        }

        if (PLAYER_ONE_LIFE_FORM == PLAYER_COMPUTER &&
            PLAYER_TWO_LIFE_FORM == PLAYER_COMPUTER) {
            return;
        }

        if (this.game.gamerConfig.clickMode == CLICK_MODE_SELECT_AND_PLACE) {
            this.cellClickSelectAndPlace(row, col);
        } else {
            alert("asdf");
        }
    }
}

var GAMER = new Gamer("gamer1");

function cellClick(row, col) {
    GAMER.cellClick(row, col);
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
MAXIMIZING_PLAYER = PLAYER_ONE;
MINIMIZING_PLAYER = PLAYER_TWO;

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
            var child = new Node(newGame, move);
            children.push(child);
        }

        return children;

    }
}

/*******************************************************************************
 * Add to gamer
 ******************************************************************************/

GAMER.addGame("Chess", Chess);

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

    var maximizing = game.player == MAXIMIZING_PLAYER;

    var bestMove = getBestMove(game, maximizing);

    return game.makeMove2(bestMove);
}

/*******************************************************************************
 * Gamer run
 ********************************s**********************************************/

GAMER.run();

