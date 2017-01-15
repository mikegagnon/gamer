function assert(condition) {
    if (!condition) {
        console.error("Assertion failed");
    }
}

NUM_ROWS = 3;
NUM_COLS = 3;

EMPTY = 0;
PLAYER_X = 1;
PLAYER_O = 2;

var FIRST_PLAYER = undefined;

if (Math.random() < 0.5) {
    FIRST_PLAYER = PLAYER_X;
} else {
    FIRST_PLAYER = PLAYER_O;
}

/*******************************************************************************
 * Move is the interface between TicTacToe and Viz
 ******************************************************************************/
class Move {
    // valid == true iff the move results in change in game state
    // (row, col) are the coordinates that player added their mark
    // player is either PLAYER_X or PLAYER_O, depending on who made the move
    // gameOver is either undefined (which signifies the game has not concluded)
    // or gameOver is a GameOver object, representing the conclusion of the game
    constructor(valid, row, col, player, gameOver) {
        this.valid = valid;
        this.row = row;
        this.col = col;
        this.player = player;
        this.gameOver = gameOver;
    }
}

/*******************************************************************************
 * GameOver
 ******************************************************************************/
// GameOver objects store information about the end of the game.
class GameOver {

    // There are two fields in a GameOver object:
    //      1. this.victor
    //      2. this.victoryCells
    //
    // this.victor
    // ===========
    // this.victor is equal to one of the following:
    //      (A) undefined
    //      (B) PLAYER_X
    //      (C) PLAYER_O
    //
    // if this.victor == undefined, then that indicates the game ended ina draw
    // if this.victor == PLAYER_X, then that indicates PLAYER_X won the game
    // if this.victor == PLAYER_O, then that indicates PLAYER_O won the game
    //
    // this.victoryCells
    // =================
    // this.victoryCells is either:
    //      (A) undefined
    //      (B) a list of three [row, col] pairs
    //
    // if this.victoryCells == undefined, then that indicates the game ended in
    // a draw.
    //
    // if this.victoryCells is a list of three [row, col] pairs, then that
    // indicates the game has ended in a victory. Furthermore the three 
    // [row, col] pairs indicate which cells contain the winning 3-in-a-row
    // marks.
    // 
    // As an example: this.victoryCells might equal [[0,0], [1,1], [2, 2]].
    // This denotes that (row 0, col 0), (row 1, col 1), and (row 2, col 2)
    // constitute the three cells that contain the winning 3-in-a-row marks.
    constructor(victor, victoryCells) {
        this.victor = victor;
        this.victoryCells = victoryCells;

        // Make GameOver immutable
        Object.freeze(this);
        Object.freeze(this.victor);
        Object.freeze(this.victoryCells);
    }
}

/*******************************************************************************
 * TicTacToe class
 ******************************************************************************/
class TicTacToe {

    // player is either PLAYER_X or PLAYER_O, and indicates which player has
    // the opening move
    constructor(player) {
        this.matrix = [
            [EMPTY, EMPTY, EMPTY],
            [EMPTY, EMPTY, EMPTY],
            [EMPTY, EMPTY, EMPTY]
        ];

        assert(player == PLAYER_X || player == PLAYER_O);

        // this.player always equals the player (either PLAYER_X or PLAYER_O)
        // who has the next move.
        this.player = player;

        // If the game is over, then this.gameOver equals a GameOver object
        // that describes the properties of the conclusion of the game
        // If the game is not over, then this.gameOver is undefined;
        this.gameOver = undefined;

    }

    deepCopy() {
        var newTicTacToe = new TicTacToe(this.player);

        for (var row = 0; row < NUM_ROWS; row++) {
            for (var col = 0; col < NUM_COLS; col++) {
                newTicTacToe.matrix[row][col] = this.matrix[row][col];
            }
        }

        // We do not need to make a deepCopy of this.gameOver
        // because this.gameOver is immutable
        newTicTacToe.gameOver = this.gameOver;

        return newTicTacToe;
    }

    checkVictoryHorizontal() {
        for (var row = 0; row < NUM_ROWS; row++) {
            var a = this.matrix[row][0];
            var b = this.matrix[row][1];
            var c = this.matrix[row][2];

            if (a == b && b == c && a != EMPTY) {
                this.gameOver = new GameOver(a, [[row, 0], [row, 1], [row, 2]]);
            }
        }
    }

