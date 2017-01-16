
TTT = {
    NUM_ROWS: 3,
    NUM_COLS: 3,
    EMPTY: 0
}


/*******************************************************************************
 * TicTacToe class
 ******************************************************************************/
class TicTacToe {

    // player is either PLAYER_ONE or PLAYER_TWO, and indicates which player has
    // the opening move
    constructor(player = PLAYER_ONE) {
        this.matrix = [
            [TTT.EMPTY, TTT.EMPTY, TTT.EMPTY],
            [TTT.EMPTY, TTT.EMPTY, TTT.EMPTY],
            [TTT.EMPTY, TTT.EMPTY, TTT.EMPTY]
        ];

        this.player = player;

        this.gameOver = new GameOver();
    }

    deepCopy() {
        var newTicTacToe = new TicTacToe();
        newTicTacToe.player = this.player;

        for (var row = 0; row < TTT.NUM_ROWS; row++) {
            for (var col = 0; col < TTT.NUM_COLS; col++) {
                newTicTacToe.matrix[row][col] = this.matrix[row][col];
            }
        }

        // We do not need to make a deepCopy of this.gameOver
        // because this.gameOver is immutable
        newTicTacToe.gameOver = this.gameOver.deepCopy();

        return newTicTacToe;
    }

    checkVictoryHorizontal() {
        for (var row = 0; row < TTT.NUM_ROWS; row++) {
            var a = this.matrix[row][0];
            var b = this.matrix[row][1];
            var c = this.matrix[row][2];

            if (a == b && b == c && a != TTT.EMPTY) {
                this.gameOver.victor = a;
            }
        }
    }

    checkVictoryVertical() {
        for (var col = 0; col < TTT.NUM_COLS; col++) {
            var a = this.matrix[0][col];
            var b = this.matrix[1][col];
            var c = this.matrix[2][col];

            if (a == b && b == c && a != TTT.EMPTY) {
                this.gameOver.victor = a;
            }
        }
    }

    checkVictoryDiagonal() {
        var a = this.matrix[0][0];
        var b = this.matrix[1][1];
        var c = this.matrix[2][2];
        if (a == b && b == c && a != TTT.EMPTY) {
            this.gameOver.victor = a;
        }

        var a = this.matrix[0][2];
        var b = this.matrix[1][1];
        var c = this.matrix[2][0];
        if (a == b && b == c && a != TTT.EMPTY) {
            this.gameOver.victor = a;
        }
    }

    checkDraw() {
        for (var row = 0; row < TTT.NUM_ROWS; row++) {
            for (var col = 0; col < TTT.NUM_COLS; col++) {
                if (this.matrix[row][col] == TTT.EMPTY) {
                    return;
                }
            }
        }

        this.gameOver.draw = true;
    }


    // Determines whether or not the game has reached its conclusion.
    // If the game is over, then sets this.gameOver to a GameOver object
    // representing the conclusion of the game.
    checkGameOver() {
        this.checkVictoryHorizontal();
        this.checkVictoryVertical();
        this.checkVictoryDiagonal();
        if (!this.gameOver.isGameOver()) {
            this.checkDraw();
        }
    }

    placePiece(place) {

        var [row, col] = place;

        assert(row >= 0 && row < TTT.NUM_ROWS);
        assert(col >= 0 && col < TTT.NUM_COLS);

        if (this.matrix[row][col] != TTT.EMPTY || this.gameOver.isGameOver()) {
            return undefined;
        } 

        this.matrix[row][col] = this.player;

        this.checkGameOver();

        if (this.player == PLAYER_ONE) {
            this.player = PLAYER_TWO;
        } else {
            this.player = PLAYER_ONE;
        }

        return undefined;
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
        return this.ticTacToe.gameOver.isGameOver();
    }

    getMaximize() {
        return this.ticTacToe.player == MAXIMIZING_PLAYER;
    }

