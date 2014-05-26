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


function setup() {
	var game = $(".game").get(0);
	// build permanent walls
	for (var i = 1; i < ROWS-1; i++) {
		var w1 = UI.renderWithData(Template.wallperm, 
			{row: i, col: 0, top:i*BLOCK_DIM, left:0});
		UI.insert(w1, game);

		var w2= UI.renderWithData(Template.wallperm, 
		{row: i, col: COLS-1, top:i*BLOCK_DIM, left:(COLS-1)*BLOCK_DIM});
		UI.insert(w2, game);
	}
	
	for (var j = 0; j < COLS; j++) {
		var w1 = UI.renderWithData(Template.wallperm, 
		{row: 0, col: j, top:0, left:j*BLOCK_DIM});
		UI.insert(w1, game);

		var w2= UI.renderWithData(Template.wallperm, 
		{row: ROWS-1, col: j, top:(ROWS-1)*BLOCK_DIM, left:j*BLOCK_DIM});
		UI.insert(w2, game);
	}

	// build permanent walls
	var start = Session.get("start");
	var end = Session.get("end");
	$("[data-coords="+start.r+"-"+start.c+"]").addClass("empty");
	$("[data-coords="+end.r+"-"+end.c+"]").addClass("empty");
	// build normal walls
	add_blocks(Session.get('walls'), Template.block, ".wall");
	// build player
	add_blocks([Session.get('me')], Template.me, ".me");
	// make blocks visible
	$(".block:not(.empty)").css({opacity:1});
	
	// yay
	$("body").transit({opacity:1}, 1000, "easeOutQuart", function () {});
}

function new_game() {
	// redo walls
	var start = Session.get("start");
	var end = Session.get("end");

	$(".empty").addClass("replaced");
	$(".empty").removeClass("empty");
	$("[data-coords="+start.r+"-"+start.c+"]").addClass("empty");
	$("[data-coords="+end.r+"-"+end.c+"]").addClass("empty");

	$(".replaced:not(.empty)").transit({opacity:1}, 1000, "easeOutQuart", function() {});
	$(".empty").transit({opacity:0}, 1000, "easeOutQuart", function () {});
	$(".replaced").removeClass("replaced");

	$(".wall").remove();
	$(".path").remove();

	show_blocks(Session.get('walls'), Template.block, ".wall");

	redraw_me();
}

function add_blocks(blocks, template, block_class) {
	console.log(block_class);
	console.log(blocks);
	var game = $(".game").get(0);
	for (var i = 0; i < blocks.length; i++) {
		var renderedWall = UI.renderWithData(template, 
			{row: blocks[i].r, col: blocks[i].c, 
			 top: blocks[i].r*BLOCK_DIM, left:blocks[i].c*BLOCK_DIM});
		UI.insert(renderedWall, game);		
	}
}

function show_blocks(blocks, template, block_class, duration) {
	add_blocks(blocks, template, block_class);

	duration = duration || 1000;

	var el = $(block_class);
	el.transit({
		opacity: 1
	}, duration);
}

function restart() {
	var old_el = $(".me");
	old_el.removeClass("me");

	show_blocks(Session.get("deleted"), Template.block, ".wall", 1000);
	show_blocks([Session.get("start")], Template.me, ".me", 1000);

	old_el.transit({opacity:0}, 1000, "easeOutQuart", function(){
		old_el.remove();
	});
}

function redraw_me() {
	var old_el = $(".me");
	old_el.removeClass("me");

	show_blocks([Session.get("start")], Template.me, ".me", 1000);

	old_el.transit({opacity:0}, 1000, "easeOutQuart", function(){
		old_el.remove();
	});
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
	show_blocks: show_blocks,
	restart: restart,
	setup:setup,
	new_game:new_game,
};