# Gamer

Gamer is an AI Laboratory for JavaScript, designed to help novice students (A) acquire programming practice, and (B) develop AIs based on MiniMax. [Check it out](https://mikegagnon.github.io/gamer/).

Gamer simplifies game development by providing graphics and controls.
To create a game, the student only needs to develop the game logic itself.

Gamer comes prepackaged with the following games:

- Tic Tac Toe
- Connect Four
- Othello
- Checkers
- Chess


# Contents

- [How to add a new game to Gamer](#newgame)
    - [Game types](#gametypes)
    - [Game setup](#gamesetup)
    - [Game class](#gameclass)
- [How to add an AI for your game](#addai)

# <a name="newgame">How to add a new game to Gamer</a>

## <a name="gametypes">Game types</a>

There are two types of games that Gamer can work with:

1. "**Place**" games
    - "Place" games include Tic Tac Toe, Connect Four, Othello, and more.
    - In a "place" game, players take turns *placing* pieces onto the board.
2. "**Select and place**" games
    - "Select and place" games include Checkers, Chess, and more.
    - In a "select and place" game, on a player's turn the player *selects* a piece, then *places* that piece.

Furthermore, Gamer can only handle games that take place on a matrix.

## <a name="gamesetup">Game setup</a>

Let's say you want to remake Tic Tac Toe on your own.

```
$ git clone https://github.com/mikegagnon/gamer.git
$ cd gamer.
$ git rm -r tic-tac-toe/
$ mkdir tic-tac-toe
$ mkdir tic-tac-toe/js
$ mkdir tic-tac-toe/img
```

Then, download [player-x.png](https://raw.githubusercontent.com/mikegagnon/gamer/master/tic-tac-toe/img/player-x.png) and [player-o.png](https://raw.githubusercontent.com/mikegagnon/gamer/master/tic-tac-toe/img/player-o.png) into `tic-tac-toe/img`

Edit `index.html` and ensure `tic-tac-toe.js` is imported after `gamer.js`:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Gamer AI Laboratory</title>
    <link rel="stylesheet" type="text/css" href="css/bootstrap.css">
    <link rel="stylesheet" type="text/css" href="css/style.css">
    <script src="js/jquery.js"></script>
    <script src="js/bootstrap.js"></script>
    <script src="js/gamer.js"></script>
    <script src="ai/js/ai.js"></script>
    <script src="chess/js/chess.js"></script>
    <script src="checkers/js/checkers.js"></script>
    <script src="othello/js/othello.js"></script>
    <script src="connect-four/js/connect-four.js"></script>
    <script src="tic-tac-toe/js/tic-tac-toe.js"></script>  <!-- Tic Tac Toe  -->
  </head>
  <body>
  ...
```

Finally, open up `tic-tac-toe/js/tic-tac-toe.js` in your favorite editor.

## <a name="gameclass">Game class</a>

Let's create a two-player Tic Tac Toe game.

Create a `TicTacToe` class:

```js
class TicTacToe {

}
```

Gamer requires that game classes have certain fields and methods. In particular:

- Fields:
    - `this.numRows`
    - `this.numCols`
    - `this.matrix`
    - `this.gameOver`
    - `this.player`
    - `this.gamerConfig`
- Methods:
    - `getImageFilename(piece)`
    - `selectAndPlace(select, place)` or `placePiece(place)`
    - `getPossiblePlacements(select)` or `getPossiblePlacements()` 


Here is a bare bones two-player implementation of Tic Tac Toe in `tic-tac-toe/js/tic-tac-toe.js`.

```js

class TicTacToe {
    constructor() {
        this.numRows = 3;
        
        this.numCols = 3;
        
        this.matrix = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ]

        // Gamer provides the GameOver class. See the reference documentation
        // in README.md for the definition of the GameOver class.
        this.gameOver = new GameOver()

        // Gamer provides the values PLAYER_ONE and PLAYER_TWO
        // this.player specifies whose turn it is
        this.player = PLAYER_ONE;

        // this.gamerConfig must contain different properties, depending
        // on whether the game is a "Place" game or a "Select and place"
        // game. See the reference documentation in README.md for
        // full documentation on gamerConfig.
        this.gamerConfig = {

            // setting clickMode to CLICK_MODE_PLACE tells Gamer that this is
            // a "Place" game.
            clickMode: CLICK_MODE_PLACE,

            // Should the board be checkered?
            checkered: false,

            // The background color for every square
            squarColor: "lightgray",

            // The number of pixels between each square
            squareMargin: 3
        }
    }

    // piece is always a value from this.matrix[r][c], for all possible values
    // of r and c.
    //
    // getImageFilename should return the filename for the image that represents
    // the given piece.
    //
    // if there is no image associated with piece, then return undefined.
    getImageFilename(piece) {
        if (piece == 0) {
            return undefined;
        } else if (piece == PLAYER_ONE) {
            return "tic-tac-toe/img/player-x.png";
        } else {
            // Gamer provides an assert function
            assert(piece == PLAYER_TWO);
            return "tic-tac-toe/img/player-o.png";            
        }
    }

    // When a player makes it moves, Gamer calls placePiece(place), where
    // place is a [row, col] value that indicates the coordinate where
    // this.player is placing their piece.
    //
    // placePiece(place), should always check to see if the game is over.
    // if the game is over, this method should update the this.gameOver object.
    //
    // If this game has a message it would like displayed to the user, this
    // method should return a string containing that message. Otherwise,
    // this method should return undefined.
    placePiece(place) {
        var [row, col] = place;
        assert(this.matrix[row][col] == 0);
        this.matrix[row][col] = this.player;

        // switch player
        if (this.player == PLAYER_ONE) {
            this.player = PLAYER_TWO;
        } else {
            assert(this.player == PLAYER_TWO);
            this.player = PLAYER_ONE;
        }

        // If the player places a piece on the center square, that player wins
        // It is an exercise left to the student to implent proper game-over
        // detection for Tic Tac Toe.
        //
        // See the reference documentation in README.md for the definition of
        // the GameOver class.
        if (row == 1 && col == 1) {
            this.gameOver.victor = this.player;
        }

        return undefined;
    }

    // For "Place" games, the game class must provide a getPossiblePlacements()
    // method. For "Select and place" games, the game class must provide a
    // getPossiblePlacements(select) method.
    //
    // For a "Place" game, getPossiblePlacements() must return an array
    // of [row, col] values, where each [row, col] value indicates a
    // coordinate where a piece may be placed. getPossiblePlacements() must
    // return every coordinate where pieces may be placed.
    //
    // See the reference documentation in README.md for full documentation on
    // getPossiblePlacements() and getPossiblePlacements(select).
    getPossiblePlacements() {

        // return coordinates for every empty square
        var placements = []
        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {
                if (this.matrix[row][col] == 0) {
                    var place = [row, col];
                    placements.push(place);
                }
            }
        }
        return placements;

    }
}

// You must invoke GAMER.addGame to register your TicTacToe class with the Gamer system
GAMER.addGame("Tic Tac Toe", TicTacToe);
```

# <a name="addi">How to add an AI for your game</a>

In Gamer, an  AI is simply a function that takes a game instance as an argument,
and returns a "move".

After you have defined an AI function, you must register the function with Gamer.

We can create a very simple, and very dumb, AI for Tic Tac Toe as follows:

```js

function dumbTttAi(game) {
    var placements = game.getPossiblePlacements();
    assert(placements.length > 0);
    return placements[0];
}

// Register the AI with Gamer
GAMER.addAi("Tic Tac Toe", "Dumb AI", dumbTttAi);
```

For "Select and place" games the AI function must return
a `[select, place]`, where `select` is a `[row, col]` value
indicating the square to select, and `place` is a `[row, col]`
value indicate the square to place the piece that was selected.