    checkVictoryVertical() {
        for (var col = 0; col < NUM_COLS; col++) {
            var a = this.matrix[0][col];
            var b = this.matrix[1][col];
            var c = this.matrix[2][col];

            if (a == b && b == c && a != EMPTY) {
                this.gameOver = new GameOver(a, [[0, col], [1, col], [2, col]]);
            }
        }
    }

    checkVictoryDiagonal() {
        var a = this.matrix[0][0];
        var b = this.matrix[1][1];
        var c = this.matrix[2][2];
        if (a == b && b == c && a != EMPTY) {
            this.gameOver = new GameOver(a, [[0, 0], [1, 1], [2, 2]]);
        }

        var a = this.matrix[0][2];
        var b = this.matrix[1][1];
        var c = this.matrix[2][0];
        if (a == b && b == c && a != EMPTY) {
            this.gameOver = new GameOver(a, [[0, 2], [1, 1], [2, 0]]);
        }
    }

    checkDraw() {
        for (var row = 0; row < NUM_ROWS; row++) {
            for (var col = 0; col < NUM_COLS; col++) {
                if (this.matrix[row][col] == EMPTY) {
                    return;
                }
            }
        }

        this.gameOver = new GameOver(undefined, undefined);
    }


    // Determines whether or not the game has reached its conclusion.
    // If the game is over, then sets this.gameOver to a GameOver object
    // representing the conclusion of the game.
    checkGameOver() {
        this.checkVictoryHorizontal();
        this.checkVictoryVertical();
        this.checkVictoryDiagonal();
        if (this.gameOver == undefined) {
            this.checkDraw();
        }
    }

    makeMove(row, col) {

        assert(row >= 0 && row < NUM_ROWS);
        assert(col >= 0 && col < NUM_COLS);

        if (this.matrix[row][col] != EMPTY || this.gameOver != undefined) {
            return new Move(false, undefined, undefined, undefined);
        } 

        this.matrix[row][col] = this.player;

        this.checkGameOver();

        var move = new Move(true, row, col, this.player, this.gameOver);

        if (this.player == PLAYER_X) {
            this.player = PLAYER_O;
        } else {
            this.player = PLAYER_X;
        }

        return move;
    }

}

/*******************************************************************************
 * Node class
 ******************************************************************************/

class Node {

    // ticTacToe is an instance of the TicTacToe class
    // move is either undefined (signifying this node is the root of the game
    // game tree), or move is an instance of the Move class and represents
    // the move from this node's parent to this node.
    constructor(ticTacToe, move = undefined) {
        this.ticTacToe = ticTacToe;
        this.move = move;
    }

    getMove() {
        return this.move;
    }

    isLeaf() {
        return this.ticTacToe.gameOver != undefined;
    }

    // Player X is always the maximizing player
    getScore() {
        assert(this.ticTacToe.gameOver != undefined);

        if (this.ticTacToe.gameOver.victor == undefined) {
            return 0;
        } else if (this.ticTacToe.gameOver.victor == PLAYER_X) {
            return 1;
        } else {
            return -1;
        }
    }

    // Recall, in a game tree every node (except a leaf node)
    // is a parent. The children of a parent represent
    // all the possible moves a parent can make.
    getChildren() {

        var childrenNodes = [];

        for (var row = 0; row < NUM_ROWS; row++) {
            for (var col = 0; col < NUM_COLS; col++) {

                // We need to add a `deepCopy()` method to the
                // TicTacToe class, which returns a deep copy
                // of the ticTacToe object. A deep copy is 
                // necessary so that when we call
                // childGame.makeMove(row, col) it doesn't modify
                // the game state of the parent.
                var childGame = this.ticTacToe.deepCopy();

                var move = childGame.makeMove(row, col);

                if (move.valid) {
                    var childNode = new Node(childGame, move);
                    childrenNodes.push(childNode);
                }
            }
        }

        assert(childrenNodes.length > 0);

        return childrenNodes;
    }
}

