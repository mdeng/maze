document.MAZE = document.MAZE || {};

BLOCK_DIM = 25;

function block_class(block) {
	if (tile === WALL) {
		return "wall";
	}
	else if (block === PLAYER) {
		return "player";
	}
}

function animate_move(res) {
	var el = $('.me');
	el.css("zIndex", 100);

	var func = function() {
		if (res.wall) {
			var wall_el = $("[data-coords="+res.wall.r+"-"+res.wall.c+"]");
			console.log(wall_el);
			wall_el.transit({opacity:0}, 100, 'easeOutQuart', function(){});
		} else {
			console.log("aslkfdjsal");
			res.callback();
		}
		/*el.attr("data-coords", coords(t.i, t.j));
		el.removeClass("blue");
			el.removeClass("red");
			el.removeClass("number");
			el.addClass(document.THREE.util.tile_class(t.t));
			el.html(t.t);*/

			// el.effect("bounce", {distance: 30, times: 3});
	};

	el.transit({
		top: res.dest.r * BLOCK_DIM,
		left: res.dest.c * BLOCK_DIM
	}, 200, 'easeOutQuart', func);
} 

function show_blocks(blocks, template, block_class) {
	var game = $(".game").get(0);
	for (var i = 0; i < blocks.length; i++) {
		var renderedWall = UI.renderWithData(template, 
			{row: blocks[i].r, col: blocks[i].c, 
			 top: blocks[i].r*BLOCK_DIM, left:blocks[i].c*BLOCK_DIM});
		UI.insert(renderedWall, game);		
	}

	var el = $(block_class);
	el.transit({
		opacity: 1
	}, 1000);
}


function redraw_me() {
	$(".me").remove();
	var me = Session.get("me");
	var renderedMe = UI.renderWithData(Template.me, 
		{top:me.r * BLOCK_DIM, left:me.c *BLOCK_DIM});
	UI.insert(renderedMe, $(".game").get(0));
}

function render_board() {
	var board = Session.get("board");
	$(".game").empty();

	var game = $(".game").get(0);

	for (var i = 0; i < ROWS; i++) {
		for (var j = 0; j < COLS; j++) {

			var b = board[i][j];

			if (board[i][j] >= WALL) {
				//var block = Template.block({row: i, col: j, 
											/// left: (j*BLOCK_DIM), top: (i*BLOCK_DIM)});
				//block = $(block).addClass(block_class(WALL));
				//$(".game").append(block);

				var renderedWall = UI.renderWithData(Template.block, 
					{row: i, col: j, top:i*BLOCK_DIM, left:j*BLOCK_DIM});
				UI.insert(renderedWall, game);
			}/*
			else if (board[i][j] == PATH) {
				var renderedWall = UI.renderWithData(Template.path, 
					{row: i, col: j, top:i*BLOCK_DIM, left:j*BLOCK_DIM});
				UI.insert(renderedWall, game);				
			}*/
		}
	}
	document.MAZE.display.redraw_me();
}

document.MAZE.display = {
	animate_move: animate_move,
	render_board: render_board,
	redraw_me: redraw_me,
	show_blocks: show_blocks
};