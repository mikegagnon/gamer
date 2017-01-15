

/*******************************************************************************
 * CheckersPiece class
 ******************************************************************************/
class CheckersPiece {
    // player == PLAYER_ONE or
    // player == PLAYER_TWO or
    // player == CHECKERS.EMPTY or
    // player == undefined, which means out of bounds
    constructor(player, king) {
        this.player = player;
        this.king = king;
    }

    deepCopy() {
        var newCheckersPiece = new CheckersPiece(this.player, this.king);
        return newCheckersPiece;
    }
}

CHECKERS = {
    OOB_PIECE: new CheckersPiece(undefined, false),
    EMPTY: 0,
    UP_PLAYER: PLAYER_ONE,
    DOWN_PLAYER: PLAYER_TWO,
    RED: PLAYER_ONE,
    BLACK: PLAYER_TWO,
}


/*******************************************************************************
 * Checkers class
 ******************************************************************************/
class Checkers {

    getOpponent() {
        if (this.player == PLAYER_ONE) {
            return PLAYER_TWO;
        } else {
            return PLAYER_ONE;
        }
    }

    getPiece(row, col) {
        if (row >= 0 && row < this.numRows &&
            col >= 0 && col < this.numCols) {
            return this.matrix[row][col];
        } else {
            return CHECKERS.OOB_PIECE;
        }
    }

    // TODO: refactor jumps into drdc
    getJumpUpLeft(select) {
        var [row, col] = select;
        var opponent = this.getOpponent();
        if (this.getPiece(row - 1, col - 1).player == opponent &&
            this.getPiece(row - 2, col - 2).player == CHECKERS.EMPTY) {
            var place = [row - 2, col - 2];
            return [place];
        } else {
            return [];
        }
    }

    getJumpUpRight(select) {
        var [row, col] = select;
        var opponent = this.getOpponent();
        if (this.getPiece(row - 1, col + 1).player == opponent &&
            this.getPiece(row - 2, col + 2).player == CHECKERS.EMPTY) {
            var place = [row - 2, col + 2];
            return [place];
        } else {
            return [];
        }
    }

    getJumpDownLeft(select) {
        var [row, col] = select;
        var opponent = this.getOpponent();
        if (this.getPiece(row + 1, col - 1).player == opponent &&
            this.getPiece(row + 2, col - 2).player == CHECKERS.EMPTY) {
            var place = [row + 2, col - 2];
            return [place];
        } else {
            return [];
        }
    }

    getJumpDownRight(select) {
        var [row, col] = select;
        var opponent = this.getOpponent();
        if (this.getPiece(row + 1, col + 1).player == opponent &&
            this.getPiece(row + 2, col + 2).player == CHECKERS.EMPTY) {
            var place = [row + 2, col + 2];
            return [place];
        } else {
            return [];
        }
    }

    // TODO: simplify with drdc
    getCheckersMoveUpLeft(select) {
        var [row, col] = select;
        
        if (this.getPiece(row - 1, col - 1).player == CHECKERS.EMPTY) {
            var place = [row - 1, col - 1];
            return [place];
        } else {
            return [];
        }
    }

    getCheckersMoveUpRight(select) {
        var [row, col] = select;

        if (this.getPiece(coord.row - 1, coord.col + 1).player == CHECKERS.EMPTY) {
            var place = [row - 1, col + 1];
            return [place];
        } else {
            return [];
        }
    }

    getCheckersMoveDownLeft(select) {
        var [row, col] = select;

        if (this.getPiece(coord.row + 1, coord.col - 1).player == CHECKERS.EMPTY) {
            var place = [row + 1, col - 1];
            return [move];
        } else {
            return [];
        }
    }

    getCheckersMoveDownRight(select) {
        var [row, col] = select;

        if (this.getPiece(coord.row + 1, coord.col + 1).player == CHECKERS.EMPTY) {
            var place = [row + 1, col + 1];
            return [move];
        } else {
            return [];
        }
    }

