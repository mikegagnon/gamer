
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

LIFE_FORM = new Object();
LIFE_FORM[PLAYER_ONE] = PLAYER_COMPUTER;
LIFE_FORM[PLAYER_TWO] = PLAYER_COMPUTER;

class Gamer {
    constructor(gamerDivId, config = GAMER_CONFIG) {
        this.gamerDivId = gamerDivId;
        this.config = config;
        this.gameConstructors = [];
        this.aiFunctions = {};
        this.aiBusy = false;
    }

    addGame(gameName, gameClass) {
        this.gameConstructors.push([gameName, gameClass]);
    }

    addAi(gameName, aiFunctionName, aiFunction) {
        if (this.aiFunctions[gameName] == undefined) {
            this.aiFunctions[gameName] = {};
        }
        this.aiFunctions[gameName][aiFunctionName] = aiFunction;
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


    makeAiMove() {

        if (this.gameOver) {
            return;
        }

        this.aiBusy = true;
        var bestMove = this.aiFunction(this.game);
        return this.game.makeMove2(bestMove);
        this.aiBusy = false;
    }



    buildMenuNewGame() {
        var menuId = "newGameMenu";

        $("#" + menuId).html("");

        for (var i = 0; i < this.gameConstructors.length; i++) {
            var [gameName, _] = this.gameConstructors[i];

            var html = "<li><a class=\"cursor\" onClick=\"clickNewGame('" + gameName + "')\">" + gameName +"</a></li>";
            $("#" + menuId).append(html);
        }        
    }


    buildMenuChoosePlayer(player) {

        var menuId;
        var playerStr;
        if (player == PLAYER_ONE) {
            menuId = "playerOneMenu";
            playerStr = "PLAYER_ONE";
        } else {
            menuId = "playerTwoMenu";
            playerStr = "PLAYER_TWO";
        }

        $("#" + menuId).html("");
        var html = "<li><a class=\"cursor\" onClick=\"choosePlayer(" + playerStr + ", 'Human')\">Human</a></li>";
        $("#" + menuId).append(html);

        for (var gameName in this.aiFunctions) {
            for (var functionName in this.aiFunctions[gameName]) {
                var html = "<li><a class=\"cursor\" onClick=\"choosePlayer(" + playerStr + ", '" + functionName + "')\">" + functionName +"</a></li>";
                $("#" + menuId).append(html);
            }
        }
    }

    buildMenus() {
        this.buildMenuNewGame();
        this.buildMenuChoosePlayer(PLAYER_ONE);
        this.buildMenuChoosePlayer(PLAYER_TWO);
    }

    run() {
        var gamerConstructor = this.gameConstructors[0][1];
        this.gameName = this.gameConstructors[0][0];
        this.aiFunction = this.aiFunctions["Chess"]["chessMinMaxDepth1"];

        this.buildMenus();


        this.game = new gamerConstructor();
        this.gameOver = false;
        this.vizInit();

        assert(
            this.game.gamerConfig.clickMode == CLICK_MODE_PLACE ||
            this.game.gamerConfig.clickMode == CLICK_MODE_SELECT_AND_PLACE)

        // TODO: document
        this.selectedSquare = undefined;
        this.possibleMoves = undefined;

        if (LIFE_FORM[PLAYER_ONE] == PLAYER_COMPUTER &&
            LIFE_FORM[PLAYER_TWO] == PLAYER_COMPUTER) {

            this.computerDual();

        } else if (LIFE_FORM[PLAYER_ONE] == PLAYER_COMPUTER) {
            var move = this.makeAiMove(this.game);
            this.drawGameState();
        }
    }

    computerDual() {
        assert(
            LIFE_FORM[PLAYER_ONE] == PLAYER_COMPUTER &&
            LIFE_FORM[PLAYER_TWO] == PLAYER_COMPUTER);

        var THIS = this;

        function doAiMove() {
            if (this.LIFE_FORM[THIS.game.player] == PLAYER_COMPUTER) {
                var move = THIS.makeAiMove(THIS.game);
                THIS.drawGameState();

                if (!THIS.gameOver) {
                    window.setTimeout(doAiMove, 300);
                }
            }
        }

        window.setTimeout(doAiMove, 300);

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

                if (!this.gameOver && LIFE_FORM[this.game.player] == PLAYER_COMPUTER ) {

                    var THIS = this;

                    function doAiMove() {
                        var move = THIS.makeAiMove(THIS.game);
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

        if (LIFE_FORM[PLAYER_ONE] == PLAYER_COMPUTER &&
            LIFE_FORM[PLAYER_TWO] == PLAYER_COMPUTER) {
            return;
        }

        if (this.game.gamerConfig.clickMode == CLICK_MODE_SELECT_AND_PLACE) {
            this.cellClickSelectAndPlace(row, col);
        } else {
            alert("asdf");
        }
    }

    choosePlayer(player, humanOrAi) {
        if (humanOrAi == "Human") {
            console.log("asdf");
            LIFE_FORM[player] = PLAYER_HUMAN;
        } else {
            LIFE_FORM[player] = PLAYER_COMPUTER;
            this.aiFunction = this.aiFunctions[this.gameName][humanOrAi];

            if (LIFE_FORM[PLAYER_ONE] == PLAYER_COMPUTER &&
                LIFE_FORM[PLAYER_TWO] == PLAYER_COMPUTER) {
                this.computerDual();
            } else if (LIFE_FORM[this.game.player] == PLAYER_COMPUTER) {
                var move = this.makeAiMove(this.game);
                this.drawGameState();
            }

        }
    }

    newGame(gameName) {
        console.log("new " + gameName);
    }

    clickNewGame(gameName) {
        this.gameOver = true;

        if (this.aiBusy) {

            var THIS = this;

            function wait() {

                if (THIS.ai_busy) {
                    setTimeout(wait, 100);
                } else {
                    THIS.newGame(gameName);
                }
            }

            setTimeout(wait, 100);
        } else {
            this.newGame(gameName);
        }
    }
}


var GAMER = new Gamer("gamer1");

function cellClick(row, col) {
    GAMER.cellClick(row, col);
}

function choosePlayer(player, humanOrAi) {
    GAMER.choosePlayer(player, humanOrAi);
}

function clickNewGame(gameName) {
    GAMER.clickNewGame(gameName);
}