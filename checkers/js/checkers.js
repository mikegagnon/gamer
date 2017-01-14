

// Todo hline of stars
class CheckersCoordinate {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        Object.freeze(this);
    }

    equals(coord) {
        return this.row == coord.row && this.col == coord.col;
    }
}

class PlayerCheckersCoordinate {
    constructor(player, coord) {
        this.player = player;
        this.coord = coord;
    }
}

/*******************************************************************************
 * CheckersMove is the interface between Checkers and Viz
 ******************************************************************************/
class CheckersMove {
    // TODO: document
    // todo switch to begin and end instead of coordBegin...
    // to change jumpOver to jumped
    constructor(coordBegin, coordEnd, jumpOver, player, king, gameOver) {
        this.coordBegin = coordBegin;
        this.coordEnd = coordEnd;
        this.jumpOver = jumpOver;
        this.player = player;
        this.king = king;
        this.gameOver = gameOver;
    }
}

/*******************************************************************************
 * CheckersGameOver
 ******************************************************************************/
// CheckersGameOver objects store information about the end of the game.
class CheckersGameOver {

    // There are two fields in a CheckersGameOver object:
    //      1. this.victor
    //      2. this.victoryCheckersCells
    //
    // this.victor
    // ===========
    // this.victor is equal to one of the following:
    //      (A) undefined
    //      (B) PLAYER_ONE
    //      (C) PLAYER_TWO
    //
    // if this.victor == undefined, then that indicates the game ended in a draw
    // if this.victor == PLAYER_ONE, then that indicates PLAYER_ONE won the game
    // if this.victor == PLAYER_TWO, then that indicates PLAYER_TWO won the game
    //
    constructor(victor) {
        this.victor = victor;

        // Make CheckersGameOver immutable
        Object.freeze(this);
    }
}


/*******************************************************************************
 * CheckersCell class
 ******************************************************************************/
class CheckersCell {
    // player == PLAYER_ONE or
    // player == PLAYER_TWO or
    // player == CHECKERS.EMPTY or
    // player == undefined, which means out of bounds
    constructor(player, king) {
        this.player = player;
        this.king = king;
    }

    deepCopy() {
        var newCheckersCell = new CheckersCell(this.player, this.king);
        return newCheckersCell;
    }
}

