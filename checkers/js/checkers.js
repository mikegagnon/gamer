

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
    OOB: 0,
    EMPTY: new CheckersPiece(undefined, false),
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
            return CHECKERS.OOB;
        }
    }

    // TODO: dedup: refactor jumps into drdc
    getJumpUpLeft(select) {
        var [row, col] = select;
        var opponent = this.getOpponent();
        if (this.getPiece(row - 1, col - 1) != CHECKERS.OOB && 
            this.getPiece(row - 1, col - 1).player == opponent &&
            this.getPiece(row - 2, col - 2) == CHECKERS.EMPTY) {
            var place = [row - 2, col - 2];
            return [place];
        } else {
            return [];
        }
    }

    getJumpUpRight(select) {
        var [row, col] = select;
        var opponent = this.getOpponent();
        if (this.getPiece(row - 1, col + 1) != CHECKERS.OOB &&
            this.getPiece(row - 1, col + 1).player == opponent &&
            this.getPiece(row - 2, col + 2) == CHECKERS.EMPTY) {
            var place = [row - 2, col + 2];
            return [place];
        } else {
            return [];
        }
    }

    getJumpDownLeft(select) {
        var [row, col] = select;
        var opponent = this.getOpponent();
        if (this.getPiece(row + 1, col - 1) != CHECKERS.OOB &&
            this.getPiece(row + 1, col - 1).player == opponent &&
            this.getPiece(row + 2, col - 2) == CHECKERS.EMPTY) {
            var place = [row + 2, col - 2];
            return [place];
        } else {
            return [];
        }
    }

    getJumpDownRight(select) {
        var [row, col] = select;
        var opponent = this.getOpponent();
        if (this.getPiece(row + 1, col + 1) != CHECKERS.OOB &&
            this.getPiece(row + 1, col + 1).player == opponent &&
            this.getPiece(row + 2, col + 2) == CHECKERS.EMPTY) {
            var place = [row + 2, col + 2];
            return [place];
        } else {
            return [];
        }
    }

    // TODO: simplify with drdc
    getCheckersMoveUpLeft(select) {
        var [row, col] = select;
        
        if (this.getPiece(row - 1, col - 1) == CHECKERS.EMPTY) {
            var place = [row - 1, col - 1];
            return [place];
        } else {
            return [];
        }
    }

    getCheckersMoveUpRight(select) {
        var [row, col] = select;

        if (this.getPiece(row - 1, col + 1) == CHECKERS.EMPTY) {
            var place = [row - 1, col + 1];
            return [place];
        } else {
            return [];
        }
    }

    getCheckersMoveDownLeft(select) {
        var [row, col] = select;

        if (this.getPiece(row + 1, col - 1) == CHECKERS.EMPTY) {
            var place = [row + 1, col - 1];
            return [place];
        } else {
            return [];
        }
    }

    getCheckersMoveDownRight(select) {
        var [row, col] = select;

        if (this.getPiece(row + 1, col + 1) == CHECKERS.EMPTY) {
            var place = [row + 1, col + 1];
            return [place];
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
        var placements = this.getPossiblePlacements(place);

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

        var [selectRow, selectCol] = select;
        var [placeRow, placeCol] = place;

        var selectPiece = this.matrix[selectRow][selectCol];
        this.matrix[selectRow][selectCol] = CHECKERS.EMPTY;
        this.matrix[placeRow][placeCol] = selectPiece;

        var jumpedPiece = Checkers.getJumpedPiece(select, place);
        if (jumpedPiece != undefined) {
            var [row, col] = jumpedPiece;
            this.matrix[row][col] = CHECKERS.EMPTY;
        }

        if ((this.player == CHECKERS.UP_PLAYER && placeRow == 0) ||
            (this.player == CHECKERS.DOWN_PLAYER &&
            placeRow == this.numRows - 1)) {

            this.matrix[placeRow][placeCol].king = true;
        }

        if (jumpedPiece != undefined && this.jumpAgainPossible(place)) {
            this.pieceMustPerformJump = place;
        } else {
            this.pieceMustPerformJump = undefined;
            this.player = this.getOpponent();
            this.checkGameOver();
        }
    }

    getPossiblePlacements(select) {

        var [selectRow, selectCol] = select;

        if (this.gameOver.isGameOver()) {
            return [];
        }

        if (!this.validPieceToMove(select)) {
            return [];
        }

        if (this.pieceMustPerformJump != undefined) {
            var [r, c] = this.pieceMustPerformJump;
            if (r != selectRow || c != selectCol) {
                return [];
            }
        }

        var jumpPossible = this.availableJump();

        var piece = this.matrix[selectRow][selectCol];

        var placements = [];

        if (this.player == CHECKERS.UP_PLAYER || piece.king) {
            placements = placements
                .concat(this.getJumpUpLeft(select))
                .concat(this.getJumpUpRight(select));
        }

        if (this.player == CHECKERS.DOWN_PLAYER || piece.king) {
            placements = placements
                .concat(this.getJumpDownLeft(select))
                .concat(this.getJumpDownRight(select));
        }


        if (placements.length == 0 && !jumpPossible) {

            if (this.player == CHECKERS.UP_PLAYER || piece.king) {
                placements = placements
                    .concat(this.getCheckersMoveUpLeft(select))
                    .concat(this.getCheckersMoveUpRight(select));
            }

            if (this.player == CHECKERS.DOWN_PLAYER || piece.king) {
                placements = placements
                    .concat(this.getCheckersMoveDownLeft(select))
                    .concat(this.getCheckersMoveDownRight(select));
            }
        }

        return placements;

    }

    // TODO better function name
    validPieceToMove(select) {
        var [r, c] = select;
        return this.matrix[r][c].player == this.player;
    }

    // returns a list of [row, col, player] objects
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
                var pc = [row, col, CHECKERS.DOWN_PLAYER];
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
                var pc = [row, col, CHECKERS.UP_PLAYER];
                pcs.push(pc);
            }
        }

        return pcs;

    }

    getImageFilename(piece) {
        if (piece == CHECKERS.EMPTY) {
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
                this.matrix[row][col] = CHECKERS.EMPTY;
            }
        }

        // TODO Document
        var initPosition = this.getInitPosition();
        for (var i = 0; i < initPosition.length; i++) {
            var [row, col, player] = initPosition[i];
            this.matrix[row][col] = new CheckersPiece(player, false);
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
        var newGame = new Checkers();

        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {
                if (this.matrix[row][col] == CHECKERS.EMPTY) {
                    newGame.matrix[row][col] = CHECKERS.EMPTY    
                } else {
                    newGame.matrix[row][col] = this.matrix[row][col].deepCopy();
                }
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
                if (piece != CHECKERS.EMPTY && piece.player == player) {
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
                if (piece != CHECKERS.EMPTY && piece.player == player &&
                    piece.king) {

                    count += 1;
                }
            }
        }

        return count;
    }

    // TODO
    checkGameOver() {
        if (this.countPieces(PLAYER_ONE) == 0) {
            this.gameOver.victor = PLAYER_TWO;
        } else if (this.countPieces(PLAYER_TWO) == 0) {
            this.gameOver.victor = PLAYER_ONE;
        } else {
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
                var select = [row, col];
                var placements = this.game.getPossiblePlacements(select)
                for (var i = 0; i < placements.length; i++) {
                    var place = placements[i];
                    var move = [select, place];
                    moves.push(move);
                }
            }
        }

        var children = [];

        for (var i = 0; i < moves.length; i++) {
            var [select, place] = moves[i];
            var newGame = this.game.deepCopy();
            newGame.selectAndPlace(select, place);
            var child = new CheckersNode(newGame, [select, place]);
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

