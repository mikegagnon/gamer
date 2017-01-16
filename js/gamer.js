function assert(condition) {
    if (!condition) {
        console.error("Assertion failed");
    }
}

// TODO: keep same ai across new games of same gameName

// TODO:
// Also handles messages such as check, checkmate, victory announcments, ...
// Move constructor(begin, end, movePiece, capturePiece, check, gameOver) {

/*******************************************************************************
 * Global constantsselectedSquare
 ******************************************************************************/

// There are two type of games that Gamer can handle:
//
//      1. "place" games, for example Tic Tac Toe, Connect Four, and Othello
//      2. "select and place" games, for example Checkers and Chess
//
// In a "place " game, players take turns placing pieces on a rectangular board.
// In a "select and place" game, during a turn a player selects a piece,
// then places that piece somewhere else.
//
CLICK_MODE_PLACE = 1;
CLICK_MODE_SELECT_AND_PLACE = 2;

PLAYER_ONE = 1;
PLAYER_TWO = 2;

PLAYER_HUMAN = 1;
PLAYER_COMPUTER = 2;

PLAYER_STRING = {
    "1" : "Player One",
    "2" : "Player Two",
};

LIFE_FORM_STRING = {
    "1" : "Human",
    "2" : "",
};

GAMER_CONFIG = {
    maxBoardWidth: 400,
    maxBoardHeight: 400,
    initLifeFormPlayer1: PLAYER_HUMAN,
    initLifeFormPlayer2: PLAYER_COMPUTER,

    // Before every AI move, the AI is delayed by aiDelay milliseconds, so that
    // the vizualizations can be be updated
    aiDelay: 300,

    // Messages are highlighted in a color (flashColor) for flashDelay
    // milliseconds, and then the highlight is taken off
    flashDelay: 150,
    flashColor: "red"
};

/*******************************************************************************
 * GameOver class
 ******************************************************************************/
// Games that are registered with Gamer, must have a field .gameOver
// that is an instance of this class.
class GameOver {

    constructor(draw = false, victor = undefined) {

        // True iff the game is a draw
        this.draw = draw;

        // If there is a victor, this.victor == the player who won
        // (PLAYER_ONE or PLAYER_TWO)
        //
        // IF there is not a victor, then this.victor == undefined
        this.victor = victor;
    }

    isGameOver() {
        return this.draw || this.victor != undefined;
    }

