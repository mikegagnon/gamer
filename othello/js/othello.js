
OTHELLO = {
    NUM_ROWS: 8,
    NUM_COLS: 8,
    EMPTY: 0
}

/*******************************************************************************
 * Othello class
 ******************************************************************************/
class Othello {

    // player is either PLAYER_ONE or PLAYER_TWO, and indicates which player has
    // the next move
    constructor(
        player = PLAYER_ONE,
        numRows = OTHELLO.NUM_ROWS,
        numCols = OTHELLO.NUM_COLS) {

        assert(numRows % 2 == 0);
        assert(numCols % 2 == 0);
        assert(player == PLAYER_ONE || player == PLAYER_TWO);

        this.numRows = numRows;
        this.numCols = numCols;

        this.matrix = new Array(this.numRows);
        for (var row = 0; row < this.numRows; row++) {
            this.matrix[row] = new Array(this.numCols);
            for (var col = 0; col < this.numCols; col++) {
                this.matrix[row][col] = OTHELLO.EMPTY;
            }
        }

        // Set the opening placements
        var openingMoves = this.getOpeningPlacements();
        for (var i = 0; i < openingMoves.length; i++) {
            var [place, placePlayer] = openingMoves[i];
            var [row, col] = place;
            this.matrix[row][col] = placePlayer;
        }

        // this.player always equals the player (either PLAYER_ONE or
        // PLAYER_TWO) who has the next move.
        this.player = player;

        this.gameOver = new GameOver();

        this.gamerConfig = {
            clickMode: CLICK_MODE_PLACE,
            checkered: false,
            squarColor: "#4EBB62",
            squareMargin: 3
        }
    }

    getImageFilename(piece) {
        if (piece == CONNECT_FOUR.EMPTY) {
            return undefined;
        } else if (piece == PLAYER_ONE) {
            return "othello/img/player-1.png";
        } else {
            return "othello/img/player-2.png";
        }
    }

    static getOpponent(player) {
        if (player == PLAYER_ONE) {
            return PLAYER_TWO;
        } else {
            return PLAYER_ONE;
        }
    }

    getPossiblePlacements() {
        var placements = []

        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {
                var place = [row, col];
                if (this.isValidPlacement(place)) {
                    placements.push(place);
                }
            }
        }

