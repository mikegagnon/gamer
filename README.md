# Gamer

Gamer is an AI Laboratory for JavaScript, designed to help students (A) acquire programming practice, and (B) develop AIs based on MiniMax. [Check it out](https://mikegagnon.github.io/gamer/).

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
- [How to develop a new AI](#newai)

# <a name="newgame">How to add a new game to Gamer</a>

## Game types

The first thing you need to know is that there are two types of games that Gamer can work with:

1. "**Place**" games, such as Tic Tac Toe, Connect Four, and Othello. In a "place" game, players take turns *placing* pieces onto the board.
2. "**Select and place**" games, such as Checkers and Chess. In a "select and place" game, on a player's turn the player *selects* a piece, then *places* that piece.

## Setup

Let's say you want to remake Tic Tac Toe on your own.

```
$ git clone https://github.com/mikegagnon/gamer.git
$ cd gamer
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

## Game classes

`gamerConfig`

`numRows`

`numCols`

`matrix`

`getImageFilename`

`gameOver`

`player`

`selectAndPlace(select, place)`

`placePiece(place)`

`getPossiblePlacements()`

`getPossiblePlacements(select)`

# <a name="newai">How to develop a new AI</a>
