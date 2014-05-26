document.MAZE = document.MAZE || {};

COLS = 30;
ROWS = 20;

LEFT = 37;
RIGHT = 39;
UP = 38;
DOWN = 40;

EMPTY = 0
PATH = 2
END = 3
PLAYER = 4
COVERED = 5

WALL = 10
WALL_PERM = 11

MIN_WALLS = 10



Template.score.score = function() {
  return Session.get('score');  
}

$(function() {
  // Start new game if none exists
  if (!Session.get("board")) {
    console.log("no blocks");
    document.MAZE.game.new_game();
    document.MAZE.display.setup();
  } else {
    document.MAZE.display.render_board();
  }

  // Handle keypresses
  var queue = [];
  $(window).on("keydown", function(e) {
    if (e.keyCode === LEFT ||
        e.keyCode === RIGHT ||
        e.keyCode === UP ||
        e.keyCode === DOWN)  {
      e.preventDefault();
      document.MAZE.game.move(e.keyCode);
    }
  });

  // Handle "new game"
  $("#new-game").click(function(){
    document.MAZE.game.new_game();
    console.log("done");
    document.MAZE.display.new_game();
  });

  $("#restart").click(function() {
    document.MAZE.game.restart();
    document.MAZE.display.restart();
  });
});