        return placements;

    }

    getOpeningPlacements() {
        return [
            [[this.numRows / 2,     this.numCols / 2],     PLAYER_ONE],
            [[this.numRows / 2 - 1, this.numCols / 2 - 1], PLAYER_ONE],
            [[this.numRows / 2 - 1, this.numCols / 2],     PLAYER_TWO],
            [[this.numRows / 2,     this.numCols / 2 - 1], PLAYER_TWO]
        ]
    }

    deepCopy() {
        var newGame = new Othello(this.player, this.numRows, this.numCols);

        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {
                newGame.matrix[row][col] = this.matrix[row][col];
            }
        }

        newGame.gameOver = this.gameOver.deepCopy();

        return newGame;
    }

    isMoveInvalid(row, col, numCaptured) {
        return this.matrix[row][col] != OTHELLO.EMPTY ||
               this.gameOver.isGameOver() ||
               numCaptured == 0;
    }

    getCell(row, col) {
        if (!(row >= 0 && row < this.numRows &&
               col >= 0 && col < this.numCols)) {
            return undefined;
        } else {
            return this.matrix[row][col];
        }
    }

    tryCaptureDrDc(player, row, col, dr, dc) {

        var otherPlayer = Othello.getOpponent(player);

        var captured = [];

        row += dr;
        col += dc;

        while (this.getCell(row, col) == otherPlayer) {
            captured.push([row, col]);
            row += dr;
            col += dc;
        }

        if (this.getCell(row, col) == player)  {
            return captured;
        } else {
            return [];
        }
    }

    tryCapture(player, row, col) {
        var capturedUp = this.tryCaptureDrDc(player, row, col, -1, 0);
        var capturedDown = this.tryCaptureDrDc(player, row, col, 1, 0);
        var capturedLeft = this.tryCaptureDrDc(player, row, col, 0, -1);
        var capturedRight = this.tryCaptureDrDc(player, row, col, 0, 1);

        var capturedDiagonal1 = this.tryCaptureDrDc(player, row, col, 1, 1);
        var capturedDiagonal2 = this.tryCaptureDrDc(player, row, col, 1, -1);
        var capturedDiagonal3 = this.tryCaptureDrDc(player, row, col, -1, 1);
        var capturedDiagonal4 = this.tryCaptureDrDc(player, row, col, -1, -1);

        return capturedUp
            .concat(capturedDown)
            .concat(capturedLeft)
            .concat(capturedRight)
            .concat(capturedDiagonal1)
            .concat(capturedDiagonal2)
            .concat(capturedDiagonal3)
            .concat(capturedDiagonal4)
    }

    isValidPlacement(place) {
        var [row, col] = place;
        var captured = this.tryCapture(this.player, row, col);
        return !this.isMoveInvalid(row, col, captured.length);

    }

    placePiece(place) {

        var [row, col] = place;

        assert(row >= 0 && row < this.numRows);
        assert(col >= 0 && col < this.numCols);

        var captured = this.tryCapture(this.player, row, col);

        assert(!this.isMoveInvalid(row, col, captured.length));

        for (var i = 0; i < captured.length; i++) {
            var [r, c] = captured[i];
            this.matrix[r][c] = this.player;
        } 

        this.matrix[row][col] = this.player;

        this.checkGameOver();

        this.player = Othello.getOpponent(this.player);

        // If this.player must pass
        if (!this.gameOver.isGameOver() && !this.canMove(this.player)) {
            this.player = Othello.getOpponent(this.player);
        }

        return undefined;
    }

    // returns true iff player has a valid move
    canMove(player) {
        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {

                var captured = this.tryCapture(player, row, col);

                if (!this.isMoveInvalid(row, col, captured.length)) {
                    return true;
                } 

            }
        }

        return false;
    }

    checkGameOver() {
        if (!this.canMove(PLAYER_ONE) && !this.canMove(PLAYER_TWO)) {
            var count = {};
            count[PLAYER_ONE] = this.countPieces(PLAYER_ONE);
            count[PLAYER_TWO] = this.countPieces(PLAYER_TWO);

            if (count[PLAYER_ONE] == count[PLAYER_TWO]) {
                this.gameOver.draw = true;
            } else if (count[PLAYER_ONE] > count[PLAYER_TWO]) {
                this.gameOver.victor = PLAYER_ONE;
            } else {
                this.gameOver.victor = PLAYER_TWO;
            }
        }
    }

    countPieces(player) {
        var count = 0;

        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {
                if (this.matrix[row][col] == player) {
                    count += 1;
                }
            }
        }

        return count;
    }
}


/*******************************************************************************
 * Node class
 ******************************************************************************/

class OthelloNode {

    constructor(game, move = undefined) {
        this.game = game;
        this.move = move;
    }

    getMove() {
        return this.move;
    }

    getMaximize() {
        return this.game.player == MAXIMIZING_PLAYER;
    }

    isLeaf() {
        return this.game.gameOver.isGameOver();
    }

    getNumAvailableMoves(player) {
        var count = 0;

        for (var row = 0; row < this.game.numRows; row++) {
            for (var col = 0; col < this.game.numCols; col++) {

                var captured = this.game.tryCapture(player, row, col);
                var numCaptured = captured.length;

                if (!this.game.isMoveInvalid(row, col, numCaptured)) {
                    count += 1;
                }
            }
        }

        return count;
    }