    // Player X is always the maximizing player
    getScore() {
        assert(this.ticTacToe.gameOver != undefined);

        if (this.ticTacToe.gameOver.victor == undefined) {
            return 0;
        } else if (this.ticTacToe.gameOver.victor == PLAYER_ONE) {
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

        for (var row = 0; row < TTT.NUM_ROWS; row++) {
            for (var col = 0; col < TTT.NUM_COLS; col++) {

                if (this.ticTacToe.matrix[row][col] == TTT.EMPTY) {

                    var childGame = this.ticTacToe.deepCopy();

                    var place = [row, col];

                    childGame.placePiece(place);

                    var childNode = new Node(childGame, place);
                    childrenNodes.push(childNode);
                }
            }
        }

        assert(childrenNodes.length > 0);

        return childrenNodes;
    }
}

/*******************************************************************************
 * TESTS
 ******************************************************************************/

// Returns true iff the matrices are equal 
function matricesEqual(matrix1, matrix2) {
    for (row = 0; row < TTT.NUM_ROWS; row++) {
        for (col = 0; col < TTT.NUM_COLS; col++) {
            if (matrix1[row][col] != matrix2[row][col]) {
                return false;
            }
        }
    }

    return true;
}

// Test player-x placePiece([0, 0])
var game = new TicTacToe(PLAYER_ONE);
game.placePiece([0, 0]);
var expected_matrix = [
    [PLAYER_ONE, TTT.EMPTY, TTT.EMPTY],
    [TTT.EMPTY,    TTT.EMPTY, TTT.EMPTY],
    [TTT.EMPTY,    TTT.EMPTY, TTT.EMPTY]
]
assert(matricesEqual(game.matrix, expected_matrix));

// Test player-x placePiece([1, 1])
var game = new TicTacToe(PLAYER_ONE);
game.placePiece([1, 1]);
var expected_matrix = [
    [TTT.EMPTY,    TTT.EMPTY,    TTT.EMPTY],
    [TTT.EMPTY,    PLAYER_ONE, TTT.EMPTY],
    [TTT.EMPTY,    TTT.EMPTY,    TTT.EMPTY]
]
assert(matricesEqual(game.matrix, expected_matrix));

// Test opening player as PLAYER_TWO
var game = new TicTacToe(PLAYER_TWO);
game.placePiece([0, 0]);
var expected_matrix = [
    [PLAYER_TWO, TTT.EMPTY,    TTT.EMPTY],
    [TTT.EMPTY,    TTT.EMPTY,    TTT.EMPTY],
    [TTT.EMPTY,    TTT.EMPTY,    TTT.EMPTY]
]
assert(matricesEqual(game.matrix, expected_matrix));

// Test X then O then X
var game = new TicTacToe(PLAYER_ONE);
game.placePiece([1, 1]);
game.placePiece([0, 0]);
game.placePiece([2, 2]);
var expected_matrix = [
    [PLAYER_TWO, TTT.EMPTY,    TTT.EMPTY],
    [TTT.EMPTY,    PLAYER_ONE, TTT.EMPTY],
    [TTT.EMPTY,    TTT.EMPTY,    PLAYER_ONE]
]
assert(matricesEqual(game.matrix, expected_matrix));

// Test invalid move
var game = new TicTacToe(PLAYER_ONE);
game.placePiece([0, 0]);
game.placePiece([0, 0]);
var expected_matrix = [
    [PLAYER_ONE, TTT.EMPTY, TTT.EMPTY],
    [TTT.EMPTY,    TTT.EMPTY, TTT.EMPTY],
    [TTT.EMPTY,    TTT.EMPTY, TTT.EMPTY]
]
assert(matricesEqual(game.matrix, expected_matrix));

/* TESTS for checkGameOver ****************************************************/

// Vertical victories
var game = new TicTacToe(PLAYER_ONE);
game.matrix = [
    [PLAYER_ONE,    TTT.EMPTY,    TTT.EMPTY],
    [PLAYER_ONE,    TTT.EMPTY,    TTT.EMPTY],
    [PLAYER_ONE,    TTT.EMPTY,    TTT.EMPTY]
];
game.checkGameOver()
assert(game.gameOver.victor == PLAYER_ONE);

var game = new TicTacToe(PLAYER_ONE);
game.matrix = [
    [TTT.EMPTY,    PLAYER_TWO,    TTT.EMPTY],
    [TTT.EMPTY,    PLAYER_TWO,    TTT.EMPTY],
    [TTT.EMPTY,    PLAYER_TWO,    TTT.EMPTY]
];
game.checkGameOver()
assert(game.gameOver.victor == PLAYER_TWO);

var game = new TicTacToe(PLAYER_ONE);
game.matrix = [
    [TTT.EMPTY,    TTT.EMPTY,    PLAYER_TWO],
    [TTT.EMPTY,    TTT.EMPTY,    PLAYER_TWO],
    [TTT.EMPTY,    TTT.EMPTY,    PLAYER_TWO]
];

game.checkGameOver()
assert(game.gameOver.victor == PLAYER_TWO);

// Horizonal victories
var game = new TicTacToe(PLAYER_ONE);
game.matrix = [
    [PLAYER_ONE, PLAYER_ONE, PLAYER_ONE],
    [TTT.EMPTY,    TTT.EMPTY,    TTT.EMPTY],
    [TTT.EMPTY,    TTT.EMPTY,    TTT.EMPTY]
];
game.checkGameOver()
assert(game.gameOver.victor == PLAYER_ONE);

var game = new TicTacToe(PLAYER_ONE);
game.matrix = [
    [TTT.EMPTY,    TTT.EMPTY,    TTT.EMPTY],
    [PLAYER_ONE, PLAYER_ONE, PLAYER_ONE],
    [TTT.EMPTY,    TTT.EMPTY,    TTT.EMPTY]
];
game.checkGameOver()
assert(game.gameOver.victor == PLAYER_ONE);

var game = new TicTacToe(PLAYER_ONE);
game.matrix = [
    [TTT.EMPTY,    TTT.EMPTY,    TTT.EMPTY],
    [TTT.EMPTY,    TTT.EMPTY,    TTT.EMPTY],
    [PLAYER_ONE, PLAYER_ONE, PLAYER_ONE],
];
game.checkGameOver()
assert(game.gameOver.victor == PLAYER_ONE);

// Diagonal victories
var game = new TicTacToe(PLAYER_ONE);
game.matrix = [
    [PLAYER_ONE, TTT.EMPTY,    TTT.EMPTY],
    [TTT.EMPTY,    PLAYER_ONE, TTT.EMPTY],
    [TTT.EMPTY,    TTT.EMPTY,    PLAYER_ONE]
];
game.checkGameOver()
assert(game.gameOver.victor == PLAYER_ONE);

var game = new TicTacToe(PLAYER_ONE);
game.matrix = [
    [TTT.EMPTY,    TTT.EMPTY,    PLAYER_TWO],
    [TTT.EMPTY,    PLAYER_TWO, TTT.EMPTY],
    [PLAYER_TWO, TTT.EMPTY,    TTT.EMPTY]
];
game.checkGameOver()
assert(game.gameOver.victor == PLAYER_TWO);

// Draws
var game = new TicTacToe(PLAYER_ONE);
game.matrix = [
    [PLAYER_TWO, PLAYER_ONE, PLAYER_TWO],
    [PLAYER_ONE, PLAYER_ONE, PLAYER_TWO],
    [PLAYER_TWO, PLAYER_TWO, PLAYER_ONE]
];
game.checkGameOver()
assert(game.gameOver.victor == undefined);
assert(game.gameOver.victoryCells == undefined);

/*******************************************************************************
 * MinMax test
 ******************************************************************************/

class DummyNode {