/*******************************************************************************
 * Vizualization code
 ******************************************************************************/
 class Viz {
    
    static getCellId(row, col) {
        return "cell-" + row + "-" + col;
    }

    getImgTag(player) {
        var filename;
        if (player == PLAYER_X) {
            filename = "player-x.png";
        } else if (player == PLAYER_O) {
            filename = "player-o.png";
        } else {
            assert(false);
        }

        return "<img src='" + filename + "' width=" + this.cell_size + " >";
    }

    constructor(cell_size) {
        this.cell_size = cell_size;

        $(".cell").css("height", this.cell_size);
        $(".cell").css("width", this.cell_size);
    }

    drawMove(move) {
        if (!move.valid) {
            return;
        }

        var cellId = Viz.getCellId(move.row, move.col);
        var imgTag = this.getImgTag(move.player);
        $("#" + cellId).append(imgTag);

        if (move.gameOver != undefined &&
            move.gameOver.victoryCells != undefined) {

            for (var i = 0; i < move.gameOver.victoryCells.length; i++) {
                var [row, col] = move.gameOver.victoryCells[i];

                var cellId = Viz.getCellId(row, col);
                $("#" + cellId).css("background-color", "#F7DC6F");

            }
        }
    }
 }

/*******************************************************************************
 * AI code
 ******************************************************************************/

function makeAiMove(game) {

    assert(game.gameOver == undefined);

    var node = new Node(game);

    // The AI is always the O player, thus is always the minimizing player
    var [bestMove, _] = minMax(node, false);

    return game.makeMove(bestMove.row, bestMove.col);
}

/*******************************************************************************
 * Controller code
 ******************************************************************************/
var GAME = new TicTacToe(FIRST_PLAYER);
var VIZ = new Viz(100);

if (FIRST_PLAYER == PLAYER_O) {
    move = makeAiMove(GAME);
    VIZ.drawMove(move);
}

function cellClick(row, col) {

    var move = GAME.makeMove(row, col);
    VIZ.drawMove(move);

    if (move.valid && !GAME.gameOver) {
        move = makeAiMove(GAME);
        VIZ.drawMove(move);
    }

}

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
function minMax(node, maximizingPlayer) {
    if (node.isLeaf()) {
        return [node.getMove(), node.getScore()];
    }

    // If the node wants to maximize its score:
    if (maximizingPlayer) {
        var bestScore = Number.MIN_SAFE_INTEGER;
        var bestMove = undefined;

        // find the child with the highest score
        var children = node.getChildren();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var [_, childScore] = minMax(child, false);
            bestScore = Math.max(childScore, bestScore);

            if (bestScore == childScore) {
                bestMove = child.getMove();
            }

        }
        return [bestMove, bestScore];
    }

    // If the node wants to minimize its score:
    else {
        var bestScore = Number.MAX_SAFE_INTEGER;
        var bestMove = undefined;

        // find the child with the lowest score
        var children = node.getChildren();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var [_, childScore] = minMax(child, true);
            bestScore = Math.min(childScore, bestScore);

            if (bestScore == childScore) {
                bestMove = child.getMove();
            }
        }
        return [bestMove, bestScore];
    }
}

/*******************************************************************************
 * TESTS
 ******************************************************************************/

// Returns true iff the matrices are equal 
function matricesEqual(matrix1, matrix2) {
    for (row = 0; row < NUM_ROWS; row++) {
        for (col = 0; col < NUM_COLS; col++) {
            if (matrix1[row][col] != matrix2[row][col]) {
                return false;
            }
        }
    }

    return true;
}

// Test player-x makeMove(0, 0)
var game = new TicTacToe(PLAYER_X);
game.makeMove(0, 0);
var expected_matrix = [
    [PLAYER_X, EMPTY, EMPTY],
    [EMPTY,    EMPTY, EMPTY],
    [EMPTY,    EMPTY, EMPTY]
]
assert(matricesEqual(game.matrix, expected_matrix));

// Test player-x makeMove(1, 1)
var game = new TicTacToe(PLAYER_X);
game.makeMove(1, 1);
var expected_matrix = [
    [EMPTY,    EMPTY,    EMPTY],
    [EMPTY,    PLAYER_X, EMPTY],
    [EMPTY,    EMPTY,    EMPTY]
]
assert(matricesEqual(game.matrix, expected_matrix));

// Test opening player as PLAYER_O
var game = new TicTacToe(PLAYER_O);
game.makeMove(0, 0);
var expected_matrix = [
    [PLAYER_O, EMPTY,    EMPTY],
    [EMPTY,    EMPTY,    EMPTY],
    [EMPTY,    EMPTY,    EMPTY]
]
assert(matricesEqual(game.matrix, expected_matrix));