    // Returns true if this.player has at least one jump available
    availableJump() {

        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0 ; col < this.numCols; col++) {
                var select = [row, col];
                var piece = this.matrix[row][col];

                if (piece.player == this.player) {

                    var jumps = [];

                    if (this.player == CHECKERS.UP_PLAYER || piece.king) {
                        jumps = jumps
                            .concat(this.getJumpUpLeft(select))
                            .concat(this.getJumpUpRight(select));
                    }

                    if (this.player == CHECKERS.DOWN_PLAYER || piece.king) {
                        jumps = jumps
                            .concat(this.getJumpDownLeft(select))
                            .concat(this.getJumpDownRight(select));
                    }

                    if (jumps.length > 0) {
                        return true;
                    }
                }

            }
        }

        return false;
    }

    static isJump(select, place) {
        var [r1, _] = select;
        var [r2, _] = place;

        return Math.abs(r1 - r2) == 2;
    }

    // assuming move has already affected the game state,
    // is it possible for the moved piece to jump again?
    jumpAgainPossible(place) {
        var placements = this.getPossibleMoves2(place);

        for (var i = 0; i < placements.length; i++) {
            var newPlace = placements[i];


            if (Checkers.isJump(place, newPlace)) {
                return true;
            }
        }

        return false;
    }

    static getJumpedPiece(select, place) {

        var [r1, c1] = select;
        var [r2, c2] = place;
        var r3, c3;

        if (r1 - r2 > 1 && c1 - c2 > 1) {
            r3 = r1 - 1;
            c3 = c1 - 1;
        } else if (r1 - r2 > 1 && c2 - c1 > 1) {
            r3 = r1 - 1;
            c3 = c2 - 1;
        } else if (r2 - r1 > 1 && c1 - c2 > 1) {
            r3 = r2 - 1;
            c3 = c1 - 1;
        } else if (r2 - r1 > 1 && c2 - c1 > 1) {
            r3 = r2 - 1;
            c3 = c2 - 1;
        }

        if (r3 == undefined) {
            return undefined;
        } else {
            return [r3, c3];
        }
    }

    selectAndPlace(select, place) {

        var jumpedPiece = Checkers.getJumpedPiece(select, place);

        assert(this.isCheckersMoveValid(move));

        var [beginRow, beginCol] = [move.coordBegin.row, move.coordBegin.col];
        var [endRow, endCol] = [move.coordEnd.row, move.coordEnd.col];

        var endCheckersPiece = this.matrix[endRow][endCol];
        var beginCheckersPiece = this.matrix[beginRow][beginCol];

        endCheckersPiece.player = beginCheckersPiece.player;
        endCheckersPiece.king = beginCheckersPiece.king;

        beginCheckersPiece.player = CHECKERS.EMPTY;

        if (move.jumpOver != undefined) {
            var [row, col] = [move.jumpOver.row, move.jumpOver.col];
            this.matrix[row][col].player = CHECKERS.EMPTY;
        }

        if ((this.player == CHECKERS.UP_PLAYER && endRow == 0) || (
             this.player == CHECKERS.DOWN_PLAYER && endRow == this.numRows - 1)) {
            endCheckersPiece.king = true;
        }

        if (move.jumpOver != undefined && this.jumpAgainPossible(move)) {
            this.pieceMustPerformJump = move.coordEnd;
        } else {
            this.pieceMustPerformJump = undefined;
            this.player = this.getOpponent();
            this.checkCheckersGameOver();
        }

        return new CheckersMove(
            move.coordBegin,
            move.coordEnd,
            move.jumpOver,
            move.player,
            endCheckersPiece.king,
            this.gameOver.deepCopy());
    }

    getPossibleMoves(row, col) {
        var moves =  this.getPossibleMoves2(new Coordinate(row, col));
        var rc = [];

        for (var i = 0; i < moves.length; i++) {
            var move = moves[i];
            rc.push([move.coordEnd.row, move.coordEnd.col]);
        }

        return rc;
    }

    // todo make elegant and dedup
    getPossibleMoves2(coord) {
        if (this.gameOver.isGameOver()) {
            return [];
        }

        if (!this.validPieceToCheckersMove(coord)) {
            return [];
        }

        if (this.pieceMustPerformJump != undefined &&
            !this.pieceMustPerformJump.equals(coord)) {
            return [];
        }

        var jumpPossible = this.availableJump();

        var cell = this.matrix[coord.row][coord.col];

        var moves = [];

        if (this.player == CHECKERS.UP_PLAYER || cell.king) {
            moves = moves
                .concat(this.getJumpUpLeft(coord))
                .concat(this.getJumpUpRight(coord));
        }

        if (this.player == CHECKERS.DOWN_PLAYER || cell.king) {
            moves = moves
                .concat(this.getJumpDownLeft(coord))
                .concat(this.getJumpDownRight(coord));
        }


        if (moves.length == 0 && !jumpPossible) {

            if (this.player == CHECKERS.UP_PLAYER || cell.king) {
                moves = moves
                    .concat(this.getCheckersMoveUpLeft(coord))
                    .concat(this.getCheckersMoveUpRight(coord));
            }

            if (this.player == CHECKERS.DOWN_PLAYER || cell.king) {
                moves = moves
                    .concat(this.getCheckersMoveDownLeft(coord))
                    .concat(this.getCheckersMoveDownRight(coord));
            }
        }

        // temporary
        for (var i = 0; i < moves.length; i++) {
            assert(this.isCheckersMoveValid(moves[i]));
        }

        return moves;

    }

    // TODO better function name
    validPieceToCheckersMove(coord) {
        return this.matrix[coord.row][coord.col].player == this.player;
    }

    // returns a list of PlayerCheckersCoordinate objects
    // TODO: code dedup
    getInitPosition() {
        var NUM_ROWS_PER_PLAYER = 3;
        assert(this.numRows >= NUM_ROWS_PER_PLAYER * 2);

        var pcs = []

        for (var row = 0; row < NUM_ROWS_PER_PLAYER; row++) {
            var startColumn;

            if (row % 2 == 0) {
                startColumn = 0;
            } else {
                startColumn = 1;
            }

            for (var col = startColumn; col < this.numCols; col += 2) {
                var pc =
                    new PlayerCheckersCoordinate(CHECKERS.DOWN_PLAYER, new CheckersCoordinate(row, col));

                pcs.push(pc);
            }
        }

        var firstRow = this.numRows - NUM_ROWS_PER_PLAYER - 1;
        for (var row = this.numRows - 1; row > firstRow; row--) {
            var startColumn;

            if (row % 2 == 0) {
                startColumn = 0;
            } else {
                startColumn = 1;
            }

            for (var col = startColumn; col < this.numCols; col += 2) {
                var pc =
                    new PlayerCheckersCoordinate(CHECKERS.UP_PLAYER, new CheckersCoordinate(row, col));

                pcs.push(pc);
            }
        }

        return pcs;

    }

    getImageFilename(piece) {
        if (piece.player == CHECKERS.EMPTY) {
            return undefined;
        } else if (piece.player == CHECKERS.RED) {
            if (piece.king) {
                return "checkers/img/red-king.png";
            } else {
                return "checkers/img/red.png";
            }
        } else {
            assert(piece.player == CHECKERS.BLACK);
            if (piece.king) {
                return "checkers/img/black-king.png";
            } else {
                return "checkers/img/black.png";
            }
        } 
    }


    // player is either PLAYER_ONE or PLAYER_TWO, and indicates which player has
    // the next move
    constructor() {

        this.player = PLAYER_ONE;
        this.numRows = 8;
        this.numCols = 8;
        this.gameOver = new GameOver();

        // if defined, this.pieceMustPerformJump is the coordinate
        // for the piece that must perform a jump this turn.
        // this only happens as one step in a multi jump
        this.pieceMustPerformJump = undefined;

        this.matrix = new Array(this.numRows);
        for (var row = 0; row < this.numRows; row++) {
            this.matrix[row] = new Array(this.numCols);
            for (var col = 0; col < this.numCols; col++) {
                this.matrix[row][col] = new CheckersPiece(CHECKERS.EMPTY, false);
            }
        }

        // TODO Document
        var initPosition = this.getInitPosition();
        for (var i = 0; i < initPosition.length; i++) {
            var pc = initPosition[i];
            this.matrix[pc.coord.row][pc.coord.col].player = pc.player;
        }

        // this.player always equals the player (either PLAYER_ONE or
        // PLAYER_TWO) who has the next move.
        this.player = PLAYER_ONE;

        this.gamerConfig = {
            clickMode: CLICK_MODE_SELECT_AND_PLACE,
            checkered: true,
            lightSquareColor: "lightgray",
            darkSquareColor: "darkgray",
            possibleMoveBoxShadow: "0px 0px 0px 2px black inset",
            selectPieceBoxShadow: "0px 0px 0px 2px red inset",
            squareMargin: 2
        }
    }

    deepCopy() {
        var newGame = new Checkers(this.player, this.numRows, this.numCols);

        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {
                newGame.matrix[row][col] = this.matrix[row][col].deepCopy();
            }
        }

        // CheckersCoordinates are immutable
        newGame.pieceMustPerformJump = this.pieceMustPerformJump;


        // We do not need to make a deepCopy of this.gameOver
        // because this.gameOver is immutable
        newGame.gameOver = this.gameOver.deepCopy();

        return newGame;
    }

    countPieces(player) {
        var count = 0;

        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {
                var piece = this.matrix[row][col];
                if (piece.player == player) {
                    count += 1;
                }
            }
        }

        return count;
    }

    countKingPieces(player) {
        var count = 0;

        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {
                var piece = this.matrix[row][col];
                if (piece.player == player && piece.king) {
                    count += 1;
                }
            }
        }

        return count;
    }

    // TODO
    checkCheckersGameOver() {
        if (this.countPieces(PLAYER_ONE) == 0) {
            this.gameOver.victor = PLAYER_TWO;
        } else if (this.countPieces(PLAYER_TWO) == 0) {
            this.gameOver.victor = PLAYER_ONE;
        } else {
            for (var row = 0; row < this.numRows; row++) {
                for (var col = 0; col < this.numCols; col++) {
                    var coord = new Coordinate(row, col);
                    var moves = this.getPossibleMoves(row, col);
                    if (moves.length > 0) {
                        return;
                    }

                }
            }
            this.gameOver.victor = this.getOpponent();
        }
    }

}


