
CONNECT_FOUR = {
    EMPTY: 0,
    MIN_MAX_THREE_WEIGHT: 10
}

/*******************************************************************************
 * ConnectFour class
 ******************************************************************************/
class ConnectFour {

    // player is either PLAYER_ONE or PLAYER_TWO, and indicates which player has
    // the next move
    constructor(player = PLAYER_ONE, numRows = 6, numCols = 7) {
        this.numRows = numRows;
        this.numCols = numCols;

        this.matrix = new Array(this.numRows);
        for (var row = 0; row < this.numRows; row++) {
            this.matrix[row] = new Array(this.numCols);
            for (var col = 0; col < this.numCols; col++) {
                this.matrix[row][col] = CONNECT_FOUR.EMPTY;
            }
        }

        assert(player == PLAYER_ONE || player == PLAYER_TWO);

        // this.player always equals the player (either PLAYER_ONE or
        // PLAYER_TWO) who has the next move.
        this.player = player;


        // If the game is over, then this.gameOver equals a GameOver object
        // that describes the properties of the conclusion of the game
        // If the game is not over, then this.gameOver is undefined.
        this.gameOver = new GameOver();

        this.gamerConfig = {
            clickMode: CLICK_MODE_PLACE,
            checkered: false,
            squarColor: "lightgray",
            squareMargin: 3
        }
    }

    getImageFilename(piece) {
        if (piece == CONNECT_FOUR.EMPTY) {
            return undefined;
        } else if (piece == PLAYER_ONE) {
            return "connect-four/img/player-1.png";
        } else {
            return "connect-four/img/player-2.png";
        }
    }

    deepCopy() {
        var newGame = new ConnectFour(this.player, this.numRows, this.numCols);

        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {
                newGame.matrix[row][col] = this.matrix[row][col];
            }
        }

        // We do not need to make a deepCopy of this.gameOver
        // because this.gameOver is immutable
        newGame.gameOver = this.gameOver.deepCopy();

        return newGame;
    }


    isValidPlacement(place) {
        var [row, col] = place;
        return this.matrix[row][col] == CONNECT_FOUR.EMPTY &&
            !this.gameOver.isGameOver() &&
            (row == this.numRows - 1 ||
             this.matrix[row + 1][col] != CONNECT_FOUR.EMPTY);
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

    placePiece(place) {

        var [row, col] = place;

        assert(row >= 0 && row < this.numRows);
        assert(col >= 0 && col < this.numCols);

        this.matrix[row][col] = this.player;

        this.checkGameOver();

        if (this.player == PLAYER_ONE) {
            this.player = PLAYER_TWO;
        } else {
            this.player = PLAYER_ONE;
        }

        return undefined;
    }

    getCellValue(row, col) {
        if (row >= 0 &&
            row < this.numRows &
            col >= 0 &
            col < this.numCols) {
            return this.matrix[row][col];
        } else {
            return undefined;
        }
    }

    checkVictorHorizontal(row, col) {
        var a = this.getCellValue(row, col);
        var b = this.getCellValue(row, col + 1);
        var c = this.getCellValue(row, col + 2);
        var d = this.getCellValue(row, col + 3);
        if (a == b && a == c && a == d) {
            this.gameOver.victor = a;
        }
    }

    checkVictorVertical(row, col) {
        var a = this.getCellValue(row, col);
        var b = this.getCellValue(row + 1, col);
        var c = this.getCellValue(row + 2, col);
        var d = this.getCellValue(row + 3, col);
        if (a == b && a == c && a == d) {
            this.gameOver.victor = a;
        }
    }

    checkVictorDiagonal(row, col) {
        var a = this.getCellValue(row, col);
        var b = this.getCellValue(row + 1, col + 1);
        var c = this.getCellValue(row + 2, col + 2);
        var d = this.getCellValue(row + 3, col + 3);
        if (a == b && a == c && a == d) {
            this.gameOver.victor = a;
        }

        var a = this.getCellValue(row, col);
        var b = this.getCellValue(row + 1, col - 1);
        var c = this.getCellValue(row + 2, col - 2);
        var d = this.getCellValue(row + 3, col - 3);
        if (a == b && a == c && a == d) {
            this.gameOver.victor = a;
        }
    }


    checkVictor(row, col) {
        this.checkVictorHorizontal(row, col);
        this.checkVictorVertical(row, col);
        this.checkVictorDiagonal(row, col);
    }

    checkDraw() {
        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {
                if (this.matrix[row][col] == CONNECT_FOUR.EMPTY) {
                    return;
                }
            }
        }

        this.gameOver.draw = true;
    }

    checkGameOver() {

        this.checkDraw();

        for (var row = 0; row < this.numRows; row++) {
            for (var col =0; col < this.numCols; col++) {
                if (this.matrix[row][col] != CONNECT_FOUR.EMPTY) {
                    this.checkVictor(row, col);
                }
            }
        }
    }
}