    constructor(children, move, player, score = undefined) {
        this.children = children;
        this.move = move;
        this.player = player;
        this.score = score;
    }

    getMaximize() {
        return this.player == MAXIMIZING_PLAYER;

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
var leafA = new DummyNode([], "left", PLAYER_ONE, 1);
var leafB = new DummyNode([], "right", PLAYER_ONE, 0);
var leafC = new DummyNode([], "left", PLAYER_ONE, -1);
var leafD = new DummyNode([], "right", PLAYER_ONE, 0);

var leafE = new DummyNode([], "left", PLAYER_ONE, 1);
var leafF = new DummyNode([], "right", PLAYER_ONE, -1);
var leafG = new DummyNode([], "left", PLAYER_ONE, 0);
var leafH = new DummyNode([], "right", PLAYER_ONE, -1);

var leafI = new DummyNode([], "left", PLAYER_ONE, 1);
var leafJ = new DummyNode([], "right", PLAYER_ONE, 0);
var leafK = new DummyNode([], "left", PLAYER_ONE, -1);
var leafL = new DummyNode([], "right", PLAYER_ONE, 0);

var leafM = new DummyNode([], "left", PLAYER_ONE, 1);
var leafN = new DummyNode([], "right", PLAYER_ONE, 1);
var leafO = new DummyNode([], "left", PLAYER_ONE, 1);
var leafP = new DummyNode([], "right", PLAYER_ONE, 1);

// Blue layer
var nodeA = new DummyNode([leafA, leafB], "left", PLAYER_TWO);
var nodeB = new DummyNode([leafC, leafD], "right", PLAYER_TWO);
var nodeC = new DummyNode([leafE, leafF], "left", PLAYER_TWO);
var nodeD = new DummyNode([leafG, leafH], "right", PLAYER_TWO);
var nodeE = new DummyNode([leafI, leafJ], "left", PLAYER_TWO);
var nodeF = new DummyNode([leafK, leafL], "right", PLAYER_TWO);
var nodeG = new DummyNode([leafM, leafN], "left", PLAYER_TWO);
var nodeH = new DummyNode([leafO, leafP], "right", PLAYER_TWO);

// Red layer
var nodeI = new DummyNode([nodeA, nodeB], "left", PLAYER_ONE);
var nodeJ = new DummyNode([nodeC, nodeD], "right", PLAYER_ONE);
var nodeK = new DummyNode([nodeE, nodeF], "left", PLAYER_ONE);
var nodeL = new DummyNode([nodeG, nodeH], "right", PLAYER_ONE);

// Blue layer
var nodeM = new DummyNode([nodeI, nodeJ], "left", PLAYER_TWO);
var nodeN = new DummyNode([nodeK, nodeL], "right", PLAYER_TWO);

// Red layer
var nodeRoot = new DummyNode([nodeM, nodeN], undefined, PLAYER_ONE);

// Assertions
assert(minMax(nodeA, Number.MAX_SAFE_INTEGER, false) == 0);
assert(minMax(nodeB, Number.MAX_SAFE_INTEGER, false) == -1);
assert(minMax(nodeC, Number.MAX_SAFE_INTEGER, false) == -1);
assert(minMax(nodeD, Number.MAX_SAFE_INTEGER, false) == -1);
assert(minMax(nodeE, Number.MAX_SAFE_INTEGER, false) == 0);
assert(minMax(nodeF, Number.MAX_SAFE_INTEGER, false) == -1);
assert(minMax(nodeG, Number.MAX_SAFE_INTEGER, false) == 1);
assert(minMax(nodeH, Number.MAX_SAFE_INTEGER, false) == 1);

assert(minMax(nodeI, Number.MAX_SAFE_INTEGER, true) == 0);
assert(minMax(nodeJ, Number.MAX_SAFE_INTEGER, true) == -1);
assert(minMax(nodeK, Number.MAX_SAFE_INTEGER, true) == 0);
assert(minMax(nodeL, Number.MAX_SAFE_INTEGER, true) == 1);

assert(minMax(nodeM, Number.MAX_SAFE_INTEGER, false) == -1);
assert(minMax(nodeN, Number.MAX_SAFE_INTEGER, false) == 0);

assert(minMax(nodeRoot, Number.MAX_SAFE_INTEGER, true) == 0);


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
var game = new TicTacToe(PLAYER_TWO);

game.matrix = [
    [PLAYER_TWO, TTT.EMPTY,    TTT.EMPTY],
    [TTT.EMPTY,    PLAYER_ONE, TTT.EMPTY],
    [TTT.EMPTY,    TTT.EMPTY,    PLAYER_ONE]
]

var node = new Node(game);

var [row, col] = getBestMove(node, Number.MAX_SAFE_INTEGER);

assert((row == 0 && col == 2) ||
       (row == 2 && col == 0));

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

var game = new TicTacToe(PLAYER_TWO);
game.matrix = [
    [TTT.EMPTY,    TTT.EMPTY,    TTT.EMPTY],
    [TTT.EMPTY,    TTT.EMPTY,    PLAYER_ONE],
    [PLAYER_ONE, PLAYER_TWO, PLAYER_TWO]
]

var node = new Node(game);

var [row, col] = getBestMove(node, Number.MAX_SAFE_INTEGER);

assert(row == 1 && col == 1);

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

var game = new TicTacToe(PLAYER_TWO);
game.matrix = [
    [TTT.EMPTY,    TTT.EMPTY,    TTT.EMPTY],
    [TTT.EMPTY,    TTT.EMPTY,    PLAYER_ONE],
    [TTT.EMPTY,    TTT.EMPTY,    PLAYER_TWO]
]

var node = new Node(game);

var [row, col] = getBestMove(node, Number.MAX_SAFE_INTEGER);

assert(row == 2 && col == 1);