/*******************************************************************************
 * CheckersNode class
 ******************************************************************************/

class CheckersNode {

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

    getNonLeafScore() {
        return this.game.countPieces(MAXIMIZING_PLAYER) +
               this.game.countKingPieces(MAXIMIZING_PLAYER) * 2 - 
               this.game.countPieces(MINIMIZING_PLAYER) -
               this.game.countKingPieces(MINIMIZING_PLAYER) * 2;   
    }

    // TODO: document
    getMaximize() {
        this.game.player == MAXIMIZING_PLAYER;
    }

    getScore() {
        if (this.game.gameOver.isGameOver()) {
            if (this.game.gameOver.victor == MAXIMIZING_PLAYER) {
                return Number.MAX_SAFE_INTEGER;
            } else if (this.game.gameOver.victor == MINIMIZING_PLAYER) {
                return Number.MIN_SAFE_INTEGER;
            } else {
                assert(this.game.gameOver.draw);
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
                var coord = new CheckersCoordinate(row, col);
                moves = moves.concat(this.game.getPossibleMoves2(coord));
            }
        }

        var children = [];

        for (var i = 0; i < moves.length; i++) {
            var move = moves[i];
            var newGame = this.game.deepCopy();
            newGame.makeMove2(move);
            var child = new CheckersNode(newGame, move);
            children.push(child);
        }

        return children;

    }
}

