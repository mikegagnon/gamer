
MIN_MAX_DEPTH = 1;

MAXIMIZING_PLAYER = PLAYER_ONE;
MINIMIZING_PLAYER = PLAYER_TWO;



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

function getBestMove(node, depth) {

    assert(!node.isLeaf());

    var maximize = node.getMaximize();

    // If the node wants to maximize its score:
    if (maximize) {
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