// Test X then O then X
var game = new TicTacToe(PLAYER_X);
game.makeMove(1, 1);
game.makeMove(0, 0);
game.makeMove(2, 2);
var expected_matrix = [
    [PLAYER_O, EMPTY,    EMPTY],
    [EMPTY,    PLAYER_X, EMPTY],
    [EMPTY,    EMPTY,    PLAYER_X]
]
assert(matricesEqual(game.matrix, expected_matrix));

// Test invalid move
var game = new TicTacToe(PLAYER_X);
game.makeMove(0, 0);
var move = game.makeMove(0, 0);
assert(!move.valid);
var expected_matrix = [
    [PLAYER_X, EMPTY, EMPTY],
    [EMPTY,    EMPTY, EMPTY],
    [EMPTY,    EMPTY, EMPTY]
]
assert(matricesEqual(game.matrix, expected_matrix));

/* TESTS for checkGameOver ****************************************************/

// Vertical victories
var game = new TicTacToe(PLAYER_X);
game.matrix = [
    [PLAYER_X,    EMPTY,    EMPTY],
    [PLAYER_X,    EMPTY,    EMPTY],
    [PLAYER_X,    EMPTY,    EMPTY]
];
game.checkGameOver()
assert(game.gameOver.victor == PLAYER_X);
assert(matricesEqual(game.gameOver.victoryCells, [[0,0], [1,0], [2,0]]));

var game = new TicTacToe(PLAYER_X);
game.matrix = [
    [EMPTY,    PLAYER_O,    EMPTY],
    [EMPTY,    PLAYER_O,    EMPTY],
    [EMPTY,    PLAYER_O,    EMPTY]
];
game.checkGameOver()
assert(game.gameOver.victor == PLAYER_O);
assert(matricesEqual(game.gameOver.victoryCells, [[0,1], [1,1], [2,1]]));

var game = new TicTacToe(PLAYER_X);
game.matrix = [
    [EMPTY,    EMPTY,    PLAYER_O],
    [EMPTY,    EMPTY,    PLAYER_O],
    [EMPTY,    EMPTY,    PLAYER_O]
];

game.checkGameOver()
assert(game.gameOver.victor == PLAYER_O);
assert(matricesEqual(game.gameOver.victoryCells, [[0,2], [1,2], [2,2]]));

// Horizonal victories
var game = new TicTacToe(PLAYER_X);
game.matrix = [
    [PLAYER_X, PLAYER_X, PLAYER_X],
    [EMPTY,    EMPTY,    EMPTY],
    [EMPTY,    EMPTY,    EMPTY]
];
game.checkGameOver()
assert(game.gameOver.victor == PLAYER_X);
assert(matricesEqual(game.gameOver.victoryCells, [[0,0], [0,1], [0,2]]));

var game = new TicTacToe(PLAYER_X);
game.matrix = [
    [EMPTY,    EMPTY,    EMPTY],
    [PLAYER_X, PLAYER_X, PLAYER_X],
    [EMPTY,    EMPTY,    EMPTY]
];
game.checkGameOver()
assert(game.gameOver.victor == PLAYER_X);
assert(matricesEqual(game.gameOver.victoryCells, [[1,0], [1,1], [1,2]]));

var game = new TicTacToe(PLAYER_X);
game.matrix = [
    [EMPTY,    EMPTY,    EMPTY],
    [EMPTY,    EMPTY,    EMPTY],
    [PLAYER_X, PLAYER_X, PLAYER_X],
];
game.checkGameOver()
assert(game.gameOver.victor == PLAYER_X);
assert(matricesEqual(game.gameOver.victoryCells, [[2,0], [2,1], [2,2]]));

// Diagonal victories
var game = new TicTacToe(PLAYER_X);
game.matrix = [
    [PLAYER_X, EMPTY,    EMPTY],
    [EMPTY,    PLAYER_X, EMPTY],
    [EMPTY,    EMPTY,    PLAYER_X]
];
game.checkGameOver()
assert(game.gameOver.victor == PLAYER_X);
assert(matricesEqual(game.gameOver.victoryCells, [[0,0], [1,1], [2,2]]));

var game = new TicTacToe(PLAYER_X);
game.matrix = [
    [EMPTY,    EMPTY,    PLAYER_O],
    [EMPTY,    PLAYER_O, EMPTY],
    [PLAYER_O, EMPTY,    EMPTY]
];
game.checkGameOver()
assert(game.gameOver.victor == PLAYER_O);
assert(matricesEqual(game.gameOver.victoryCells, [[0,2], [1,1], [2,0]]));