/*******************************************************************************
 * Add Chess to Gamer
 ******************************************************************************/

GAMER.addGame("Checkers", Checkers);

/*******************************************************************************
 * Add chess AI's to Gamer
 ********************************s**********************************************/

function checkersMinMaxDepth1(checkersGame) {
    return getBestMove(new CheckersNode(checkersGame), 1);
}

function checkersMinMaxDepth2(checkersGame) {
    return getBestMove(new CheckersNode(checkersGame), 2);
}

function checkersMinMaxDepth3(checkersGame) {
    return getBestMove(new CheckersNode(checkersGame), 3);
}

function checkersMinMaxDepth4(checkersGame) {
    return getBestMove(new CheckersNode(checkersGame), 4);
}

function checkersMinMaxDepth5(checkersGame) {
    return getBestMove(new CheckersNode(checkersGame), 5);
}

function checkersMinMaxDepth6(checkersGame) {
    return getBestMove(new CheckersNode(checkersGame), 6);
}

GAMER.addAi("Checkers", "checkersMinMaxDepth1", checkersMinMaxDepth1);
GAMER.addAi("Checkers", "checkersMinMaxDepth2", checkersMinMaxDepth2);
GAMER.addAi("Checkers", "checkersMinMaxDepth3", checkersMinMaxDepth3);
GAMER.addAi("Checkers", "checkersMinMaxDepth4", checkersMinMaxDepth4);
GAMER.addAi("Checkers", "checkersMinMaxDepth5", checkersMinMaxDepth5);
GAMER.addAi("Checkers", "checkersMinMaxDepth6", checkersMinMaxDepth6);