/*******************************************************************************
 * C4Node class
 ******************************************************************************/

class C4Node {

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

    getMaximize() {
        return this.game.player == MAXIMIZING_PLAYER;
    }

    countThreeHorizontal(player, row, col) {
        var beforeA = this.game.getCellValue(row, col -1);
        var a = this.game.getCellValue(row, col);
        var b = this.game.getCellValue(row, col + 1);
        var c = this.game.getCellValue(row, col + 2);
        var afterC = this.game.getCellValue(row, col + 3);

        if (a == player && a == b && a == c &&
            (beforeA == CONNECT_FOUR.EMPTY || afterC == CONNECT_FOUR.EMPTY)) {
            return 1;
        } else {
            return 0;
        }
    }

    countThreeVertical(player, row, col) {
        var beforeA = this.game.getCellValue(row - 1, col);
        var a = this.game.getCellValue(row, col);
        var b = this.game.getCellValue(row + 1, col);
        var c = this.game.getCellValue(row + 2, col);
        var afterC = this.game.getCellValue(row + 3, col);

        if (a == player && a == b && a == c &&
            (beforeA == CONNECT_FOUR.EMPTY || afterC == CONNECT_FOUR.EMPTY)) {
            return 1;
        } else {
            return 0;
        }
    }

    countThreeDiagonal(player, row, col) {
        var count = 0;

        var beforeA = this.game.getCellValue(row - 1, col - 1);
        var a = this.game.getCellValue(row, col);
        var b = this.game.getCellValue(row + 1, col + 1);
        var c = this.game.getCellValue(row + 2, col + 2);
        var afterC = this.game.getCellValue(row + 3, col + 3);
        if (a == player && a == b && a == c &&
            (beforeA == CONNECT_FOUR.EMPTY || afterC == CONNECT_FOUR.EMPTY)) {
            count += 1;
        }

        var beforeA = this.game.getCellValue(row - 1, col + 1);
        var a = this.game.getCellValue(row, col);
        var b = this.game.getCellValue(row + 1, col - 1);
        var c = this.game.getCellValue(row + 2, col - 2);
        var afterC = this.game.getCellValue(row + 3, col - 3);
        if (a == player && a == b && a == c &&
            (beforeA == CONNECT_FOUR.EMPTY || afterC == CONNECT_FOUR.EMPTY)) {
            count += 1;
        }

        return count;
    }


    countTwoHorizontal(player, row, col) {
        var beforeBeforeA = this.game.getCellValue(row, col - 2);
        var beforeA = this.game.getCellValue(row, col - 1);
        var a = this.game.getCellValue(row, col);
        var b = this.game.getCellValue(row, col + 1);
        var afterB = this.game.getCellValue(row, col + 2);
        var afterAfterB = this.game.getCellValue(row, col + 3);

        var goodSpacing =
            (beforeA == CONNECT_FOUR.EMPTY && beforeBeforeA == CONNECT_FOUR.EMPTY) ||
            (beforeA == CONNECT_FOUR.EMPTY && afterB == CONNECT_FOUR.EMPTY) ||
            (afterB == CONNECT_FOUR.EMPTY && afterAfterB == CONNECT_FOUR.EMPTY);

        if (a == player && a == b && goodSpacing) {
            return 1;
        } else {
            return 0;
        }
    }

    countTwoVertical(player, row, col) {
        var beforeBeforeA = this.game.getCellValue(row - 2, col);
        var beforeA = this.game.getCellValue(row - 1, col);
        var a = this.game.getCellValue(row, col);
        var b = this.game.getCellValue(row + 1, col);
        var afterB = this.game.getCellValue(row + 2, col);
        var afterAfterB = this.game.getCellValue(row + 3, col);

        var goodSpacing =
            (beforeA == CONNECT_FOUR.EMPTY && beforeBeforeA == CONNECT_FOUR.EMPTY) ||
            (beforeA == CONNECT_FOUR.EMPTY && afterB == CONNECT_FOUR.EMPTY) ||
            (afterB == CONNECT_FOUR.EMPTY && afterAfterB == CONNECT_FOUR.EMPTY);

        if (a == player && a == b && goodSpacing) {
            return 1;
        } else {
            return 0;
        }
    }