    isPotential(player, row, col) {
        if (this.game.matrix[row][col] != Othello.getOpponent(player)) {
            return false;
        }

        // The row above
        var a = this.game.getCell(row - 1, col - 1);
        var b = this.game.getCell(row - 1, col);
        var c = this.game.getCell(row - 1, col + 1);

        // The row below
        var d = this.game.getCell(row + 1, col - 1);
        var e = this.game.getCell(row + 1, col);
        var f = this.game.getCell(row + 1, col + 1);

        // to the left
        var g = this.game.getCell(row, col - 1);

        // to the right
        var h = this.game.getCell(row, col + 1);

        return  a == EMPTY ||
                b == EMPTY ||
                c == EMPTY ||
                d == EMPTY ||
                e == EMPTY ||
                f == EMPTY ||
                g == EMPTY ||
                h == EMPTY;
    }

    getNumPotential(player) {
        var count = 0;

        for (var row = 0; row < this.game.numRows; row++) {
            for (var col = 0; col < this.game.numCols; col++) {

                if (this.isPotential(player, row, col)) {
                    count += 1;
                }
            }
        }

        return count;   
    }

    getNumCorners(player) {
        var numRows = this.game.numRows;
        var numCols = this.game.numCols;
        var corners =
            [[0, 0],
             [0, numCols - 1],
             [numRows - 1, 0],
             [numRows - 1, numCols - 1]];

        var count = 0;

        for (var i = 0; i < corners.length; i++) {
            var [row, col] = corners[i];
            if (this.game.matrix[row][col] == player) {
                count += 1;
            }
        }

        return count;
    }

    // http://home.datacomm.ch/t_wolf/tw/misc/reversi/html/index.html
    // http://www.samsoft.org.uk/reversi/strategy.htm
    getNonLeafScore() {
        var numPieces =
            this.game.countPieces(MAXIMIZING_PLAYER) -
            this.game.countPieces(MINIMIZING_PLAYER);

        var numAvailableMoves =
            this.getNumAvailableMoves(MAXIMIZING_PLAYER) -
            this.getNumAvailableMoves(MINIMIZING_PLAYER);

        var numPotential =
            this.getNumPotential(MAXIMIZING_PLAYER) -
            this.getNumPotential(MINIMIZING_PLAYER);

        var numCorners =
            this.getNumCorners(MAXIMIZING_PLAYER) -
            this.getNumCorners(MINIMIZING_PLAYER);

        return numPieces +
               numCorners * 20 +
               numAvailableMoves * 6 +
               numPotential * 2;
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

        var childrenNodes = [];

        for (var row = 0; row < this.game.numRows; row++) {
            for (var col = 0; col < this.game.numCols; col++) {

                var place = [row, col];

                if (this.game.isValidPlacement(place)) {

                    var childGame = this.game.deepCopy();
                    childGame.placePiece(place);

                    var childNode = new OthelloNode(childGame, place);
                    childrenNodes.push(childNode);
                }
            }
        }

        assert(childrenNodes.length > 0);

        return childrenNodes;
    }
}

/*******************************************************************************
 * Add Othello to Gamer
 ******************************************************************************/

GAMER.addGame("Othello", Othello);

/*******************************************************************************
 * Add Othello AI's to Gamer
 ********************************s**********************************************/

function othelloMinMax1(game) {
    return getBestMove(new OthelloNode(game), 1);
}

function othelloMinMax2(game) {
    return getBestMove(new OthelloNode(game), 2);
}

function othelloMinMax3(game) {
    return getBestMove(new OthelloNode(game), 3);
}

function othelloMinMax4(game) {
    return getBestMove(new OthelloNode(game), 4);
}

function othelloMinMax5(game) {
    return getBestMove(new OthelloNode(game), 5);
}

function othelloMinMax6(game) {
    return getBestMove(new OthelloNode(game), 6);
}


GAMER.addAi("Othello", "MiniMax (depth 6)", othelloMinMax6);
GAMER.addAi("Othello", "MiniMax (depth 5)", othelloMinMax5);
GAMER.addAi("Othello", "MiniMax (depth 4)", othelloMinMax4);
GAMER.addAi("Othello", "MiniMax (depth 3)", othelloMinMax3);
GAMER.addAi("Othello", "MiniMax (depth 2)", othelloMinMax2);
GAMER.addAi("Othello", "MiniMax (depth 1)", othelloMinMax1);