CHECKERS = {
    OOB_CELL: new CheckersCell(undefined, false),
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

    // TODO: use
    static getOpponent(player) {
        if (player == PLAYER_ONE) {
            return PLAYER_TWO;
        } else {
            return PLAYER_ONE;
        }
    }

    getJumpUpLeft(begin) {
        var opponent = Checkers.getOpponent(this.player);
        if (this.getCheckersCell(begin.row - 1, begin.col - 1).player == opponent &&
            this.getCheckersCell(begin.row - 2, begin.col - 2).player == CHECKERS.EMPTY) {
            var jumpedOver = new CheckersCoordinate(begin.row - 1, begin.col - 1);
            var end = new CheckersCoordinate(begin.row - 2, begin.col - 2);
            var king = this.getCheckersCell(begin.row, begin.col).king;
            var move = new CheckersMove(begin, end, jumpedOver, this.player, king, undefined);
            return [move];
        } else {
            return [];
        }
    }

    getJumpUpRight(begin) {
        var opponent = Checkers.getOpponent(this.player);
        if (this.getCheckersCell(begin.row - 1, begin.col + 1).player == opponent &&
            this.getCheckersCell(begin.row - 2, begin.col + 2).player == CHECKERS.EMPTY) {
            var jumpedOver = new CheckersCoordinate(begin.row - 1, begin.col + 1);
            var end = new CheckersCoordinate(begin.row - 2, begin.col + 2);
            var king = this.getCheckersCell(begin.row, begin.col).king;
            var move = new CheckersMove(begin, end, jumpedOver, this.player, king, undefined);
            return [move];
        } else {
            return [];
        }
    }

    getJumpDownLeft(begin) {
        var opponent = Checkers.getOpponent(this.player);
        if (this.getCheckersCell(begin.row + 1, begin.col - 1).player == opponent &&
            this.getCheckersCell(begin.row + 2, begin.col - 2).player == CHECKERS.EMPTY) {
            var jumpedOver = new CheckersCoordinate(begin.row + 1, begin.col - 1);
            var end = new CheckersCoordinate(begin.row + 2, begin.col - 2);
            var king = this.getCheckersCell(begin.row, begin.col).king;
            var move = new CheckersMove(begin, end, jumpedOver, this.player, king, undefined);
            return [move];
        } else {
            return [];
        }
    }

    getJumpDownRight(begin) {
        var opponent = Checkers.getOpponent(this.player);
        if (this.getCheckersCell(begin.row + 1, begin.col + 1).player == opponent &&
            this.getCheckersCell(begin.row + 2, begin.col + 2).player == CHECKERS.EMPTY) {
            var jumpedOver = new CheckersCoordinate(begin.row + 1, begin.col + 1);
            var end = new CheckersCoordinate(begin.row + 2, begin.col + 2);
            var king = this.getCheckersCell(begin.row, begin.col).king;
            var move = new CheckersMove(begin, end, jumpedOver, this.player, king, undefined);
            return [move];
        } else {
            return [];
        }
    }

    // TODO: simplify with drdc
    getCheckersMoveUpLeft(coord) {
        if (this.getCheckersCell(coord.row - 1, coord.col - 1).player == CHECKERS.EMPTY) {
            var newCoord = new CheckersCoordinate(coord.row - 1, coord.col - 1);
            var king = this.getCheckersCell(coord.row, coord.col).king;
            var move = new CheckersMove(coord, newCoord, undefined, this.player, king, undefined);
            return [move];
        } else {
            return [];
        }
    }

    getCheckersMoveUpRight(coord) {
        if (this.getCheckersCell(coord.row - 1, coord.col + 1).player == CHECKERS.EMPTY) {
            var newCoord = new CheckersCoordinate(coord.row - 1, coord.col + 1);
            var king = this.getCheckersCell(coord.row, coord.col).king;
            var move = new CheckersMove(coord, newCoord, undefined, this.player, king, undefined);
            return [move];
        } else {
            return [];
        }
    }

    getCheckersMoveDownLeft(coord) {
        if (this.getCheckersCell(coord.row + 1, coord.col - 1).player == CHECKERS.EMPTY) {
            var newCoord = new CheckersCoordinate(coord.row + 1, coord.col - 1);
            var king = this.getCheckersCell(coord.row, coord.col).king;
            var move = new CheckersMove(coord, newCoord, undefined, this.player, king, undefined);
            return [move];
        } else {
            return [];
        }
    }

    getCheckersMoveDownRight(coord) {
        if (this.getCheckersCell(coord.row + 1, coord.col + 1).player == CHECKERS.EMPTY) {
            var newCoord = new CheckersCoordinate(coord.row + 1, coord.col + 1);
            var king = this.getCheckersCell(coord.row, coord.col).king;
            var move = new CheckersMove(coord, newCoord, undefined, this.player, king, undefined);
            return [move];
        } else {
            return [];
        }
    }

    // Returns true if this.player has at least one jump available
    availableJump() {

        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0 ; col < this.numCols; col++) {
                var coord = new CheckersCoordinate(row, col);
                var cell = this.matrix[row][col];

                if (cell.player == this.player) {

                    var jumps = [];

                    if (this.player == CHECKERS.UP_PLAYER || cell.king) {
                        jumps = jumps
                            .concat(this.getJumpUpLeft(coord))
                            .concat(this.getJumpUpRight(coord));
                    }

                    if (this.player == CHECKERS.DOWN_PLAYER || cell.king) {
                        jumps = jumps
                            .concat(this.getJumpDownLeft(coord))
                            .concat(this.getJumpDownRight(coord));
                    }

                    if (jumps.length > 0) {
                        return true;
                    }
                }

            }
        }

        return false;
    }

    // assuming move has already affected the game state,
    // is it possible for the moved piece to jump again?
    jumpAgainPossible(move) {
        var moves = this.getPossibleMoves2(move.coordEnd);

        for (var i = 0; i < moves.length; i++) {
            var move = moves[i];

            if (move.jumpOver != undefined) {
                return true;
            }
        }

        return false;
    }

        // constructor(coordBegin, coordEnd, jumpOver, player, king, gameOver) {

    selectAndPlaceMove(begin, end) {

        var [r1, c1] = begin;
        var [r2, c2] = end;
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

        var jumpOver = undefined;
        if (r3 != undefined) {
            jumpOver = new Coordinate(r3, c3);
        }

        var move = new CheckersMove(
            new Coordinate(begin[0], begin[1]),
            new Coordinate(end[0], end[1]),
            jumpOver,
            this.player,
            undefined,
            undefined);

        console.log(move);

        return this.makeMove2(move);
        //return this.makeMove2(move);
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
        if (this.gameOver != undefined) {
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

        // if defined, this.pieceMustPerformJump is the coordinate
        // for the piece that must perform a jump this turn.
        // this only happens as one step in a multi jump
        this.pieceMustPerformJump = undefined;

        this.matrix = new Array(this.numRows);
        for (var row = 0; row < this.numRows; row++) {
            this.matrix[row] = new Array(this.numCols);
            for (var col = 0; col < this.numCols; col++) {
                this.matrix[row][col] = new CheckersCell(CHECKERS.EMPTY, false);
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

        // If the game is over, then this.gameOver equals a CheckersGameOver object
        // that describes the properties of the conclusion of the game
        // If the game is not over, then this.gameOver is undefined.
        this.gameOver = undefined;

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
        newGame.gameOver = this.gameOver;

        return newGame;
    }

    // todo coord
    getCheckersCell(row, col) {
        if (!(row >= 0 && row < this.numRows &&
               col >= 0 && col < this.numCols)) {
            return CHECKERS.OOB_CELL;
        } else {
            return this.matrix[row][col];
        }
    }

    // TODO
    isCheckersMoveValid(move) {
        return true;
        var [beginRow, beginCol] = [move.coordBegin.row, move.coordBegin.col];
        if (this.getCheckersCell(beginRow, beginCol).player != move.player) {
            return false;
        }

        var [endRow, endCol] = [move.coordEnd.row, move.coordEnd.col];
        if (this.getCheckersCell(endRow, endCol).player != CHECKERS.EMPTY) {
            return false;
        }

        if (move.player == CHECKERS.UP_PLAYER && !move.king) {

            if (move.jumpOver != undefined) {

                if (endRow != beginRow - 2) {
                    return false;
                }

                if (endCol != beginCol - 2 &&
                    endCol != beginCol + 2) {
                    return false;
                }

                var [jumpRow, jumpCol] = [move.jumpOver.row, move.jumpOver.col];
                var opponent = Checkers.getOpponent(this.player);

                if (this.getCheckersCell(jumpRow, jumpCol).player != opponent) {
                    return false;
                }

            } else {
                if (endRow != beginRow - 1) {
                    return false;
                }

                if (endCol != beginCol - 1 &&
                    endCol != beginCol + 1) {
                    return false;
                }
            }
        } else if (move.player == CHECKERS.DOWN_PLAYER && !move.king) {
            if (move.jumpOver != undefined) {

                if (endRow != beginRow + 2) {
                    return false;
                }

                if (endCol != beginCol - 2 &&
                    endCol != beginCol + 2) {
                    return false;
                }

                var [jumpRow, jumpCol] = [move.jumpOver.row, move.jumpOver.col];
                var opponent = Checkers.getOpponent(this.player);

                if (this.getCheckersCell(jumpRow, jumpCol).player != opponent) {
                    return false;
                }

            } else {
                if (endRow != beginRow + 1) {
                    return false;
                }

                if (endCol != beginCol - 1 &&
                    endCol != beginCol + 1) {
                    return false;
                }
            }
        } else if (move.king) {
            if (move.jumpOver != undefined) {

                if (endRow != beginRow + 2 && endRow != beginRow - 2) {
                    return false;
                }

                if (endCol != beginCol - 2 &&
                    endCol != beginCol + 2) {
                    return false;
                }

                var [jumpRow, jumpCol] = [move.jumpOver.row, move.jumpOver.col];
                var opponent = Checkers.getOpponent(this.player);

                if (this.getCheckersCell(jumpRow, jumpCol).player != opponent) {
                    return false;
                }

            } else {
                if (endRow != beginRow + 1 && endRow != beginRow - 1 ) {
                    return false;
                }

                if (endCol != beginCol - 1 &&
                    endCol != beginCol + 1) {
                    return false;
                }
            }
        } else {
            assert(false);
        }

        return true;

    }

    // assumes move is valid
    makeMove2(move) {
        assert(this.isCheckersMoveValid(move));

        var [beginRow, beginCol] = [move.coordBegin.row, move.coordBegin.col];
        var [endRow, endCol] = [move.coordEnd.row, move.coordEnd.col];

        var endCheckersCell = this.matrix[endRow][endCol];
        var beginCheckersCell = this.matrix[beginRow][beginCol];

        endCheckersCell.player = beginCheckersCell.player;
        endCheckersCell.king = beginCheckersCell.king;

        beginCheckersCell.player = CHECKERS.EMPTY;

        if (move.jumpOver != undefined) {
            var [row, col] = [move.jumpOver.row, move.jumpOver.col];
            this.matrix[row][col].player = CHECKERS.EMPTY;
        }

        if ((this.player == CHECKERS.UP_PLAYER && endRow == 0) || (
             this.player == CHECKERS.DOWN_PLAYER && endRow == this.numRows - 1)) {
            endCheckersCell.king = true;
        }

        this.checkCheckersGameOver();

        if (move.jumpOver != undefined && this.jumpAgainPossible(move)) {
            this.pieceMustPerformJump = move.coordEnd;
        } else {
            this.pieceMustPerformJump = undefined;
            this.player = Checkers.getOpponent(this.player);
        }

        return new CheckersMove(
            move.coordBegin,
            move.coordEnd,
            move.jumpOver,
            move.player,
            endCheckersCell.king,
            this.gameOver);
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
            this.gameOver = new CheckersGameOver(PLAYER_TWO);
        } else if (this.countPieces(PLAYER_TWO) == 0) {
            this.gameOver = new CheckersGameOver(PLAYER_ONE);
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
        return this.game.gameOver != undefined;
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
        if (this.game.gameOver != undefined) {
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

function checkersMinMaxDepth4(checkersGame) {
    return getBestMove(new CheckersNode(checkersGame), 5);
}

function checkersMinMaxDepth4(checkersGame) {
    return getBestMove(new CheckersNode(checkersGame), 6);
}

GAMER.addAi("Checkers", "checkersMinMaxDepth1", checkersMinMaxDepth1);
GAMER.addAi("Checkers", "checkersMinMaxDepth2", checkersMinMaxDepth2);
GAMER.addAi("Checkers", "checkersMinMaxDepth3", checkersMinMaxDepth3);
GAMER.addAi("Checkers", "checkersMinMaxDepth4", checkersMinMaxDepth4);
GAMER.addAi("Checkers", "checkersMinMaxDepth5", checkersMinMaxDepth4);
GAMER.addAi("Checkers", "checkersMinMaxDepth6", checkersMinMaxDepth4);

