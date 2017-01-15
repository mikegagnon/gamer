function assert(condition) {
    if (!condition) {
        console.error("Assertion failed");
    }
}

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

/*******************************************************************************
 * Gamer class
 ******************************************************************************/
// The Gamer class is instantiated as a singleton object, GAMER, at the bottom
// of this file.
//
// The GAMER object encapsulates the View and Controller, from the MVC
// design pattern.
//
// The Model component of MVC is represent by various game objects.
//
// Every game object must have the following fields:
// 
//      .gamerConfig
//
//      .numRows
//
//      .numCols
//
//      .matrix
//
//      .player
//
// Every game object must have the following methods:
//
//      .getImageFilename(piece)
//
//      .makeMove(move) // TODO rm interface
//
//      .selectAndPlaceMove(select, place)
//
//      .getPossibleMoves(row, col)
//

class Gamer {
    constructor(gamerDivId, config = GAMER_CONFIG) {

        // gamerDivId is the the HTML id of the <div> element that Gamer will
        // attach to. Do not include the "#" symbol .
        this.gamerDivId = gamerDivId;

        this.config = config;

        // this.gameConstructor[gameName] == a reference to the constructor
        // for a game class. For example, this.gameConstructor["Chess"] ==
        // the constructor for the Chess class. Game constructors do not
        // take any arguments.
        //
        // Clients add games to Gamer via: GAMER.addGame("Chess", Chess)
        // Gamer constructs game objects like so (for example):
        //
        //      var constructor = this.gameConstructor["Chess"];
        //      var game = new constructor();
        //
        this.gameConstructors = {};

        // The list of all game names that are added tp GAMER via
        // GAMER.addGame(...)
        this.gameNames = [];

        // this.aiFunctions[gameName][aiFunctionName] == an "AI function"
        // For example, this.aiFunctions["Checkers"]["checkersMinMaxDepth1"] ==
        // a reference to the AI function checkersMinMaxDepth1(...)
        //
        // Clients add AI functions to Gamer via:
        // GAMER.addAi(gameName, aiFunctionName, a reference to an AI function)
        //
        // For example:
        //
        //      GAMER.addAi(
        //          "Checkers", "checkersMinMaxDepth1", checkersMinMaxDepth1);
        //
        // Every AI function takes a single argument (a game object), and
        // returns a single value (a move object).
        //
        // For example:
        //
        //      function checkersMinMaxDepth1(checkersGame) {
        //          returns a move object
        //      }
        //
        // TODO: determine what constraints there are on move objects
        //      
        this.aiFunctions = {};

        // this.playerAiFunction[player] == the AI function that the specified
        // player is using.
        //
        // For example, this.playerAiFunction[PLAYER_ONE] might equal
        // checkersMinMaxDepth1.
        this.playerAiFunction = {}

        // this.aiBusy is true whenever an AI function is in the process of
        // executing
        //
        // this.aiBusy is false whenever an AI function is NOT executing.
        this.aiBusy = false;
    }

    addGame(gameName, gameClass) {
        this.gameNames.push(gameName);
        this.gameConstructors[gameName] = gameClass;
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
                $("#" + cellId).css("margin-top", this.game.gamerConfig.squareMargin);
                $("#" + cellId).css("margin-left", this.game.gamerConfig.squareMargin);

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
        var bestMove = this.playerAiFunction[this.game.player](this.game);
        var result = this.game.makeMove2(bestMove);
        this.aiBusy = false;
        return result;
    }



    buildMenuNewGame() {
        var menuId = "newGameMenu";

        $("#" + menuId).html("");

        for (var gameName in this.gameConstructors) {
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

        for (var functionName in this.aiFunctions[this.gameName]) {
            var html = "<li><a class=\"cursor\" onClick=\"choosePlayer(" + playerStr + ", '" + functionName + "')\">" + functionName +"</a></li>";
            $("#" + menuId).append(html);
        }
    }

    buildMenus() {
        this.buildMenuNewGame();
        this.buildMenuChoosePlayer(PLAYER_ONE);
        this.buildMenuChoosePlayer(PLAYER_TWO);
    }


    runNewGame(gameConstructor) {
        this.game = new gameConstructor();
        this.gameOver = false;
        this.buildMenus();
        this.vizInit();

        assert(
            this.game.gamerConfig.clickMode == CLICK_MODE_PLACE ||
            this.game.gamerConfig.clickMode == CLICK_MODE_SELECT_AND_PLACE)

        // TODO: document
        this.selectedSquare = undefined;
        this.possibleMoves = undefined;

        LIFE_FORM[PLAYER_ONE] = PLAYER_HUMAN;
        LIFE_FORM[PLAYER_TWO] = PLAYER_HUMAN;
    }


    run() {
        this.gameName = this.gameNames[0];
        var gameConstructor = this.gameConstructors[this.gameName];
        this.runNewGame(gameConstructor);
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
            LIFE_FORM[player] = PLAYER_HUMAN;
        } else {
            LIFE_FORM[player] = PLAYER_COMPUTER;
            this.playerAiFunction[player] = this.aiFunctions[this.gameName][humanOrAi];

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
        this.gameName = gameName;
        var gameConstructor = this.gameConstructors[gameName];
        this.runNewGame(gameConstructor);
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