    deepCopy() {
        return new GameOver(this.draw, this.victor);
    }
}

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
//      .gameOver
//
// Every game object must have the following methods:
//
//      .getImageFilename(piece)
//
//      .selectAndPlaceMove(select, place)
//
//      .getPossiblePlacements(row, col) // TODO: ok to return empty list?
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

        // The list of all game names that were added to GAMER via
        // GAMER.addGame(...), in the order that they were added
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

        // this.aiFunctionNames[gameName] == the list of all AI function names
        // that were added to GAMER via GAMER.addAi(gameName, ...), in the
        // order that they were added
        this.aiFunctionNames = {};

        // this.playerAiFunction[player] == the AI function that the specified
        // player is using.
        //
        // For example, this.playerAiFunction[PLAYER_ONE] might equal
        // checkersMinMaxDepth1.
        this.playerAiFunction = {};

        // this.aiFunctionName[player] == a string representation of
        // this.playerAiFunction[player]
        this.aiFunctionName = {};

        // this.lifeForm indicates whether the players are humans or AIs
        // 
        // For example:
        //      this.lifeForm[PLAYER_ONE] might equal PLAYER_COMPUTER;
        //      this.lifeForm[PLAYER_TWO] might_equal PLAYER_HUMAN;
        this.lifeForm = {};

        // In a "select and place" game, Gamer needs to keep track of what square
        // is currently selected, if any. this.selectedSquare is either
        // undefined (which indicates no square is selected), or
        // this.selectedSquare == [row, col], where row and col indicate
        // which square is selected
        this.selectedSquare = undefined;

        // In a "select and place" game, once a square is selected Gamer
        // retrieves the list of possible moves (from the selected square).
        // this.possiblePlacements stores that list.
        //
        // Or, ina "place" game, the possiblePlacements stores the list of possible
        // places where a piece can be placed.
        //
        // this.possiblePlacements is an array of [row, col] values
        this.possiblePlacements = undefined;

        // Every time a new game is created, this.gameNumber is incremented
        // This number is used so that lingering AI settimeout functions
        // can cancel themselves when they realize a new game has started
        // and their game is finished.
        this.gameNumber = 0;
    }


    /***************************************************************************
     * How clients register games and AIs with Gamer
     **************************************************************************/

    // Clients add games to Gamer (for example) via:
    //
    //      GAMER.addGame("Chess", Chess)
    //
    // gameName is the name of the game as a string, e.g. "Chess"
    // gameClass is a reference to the class for the game, e.g. Chess
    addGame(gameName, gameClass) {
        this.gameNames.push(gameName);
        this.gameConstructors[gameName] = gameClass;
    }

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
    addAi(gameName, aiFunctionName, aiFunction) {
        if (this.aiFunctions[gameName] == undefined) {
            this.aiFunctions[gameName] = {};
            this.aiFunctionNames[gameName] = [];
        }
        this.aiFunctions[gameName][aiFunctionName] = aiFunction;
        this.aiFunctionNames[gameName].push(aiFunctionName);
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

                $("#" + cellId).css("margin-top",
                    this.game.gamerConfig.squareMargin);
                $("#" + cellId).css("margin-left",
                    this.game.gamerConfig.squareMargin);

                var cell = $("#" + cellId);

                // Draw a checkered cell
                if (this.game.gamerConfig.checkered) {
                    if ((row % 2 == 0 && col % 2 == 0) ||
                        (row % 2 == 1 && col % 2 == 1)) {
                        $("#" + cellId).css("background-color",
                            this.game.gamerConfig.lightSquareColor);
                    } else {
                        $("#" + cellId).css("background-color",
                            this.game.gamerConfig.darkSquareColor);
                    }
                }

                // Draw a non-checkered cell
                else {
                    $("#" + cellId).css("background-color",
                        this.game.gamerConfig.squarColor);
                }
            }
        }
    }

    drawGameState(message) {
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

        if (this.game.gameOver.isGameOver()) {
            if (this.game.gameOver.draw) {
                this.drawMessage("The game has ended in a draw.");
            } else {
                var playerString = PLAYER_STRING[this.game.gameOver.victor];
                this.drawMessage(playerString + " wins the game!");
            }
            this.drawTurnInfo();
        } else {
            this.drawMessage(message)
        }
    }

    drawMessage(message) {
        if (message == undefined) {
            $("#message").text("");
        } else {
            $("#message").text(message);
            $("#message").css("background-color", this.config.flashColor);

            function undoFlash() {
                $("#message").css("background-color", "");
            }

            setTimeout(undoFlash, this.config.flashDelay);
        }
    }

    // For a "select and play" game, this function draws an outline around
    // a selected a piece (after the piece has been selected)
    drawSelectPiece() {
        var [row, col] = this.selectedSquare;
        $("#" + this.getCellId(row, col)).css("box-shadow",
            this.game.gamerConfig.selectPieceBoxShadow);
    }

    // Removes the outline around a formerly selected piece
    undoDrawSelectPiece() {
        if (this.selectedSquare == undefined) {
            return;
        }
        var [row, col] = this.selectedSquare;
        $("#" + this.getCellId(row, col)).css("box-shadow", "");
    }

    // For a "select and play" game, this function draws an outline around
    // a every possible move that a select piece can make.
    // TODO: take possiblePlacements as an argument.
    // TODO: do we really need to store this.possiblePlacements?
    drawPossiblePlacements() {
        assert(this.possiblePlacements != undefined);

        for (var i = 0; i < this.possiblePlacements.length; i++) {
            var [row, col] = this.possiblePlacements[i];
            $("#" + this.getCellId(row, col)).css("box-shadow",
                this.game.gamerConfig.possibleMoveBoxShadow);
        }
    }

    // Removes the outlines around every formerly possible move
    undoDrawPossiblePlacements() {
        if(this.possiblePlacements == undefined) {
            return;
        }

        for (var i = 0; i < this.possiblePlacements.length; i++) {
            var [row, col] = this.possiblePlacements[i];
            $("#" + this.getCellId(row, col)).css("box-shadow", "");
        }
    }

    drawPlacement(message) {
        this.undoDrawSelectPiece();
        this.undoDrawPossiblePlacements();
        this.drawGameState(message);
    }

    vizInit() {
        this.buildMenus();
        this.cellSize = this.getCellSize();
        this.removeViz();
        this.drawCells();
        this.drawGameState(undefined);
    }

    buildMenuNewGame() {
        var menuId = "newGameMenu";

        $("#" + menuId).html("");

        for (var gameName in this.gameConstructors) {

            var html = "<li><a class=\"cursor\" onClick=\"clickNewGame('" +
                gameName + "')\">" + gameName +"</a></li>";

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

        var html = "<li><a class=\"cursor\" onClick=\"choosePlayer(" +
            playerStr + ", 'Human')\">Human</a></li>";

        $("#" + menuId).append(html);

        for (var functionName in this.aiFunctions[this.gameName]) {

            var html = "<li><a class=\"cursor\" onClick=\"choosePlayer(" +
                playerStr + ", '" + functionName + "')\">" +
                functionName +"</a></li>";

            $("#" + menuId).append(html);
        }
    }

    buildMenus() {
        this.buildMenuNewGame();
        this.buildMenuChoosePlayer(PLAYER_ONE);
        this.buildMenuChoosePlayer(PLAYER_TWO);
    }

    drawTurnInfo() {
        var playerString = PLAYER_STRING[this.game.player];

        if (this.game.gameOver.isGameOver()) {
            $("#turn").text("");
        } else if (this.lifeForm[this.game.player] == PLAYER_HUMAN) {
            $("#turn").text("Your turn, " + playerString);
        } else {
            $("#turn").text(playerString + " AI is thinking...");
        }
    }

    drawPlayerListing() {

        var lifeForm1 = LIFE_FORM_STRING[this.lifeForm[PLAYER_ONE]];
        var lifeForm2 = LIFE_FORM_STRING[this.lifeForm[PLAYER_TWO]];

        var playerListing1 = PLAYER_STRING[PLAYER_ONE] + " = " + lifeForm1;
        var playerListing2 = PLAYER_STRING[PLAYER_TWO] + " = " + lifeForm2;

        if (this.lifeForm[PLAYER_ONE] == PLAYER_COMPUTER) {
            playerListing1 += " " + this.aiFunctionName[PLAYER_ONE];
        }

        if (this.lifeForm[PLAYER_TWO] == PLAYER_COMPUTER) {
            playerListing2 += " " + this.aiFunctionName[PLAYER_TWO];
        }

        var listing = "<ul><li>" + playerListing1 + "</li><li>" +
            playerListing2 + "</li></ul>";

        $("#playerListing").html(listing);

    }

    /***************************************************************************
     * Controller
     **************************************************************************/

    // GAMER.run() kicks off the whole system
    // Make sure to do all your addGame(...) and addAi(...) calls before 
    // you invoke GAMER.run()
    run() {
        var gameName = this.gameNames[0];
        var gameConstructor = this.gameConstructors[gameName];
        this.lifeForm[PLAYER_ONE] = this.config.initLifeFormPlayer1;
        this.lifeForm[PLAYER_TWO] = this.config.initLifeFormPlayer2;
        this.launchNewGame(gameName);
    }

    launchNewGame(gameName) {

        this.gameNumber += 1;

        var gameConstructor = this.gameConstructors[gameName];

        // If switching games, then start over with the default life forms
        if (gameName != this.gameName) {
            this.lifeForm[PLAYER_ONE] = this.config.initLifeFormPlayer1;
            this.lifeForm[PLAYER_TWO] = this.config.initLifeFormPlayer2;
        }

        this.gameName = gameName;
        this.game = new gameConstructor();

        assert(
            this.game.gamerConfig.clickMode == CLICK_MODE_PLACE ||
            this.game.gamerConfig.clickMode == CLICK_MODE_SELECT_AND_PLACE);

        this.vizInit();

        this.selectedSquare = undefined;

        // setup the AI for p1 if computer
        if (this.lifeForm[PLAYER_ONE] == PLAYER_COMPUTER) {
            var aiName = this.aiFunctionNames[gameName][0];
            this.playerAiFunction[PLAYER_ONE] =
                this.aiFunctions[gameName][aiName];
            this.aiFunctionName[PLAYER_ONE] = aiName;
        }

        // setup the AI for p2 if computer
        if (this.lifeForm[PLAYER_TWO] == PLAYER_COMPUTER) {
            var aiName = this.aiFunctionNames[gameName][0];
            this.playerAiFunction[PLAYER_TWO] =
                this.aiFunctions[gameName][aiName];
            this.aiFunctionName[PLAYER_TWO] = aiName;
        }

        this.drawPlayerListing();

        // kick off the game if p1 is a computer
        // otherwise we wait for user input
        if (this.lifeForm[PLAYER_ONE] == PLAYER_COMPUTER &&
            this.lifeForm[PLAYER_TWO] == PLAYER_COMPUTER) {
            this.computerDuel();
        } else if (this.lifeForm[PLAYER_ONE] == PLAYER_COMPUTER) {

            this.drawTurnInfo();

            var THIS = this;

            function doAiMove() {
                THIS.makeAiMove();
                this.drawTurnInfo();
            }

            // We delay the AI to give the browser a chance to draw the screen
            window.setTimeout(doAiMove, this.config.aiDelay);
        } else {
            this.drawTurnInfo();
        }
    }

    makeAiMove() {
        var aiFunction = this.playerAiFunction[this.game.player];

        var message;

        if (this.game.gamerConfig.clickMode == CLICK_MODE_SELECT_AND_PLACE) {
            var bestMove = aiFunction(this.game);
            var [select, place] = bestMove;
            message = this.game.selectAndPlace(select, place);
        } else {
            var place = aiFunction(this.game);
            message = this.game.placePiece(place);
        }
        
        this.drawGameState(message);

    }

    computerDuel() {
        assert(
            this.lifeForm[PLAYER_ONE] == PLAYER_COMPUTER &&
            this.lifeForm[PLAYER_TWO] == PLAYER_COMPUTER);

        assert(!this.game.gameOver.isGameOver());

        var THIS = this;
        var GAME_NUMBER = this.gameNumber;

        this.drawTurnInfo();

        // We delay the AI to give the browser a chance to draw the screen
        function doAiMove() {
            if (THIS.game.gameOver.isGameOver() ||
                THIS.gameNumber != GAME_NUMBER) {
                return;
            }

            THIS.makeAiMove();
            THIS.drawTurnInfo();

            if (!THIS.game.gameOver.isGameOver()) {
                window.setTimeout(doAiMove, THIS.config.aiDelay);
            }
        }

        window.setTimeout(doAiMove, this.config.aiDelay);

    }

    // Checks to see if a user clicked on a possible placement.
    // Iff so, returns true.
    isPossiblePlace(row, col) {
        for (var i = 0; i < this.possiblePlacements.length; i++) {
            var [r, c] = this.possiblePlacements[i];
            if (row == r && col == c) {
                return true;
            }
        }
        return false;
    }

    computerTurn() {

        // If it's the computers turn...
        if (this.lifeForm[this.game.player] == PLAYER_COMPUTER) {

            var THIS = this;
            var GAME_NUMBER = this.gameNumber;

            this.drawTurnInfo();

            // We delay the AI to give the browser a chance to draw the
            // screen.
            //
            // We do a recursive loop incase the computer has
            // multiple turns in a row.
            function doAiMove() {
                if (THIS.game.gameOver.isGameOver() ||
                    THIS.gameNumber != GAME_NUMBER) {
                    return;
                }

                THIS.makeAiMove();

                if (THIS.lifeForm[THIS.game.player] ==
                    PLAYER_COMPUTER) {
                    THIS.drawTurnInfo();
                    window.setTimeout(doAiMove, THIS.config.aiDelay);
                } else {
                    THIS.drawTurnInfo();
                }
            }

            window.setTimeout(doAiMove, this.config.aiDelay);
        } else {
            this.drawTurnInfo();
        }
    }

    cellClickPlace(row, col) {
        assert(!this.game.gameOver.isGameOver());
        
        this.possiblePlacements = this.game.getPossiblePlacements();

        if (this.isPossiblePlace(row, col)) {
            var place = [row, col];
            
            var message = this.game.placePiece(place);
            this.drawPlacement(message);

            if (this.game.gameOver.isGameOver()) {
                return;
            }

            this.computerTurn();
        } else {
            this.drawMessage("You cannot select that square.");
        }
    }

    // The player has clicked (row, col) and we are in "select and place" mode.
    cellClickSelectAndPlace(row, col) {
        assert(!this.game.gameOver.isGameOver());

        // If the player has already selected a piece
        if (this.selectedSquare != undefined) {
            assert(this.possiblePlacements != undefined);

            // If the player has clicked on a "place" -- i.e. a possible move
            if (this.isPossiblePlace(row, col)) {

                var place = [row, col];

                // Make the placement
                var message =
                    this.game.selectAndPlace(this.selectedSquare, place);

                this.drawPlacement(message);

                this.selectedSquare = undefined;
                this.possiblePlacements = undefined;

                if (this.game.gameOver.isGameOver()) {
                    return;
                }

                this.computerTurn();

                return;
            }
        }

        // At this point in the function, either:
        // 
        //      (A) this.selectedSquare == undefined, or
        //      (B) !this.isPossiblePlace(row, col)
        //
        // Therefore, the user seems to be trying to select a new piece.
        // If this.game.getPossiblePlacements(row, col).length > 0,
        // then the user has clicked on a piece that has valid moves.
        // Therefore, in that case, we "select" (row, col)
        var select = [row, col];
        var possiblePlacements = this.game.getPossiblePlacements(select);
        if (possiblePlacements.length > 0) {
            this.undoDrawSelectPiece();
            this.undoDrawPossiblePlacements();
            this.selectedSquare = [row, col];
            this.possiblePlacements = possiblePlacements;
            this.drawSelectPiece();
            this.drawPossiblePlacements();
            this.drawMessage(undefined);
        } else {
            this.drawMessage("You cannot select that square.");
        }
    }

    // A user has clicked on a square
    cellClick(row, col) {
        if (this.game.gameOver.isGameOver()) {
            return;
        }

        if (this.lifeForm[PLAYER_ONE] == PLAYER_COMPUTER &&
            this.lifeForm[PLAYER_TWO] == PLAYER_COMPUTER) {
            return;
        }

        if (this.game.gamerConfig.clickMode == CLICK_MODE_SELECT_AND_PLACE) {
            this.cellClickSelectAndPlace(row, col);
        } else {
            this.cellClickPlace(row, col);
        }
    }

    // The user has clicked an item on a player dropdown menu
    choosePlayer(player, humanOrAi) {
        if (humanOrAi == "Human") {
            this.lifeForm[player] = PLAYER_HUMAN;
            this.drawPlayerListing();
        } else {
            this.lifeForm[player] = PLAYER_COMPUTER;

            this.playerAiFunction[player] =
                this.aiFunctions[this.gameName][humanOrAi];
            this.aiFunctionName[player] = humanOrAi;

            this.drawPlayerListing();

            if (this.lifeForm[PLAYER_ONE] == PLAYER_COMPUTER &&
                this.lifeForm[PLAYER_TWO] == PLAYER_COMPUTER) {
                this.computerDuel();
            } else if (this.lifeForm[this.game.player] == PLAYER_COMPUTER) {
                this.makeAiMove();
                this.drawTurnInfo();
            }

        }
    }

    // The user has clicked a game from the new-game menu
    clickNewGame(gameName) {
        this.launchNewGame(gameName);
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