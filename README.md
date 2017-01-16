# Gamer

Gamer is an AI Laboratory for JavaScript, designed to help students (A) acquire programming practice, and (B) develop AIs based on MiniMax.

Gamer simplifies game development by providing out-of-the box graphics and controls.
The student only needs to develop the game logic itself.

Gamer works well for games like:

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

The first thing you need to know is that there are two types of games Gamer can work with:

1. "**Place**" games, such as Tic Tac Toe, Connect Four, and Othello. In a "place" game, players take turns *placing* pieces onto the board.
2. "**Select and place**" games, such as Checkers and Chess. In a "select and place" game, on a player's turn the player *selects* a piece, then *places* that piece.

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