    countTwoDiagonal(player, row, col) {
        var count = 0;

        var beforeBeforeA = this.game.getCellValue(row - 2, col -2);
        var beforeA = this.game.getCellValue(row - 1, col - 1);
        var a = this.game.getCellValue(row, col);
        var b = this.game.getCellValue(row + 1, col + 1);
        var afterB = this.game.getCellValue(row + 2, col + 2);
        var afterAfterB = this.game.getCellValue(row + 3, col + 3);

        var goodSpacing =
            (beforeA == CONNECT_FOUR.EMPTY && beforeBeforeA == CONNECT_FOUR.EMPTY) ||
            (beforeA == CONNECT_FOUR.EMPTY && afterB == CONNECT_FOUR.EMPTY) ||
            (afterB == CONNECT_FOUR.EMPTY && afterAfterB == CONNECT_FOUR.EMPTY);

        if (a == player && a == b && goodSpacing) {
            count += 1;
        }

        var beforeBeforeA = this.game.getCellValue(row - 2, col +2);
        var beforeA = this.game.getCellValue(row - 1, col + 1);
        var a = this.game.getCellValue(row, col);
        var b = this.game.getCellValue(row + 1, col - 1);
        var afterB = this.game.getCellValue(row + 2, col - 2);
        var afterAfterB = this.game.getCellValue(row + 3, col - 3);

        var goodSpacing =
            (beforeA == CONNECT_FOUR.EMPTY && beforeBeforeA == CONNECT_FOUR.EMPTY) ||
            (beforeA == CONNECT_FOUR.EMPTY && afterB == CONNECT_FOUR.EMPTY) ||
            (afterB == CONNECT_FOUR.EMPTY && afterAfterB == CONNECT_FOUR.EMPTY);

        if (a == player && a == b && goodSpacing) {
            count += 1;
        }

        return count;
    }

    countThree(player) {
        var count = 0;

        for (var row = 0; row < this.game.numRows; row++) {
            for (var col = 0; col < this.game.numCols; col++) {
                count += this.countThreeHorizontal(player, row, col) +
                         this.countThreeVertical(player, row, col) +
                         this.countThreeDiagonal(player, row, col);
            }
        }

        return count;
    }

    countTwo(player) {
        var count = 0;

        for (var row = 0; row < this.game.numRows; row++) {
            for (var col = 0; col < this.game.numCols; col++) {
                count += this.countTwoHorizontal(player, row, col) +
                         this.countTwoVertical(player, row, col) +
                         this.countTwoDiagonal(player, row, col);
            }
        }

        return count;
    }

    getNonLeafScore() {
        var scorePlayerMax =
            this.countThree(MAXIMIZING_PLAYER) * CONNECT_FOUR.MIN_MAX_THREE_WEIGHT +
            this.countTwo(MAXIMIZING_PLAYER);

        var scorePlayerMin =
            this.countThree(MINIMIZING_PLAYER) * CONNECT_FOUR.MIN_MAX_THREE_WEIGHT +
            this.countTwo(MINIMIZING_PLAYER);

        return scorePlayerMax - scorePlayerMin;
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

        var childrenNodes = [];

        for (var row = 0; row < this.game.numRows; row++) {
            for (var col = 0; col < this.game.numCols; col++) {

                var place = [row, col];
                if (this.game.isValidPlacement(place)) {

                    var childGame = this.game.deepCopy();

                    childGame.placePiece(place);

                    var childNode = new C4Node(childGame, place);
                    childrenNodes.push(childNode);
                }
            }
        }

        assert(childrenNodes.length > 0);

        return childrenNodes;
    }
}

/*******************************************************************************
 * Add Connect Four to Gamer
 ******************************************************************************/

GAMER.addGame("Connect Four", ConnectFour);

/*******************************************************************************
 * Add Connect Four AI's to Gamer
 ********************************s**********************************************/

function c4MinMax1(game) {
    return getBestMove(new C4Node(game), 1);
}

function c4MinMax2(game) {
    return getBestMove(new C4Node(game), 2);
}

function c4MinMax3(game) {
    return getBestMove(new C4Node(game), 3);
}

function c4MinMax4(game) {
    return getBestMove(new C4Node(game), 4);
}

function c4MinMax5(game) {
    return getBestMove(new C4Node(game), 5);
}

function c4MinMax6(game) {
    return getBestMove(new C4Node(game), 6);
}


GAMER.addAi("Connect Four", "MiniMax (depth 6)", c4MinMax6);
GAMER.addAi("Connect Four", "MiniMax (depth 5)", c4MinMax5);
GAMER.addAi("Connect Four", "MiniMax (depth 4)", c4MinMax4);
GAMER.addAi("Connect Four", "MiniMax (depth 3)", c4MinMax3);
GAMER.addAi("Connect Four", "MiniMax (depth 2)", c4MinMax2);
GAMER.addAi("Connect Four", "MiniMax (depth 1)", c4MinMax1);