// Draws
var game = new TicTacToe(PLAYER_X);
game.matrix = [
    [PLAYER_O, PLAYER_X, PLAYER_O],
    [PLAYER_X, PLAYER_X, PLAYER_O],
    [PLAYER_O, PLAYER_O, PLAYER_X]
];
game.checkGameOver()
assert(game.gameOver.victor == undefined);
assert(game.gameOver.victoryCells == undefined);

/*******************************************************************************
 * MinMax test
 ******************************************************************************/

class DummyNode {

    constructor(children, move, score = undefined) {
        this.children = children;
        this.move = move;
        this.score = score;
    }

    getMove() {
        return this.move;
    }

    isLeaf() {
        return this.children.length == 0;
    }

    getScore() {
        assert(this.isLeaf());
        return this.score;
    }

    getChildren() {
        return this.children;
    }
}

// The game tree illustrated in
// https://github.com/mikegagnon/tic-tac-toe/blob/master/crystal-balls-5.png

// Red is maximinzing
// Blue is minimizing

// Red layer leaf nodes
var leafA = new DummyNode([], "left", 1);
var leafB = new DummyNode([], "right", 0);
var leafC = new DummyNode([], "left", -1);
var leafD = new DummyNode([], "right", 0);

var leafE = new DummyNode([], "left", 1);
var leafF = new DummyNode([], "right", -1);
var leafG = new DummyNode([], "left", 0);
var leafH = new DummyNode([], "right", -1);

var leafI = new DummyNode([], "left", 1);
var leafJ = new DummyNode([], "right", 0);
var leafK = new DummyNode([], "left", -1);
var leafL = new DummyNode([], "right", 0);

var leafM = new DummyNode([], "left", 1);
var leafN = new DummyNode([], "right", 1);
var leafO = new DummyNode([], "left", 1);
var leafP = new DummyNode([], "right", 1);

// Blue layer
var nodeA = new DummyNode([leafA, leafB], "left");
var nodeB = new DummyNode([leafC, leafD], "right");
var nodeC = new DummyNode([leafE, leafF], "left");
var nodeD = new DummyNode([leafG, leafH], "right");
var nodeE = new DummyNode([leafI, leafJ], "left");
var nodeF = new DummyNode([leafK, leafL], "right");
var nodeG = new DummyNode([leafM, leafN], "left");
var nodeH = new DummyNode([leafO, leafP], "right");

// Red layer
var nodeI = new DummyNode([nodeA, nodeB], "left");
var nodeJ = new DummyNode([nodeC, nodeD], "right");
var nodeK = new DummyNode([nodeE, nodeF], "left");
var nodeL = new DummyNode([nodeG, nodeH], "right");

// Blue layer
var nodeM = new DummyNode([nodeI, nodeJ], "left");
var nodeN = new DummyNode([nodeK, nodeL], "right");

// Red layer
var nodeRoot = new DummyNode([nodeM, nodeN], undefined);

// Assertions
assert(minMax(nodeA, false)[0] == "right");
assert(minMax(nodeA, false)[1] == 0);
assert(minMax(nodeB, false)[0] == "left");
assert(minMax(nodeB, false)[1] == -1);
assert(minMax(nodeC, false)[0] == "right");
assert(minMax(nodeC, false)[1] == -1);
assert(minMax(nodeD, false)[0] == "right");
assert(minMax(nodeD, false)[1] == -1);
assert(minMax(nodeE, false)[0] == "right");
assert(minMax(nodeE, false)[1] == 0);
assert(minMax(nodeF, false)[0] == "left");
assert(minMax(nodeF, false)[1] == -1);
//assert(minMax(nodeG, false)[0] == "turn doesn't matter");
assert(minMax(nodeG, false)[1] == 1);
//assert(minMax(nodeH, false)[0] == "turn doesn't matter");
assert(minMax(nodeH, false)[1] == 1);

assert(minMax(nodeI, true)[0] == "left");
assert(minMax(nodeI, true)[1] == 0);
//assert(minMax(nodeJ, true)[0] == "turn doesn't matter");
assert(minMax(nodeJ, true)[1] == -1);
assert(minMax(nodeK, true)[0] == "left");
assert(minMax(nodeK, true)[1] == 0);
assert(minMax(nodeL, true)[0] == "right");
assert(minMax(nodeL, true)[1] == 1);

assert(minMax(nodeM, false)[0] == "right");
assert(minMax(nodeM, false)[1] == -1);
assert(minMax(nodeN, false)[0] == "left");
assert(minMax(nodeN, false)[1] == 0);

assert(minMax(nodeRoot, true)[0] == "right");
assert(minMax(nodeRoot, true)[1] == 0);


/*******************************************************************************
 * MinMax test for TicTacToe
 ******************************************************************************/

// Rather than deeply test minMax for TicTacToe, we will test to see if
// minMax chooses the best move in "fork" situations.
//
// For additional info on forks, see:
// See https://savvavy.wordpress.com/2015/02/01/how-to-beat-medium-cat-dog-toe/
//
// Fork test 1: block the fork
// ===========================
//
// Here is the board:
//
// Figure 1.
//
//    O _ _
//    _ X _
//    _ _ X
//
// If X can play the bottom-left corner (or the top right corner),
// then X acquires a "fork" position. Which means, there are two places
// X can play to get three-in-a-row. To clarify, let's assume O makes a
// bad move (0, 1):
//
// Figure 2.
//
//    O O _
//    _ X _
//    _ _ X
//
// Then, X would make the following move to create a fork (0, 2):
//
// Figure 3.
//
//    O O X
//    _ X _
//    _ _ X
//
// Now, X can score a three-in-a-row by playing (1, 2) or (2, 0).
// Therefore, O must block one of those spots, but the other spot remains
// open, and X is guaranteed a win:
//
// Figure 4:
//
//    O O X
//    _ X O
//    X _ X
//
// The point of all of this, is that in Figure 1, O must play (0, 2) or
// (2, 0). If O doesn't make one of those moves, then X is guaranteed
// to have the opportunity to make a fork and win the game.
// 
var game = new TicTacToe(PLAYER_O);

game.matrix = [
    [PLAYER_O, EMPTY,    EMPTY],
    [EMPTY,    PLAYER_X, EMPTY],
    [EMPTY,    EMPTY,    PLAYER_X]
]

var node = new Node(game);

var [bestMove, _] = minMax(node, false);

assert((bestMove.row == 0 && bestMove.col == 2) ||
       (bestMove.row == 2 && bestMove.col == 0));

// Fork test 2: create a fork
// ==========================
//
// Figure 5.
//
//      _ _ _
//      _ O X
//      X O O
//
// In this configuration, O has a fork position, it can play
// (0, 0) or (0, 1) to win. Regardless of X's move, O will win.
//
// Figure 6.
//
//      _ _ _
//      _ _ X
//      X O O
//
// Assuming it is O's turn here, O's optimal move is to play (1, 1)
// to create the fork, which guarantees the win.
// 
// In this test, we create the board configuration from Figure 6
// and test to see if O plays (1, 1)

var game = new TicTacToe(PLAYER_O);
game.matrix = [
    [EMPTY,    EMPTY,    EMPTY],
    [EMPTY,    EMPTY,    PLAYER_X],
    [PLAYER_X, PLAYER_O, PLAYER_O]
]

var node = new Node(game);

var [bestMove, _] = minMax(node, false);

assert(bestMove.row == 1 && bestMove.col == 1);

// Fork test 3: force a fork
// =========================
//
// Figure 7.
// 
//      _ _ _
//      _ _ X
//      _ _ O
//
// Assuming it is O's turn, what is O's optimal move.
//  - If O plays (2, 1), then X will be forced to play (2, 0)
//    to avoid O getting three in a row.
//  - Recall, this creates the board configuration from Figure 6.
//  - Therefore, in Figure 7, if O plays (2, 1) O is guaranteed a win.
//
// In this test we create the board configuaration from Figure 7,
// then test to see if the O player chooses the optimal move,
// which is (2, 1)

var game = new TicTacToe(PLAYER_O);
game.matrix = [
    [EMPTY,    EMPTY,    EMPTY],
    [EMPTY,    EMPTY,    PLAYER_X],
    [EMPTY,    EMPTY,    PLAYER_O]
]

var node = new Node(game);

var [bestMove, _] = minMax(node, false);

assert(bestMove.row == 2 && bestMove.col == 1);
