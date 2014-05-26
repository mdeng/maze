document.MAZE = document.MAZE || {};


function restart() {
	var start = Session.get('start');
	Session.set('me', {r: start.r, c: start.c});
	Session.set('covered', []);
	// replace deleted blocks
	var board = Session.get('board');
	var deleted = Session.get('deleted');
	for (var i = 0; i < deleted.length; i++) {
		board[deleted[i].r][deleted[i].c] = WALL;
	}
	Session.set('board', board);
	Session.set('deleted', []);
}

// initialize


function new_game() {
	new_maze();
	Session.set('score', 0);
}

function new_maze() {	 /// altenately, next_puzzle
	Session.set('covered', []);
	Session.set('deleted', []);
	console.log('ok');

	// Initialize board
	var board = [];
	// construct a maze
	while(!construct_maze(board)) {
		console.log('attempting to construct maze');
	}
	console.log('done');
	Session.set('board', board);

	// save board info
	var walls = [];
	for (var i = 0; i < ROWS; i++) {
		for (var j = 0; j < COLS; j++) {
			if (board[i][j] == WALL) {
				walls.push({r:i, c:j});
			}
		}
	}
	Session.set('walls', walls);

	var path = Session.get('path');
	$("#fade").unbind("click");
  
	path.pop(0);
	$("#fade").bind("click", function() {
    	document.MAZE.display.show_blocks(path, Template.path, ".path", 1000);
  	});
}

function construct_maze(board) {
	// board 
	for (var i = 0; i < ROWS; i++) {	
		board[i] = Array.apply(null, new Array(COLS)).map(Number.prototype.valueOf, EMPTY);
	}
	//  border walls
	for (var i = 0; i < COLS; i++) {
		board[0][i] = WALL_PERM;
		board[ROWS-1][i] = WALL_PERM;
	}
	for (var i = 1; i < ROWS-1; i++) {
		board[i][0] = WALL_PERM;
		board[i][COLS-1] = WALL_PERM;
	}

	// pick start and end
	var start = Session.get("start");
	var end = Session.get("end");
	if (start != undefined) {
		board[start.r][start.c] = WALL_PERM;
		board[end.r][end.c] = WALL_PERM;
	}
	console.log('hi');
	console.log(board);
	start = {r:0, c:Math.floor(Math.random()*(COLS-2))+1};
	end = {r:ROWS-1, c:Math.floor(Math.random()*(COLS-2))+1};

	var path = [];
	board[start.r][start.c] = PATH;
	board[end.r-1][end.c] = PATH;
	board[end.r][end.c] = END;

	path.push({r:end.r-1, c:end.c});
	path.push({r:start.r, c:start.c});
	path.push({r:end.r, c:end.c});
	Session.set('path', path);

	Session.set('start', start);
	Session.set('end', end);

	Session.set('me', {r: start.r, c: start.c, dir: DOWN});

	cur = {r: start.r, c: start.c, dir: null};

	var nwalls = 0;
	while (nwalls < MIN_WALLS) {
		console.log('walls: '+nwalls);
		if (!choose_next(cur, board)) {
			return false;
		}
		nwalls++;
	}

	return construct_end(cur, end, board);
}

function construct_end(cur, end, board) {
	while (cur.c == end.c) {
		var dest = get_dest(cur, DOWN, board);
		if (dest.r == ROWS-1) {
			return;  // already can reach bottom
		} else {
			if (!choose_next(cur, board)) {
				return false;
			}
		}
	}

	var finish = function(tcur, tend) {
		var path = Session.get('path');

		if (tcur.c < tend.c) { // need to move right, then down
			var c = tcur.c;
			while (c < tend.c && board[tcur.r][c+1] < WALL) {
				c++;
			}
			if (c == tend.c && board[tcur.r][c+1] == EMPTY) {
				var tfin = get_dest({r:tcur.r, c:tend.c}, DOWN, board);
				if (tfin.r == ROWS-1) {
					//console.log('type 1 works');
					board[tcur.r][tend.c+1] = WALL;
					for (var i = tcur.c; i < tend.c; i++) {
						board[tcur.r][i] = PATH;
						path.push({r:tcur.r, c:i});

					}
					for (var i = tcur.r; i < ROWS-1; i++) {
						board[i][tend.c] = PATH;
						path.push({r:i, c:tend.c});
					}
					Session.set('path', path);
					return true;
				}
			}
			console.log('type 1 fail');
			return false;

		} else { // need to move left, then down
			var c = tcur.c;
			while (c > tend.c && board[tcur.r][c-1] < WALL) {
				c--;
			}
			if (c == tend.c && board[tcur.r][c-1] == EMPTY) {
				var tfin = get_dest({r:cur.r, c:tend.c}, DOWN, board);
				if (tfin.r == ROWS-1) {
					//console.log('type 2 works');
					board[tcur.r][tend.c-1] = WALL;
					for (var i = tcur.c; i > tend.c; i--) {
						board[tcur.r][i] = PATH;
						path.push({r:tcur.r, c:i});
					}
					for (var i = tcur.r; i < ROWS-1; i++) {
						board[i][tend.c] = PATH;
						path.push({r:i, c:tend.c});
					}
					Session.set('path', path);
					return true;
				}
			}
			console.log('type 2 fail');
			return false;
		}
	};

	while (!finish(cur, end)) {
		if (!choose_next(cur, board)) {
			return false;
		}
	}

	return true;
}

function get_dest(cur, dir, board) {
	if (dir == UP) {
		var r = cur.r;
		while (r-1 >= 0 && board[r-1][cur.c] < WALL) {
			r--;
		}
		return {r: r, c: cur.c};

	} else if (dir == DOWN) {
		var r = cur.r;
		while (r+1 < ROWS && board[r+1][cur.c] < WALL) {
			r++;
		}
		return {r: r, c: cur.c};
	} if (dir == LEFT) {
		var c = cur.c;
		while (c-1 >= 0 && board[cur.r][c-1] < WALL) {
			c--;
		}
		return {r: cur.r, c: c};
	} if (dir == RIGHT) {
		var c = cur.c;
		while (c+1 < COLS && board[cur.r][c+1] < WALL) {
			c++;
		}
		return {r: cur.r, c: c};
	}
}

function move_dest(cur, dir) {
	var r = cur.r;
	var c = cur.c;
	var board = Session.get('board');
	var covered = Session.get('covered');
	var deleted = Session.get('deleted');
	var walls = Session.get('walls');
	var wall;
	if (dir == UP) {
		while (r-1 >= 0 && board[r-1][c] < WALL) {
			covered.push({r: r, c: c});
			r--;
		}
		wall = {r:r-1, c:c};
	} else if (dir == DOWN) {
		while (r+1 < ROWS && board[r+1][c] < WALL) {
			covered.push({r: r, c: c});
			r++;
		}
		wall = {r:r+1, c:c};
	} else if (dir == LEFT) {
		while (c-1 >= 0 && board[r][c-1] < WALL) {
			covered.push({r: r, c: c});
			c--;
		}
		wall = {r:r, c:c-1};
	} else if (dir == RIGHT) {
		while (c+1 < COLS && board[r][c+1] < WALL) {
			covered.push({r: r, c: c});
			c++;
		}
		wall = {r:r, c:c+1};
	}
			console.log(wall);
	if (wall.r >= 0 && wall.r < ROWS && board[wall.r][wall.c] == WALL) {
		board[wall.r][wall.c] = EMPTY;
		deleted.push({r:wall.r, c:wall.c});
		Session.set('deleted', deleted);
		Session.set('board', board);
	} else {
		wall = null;
	}
	Session.set('covered', covered);
	console.log("?D?FDF?D");
	var callback;
	if (deleted.length == walls.length) {
		console.log("finish!!!");
		callback = try_finish;
	} else {
		console.log("nope");
		callback = function() {};
	}
	return {dest:{r: r, c: c}, wall: wall, callback: callback};
}

function choose_next(cur, board) {
	// compute possible walls
	print_board(board, COLS, ROWS);
	possible = [];

	// radiate outwards
	if (cur.dir == UP || cur.dir == DOWN) {
		// left
		if (cur.c > 1 && board[cur.r][cur.c - 1] < WALL) {
			var c = cur.c - 2;
			while (c >= 0 && board[cur.r][c] < WALL) {
				if (board[cur.r][c] != PATH) {
					possible.push({r:cur.r, c:c, dir: LEFT});
				}
				c--;
			}
		}

		// right
		if (cur.c < COLS - 1 && board[cur.r][cur.c + 1] < WALL) {
			var c = cur.c+2;
			while (c < COLS && board[cur.r][c] < WALL) {
				if (board[cur.r][c] != PATH) {
					possible.push({r:cur.r, c:c, dir: RIGHT});
				}
				c++;
			}
		}
	}
	else { //if (cur.dir == RIGHT || cur.dir == LEFT) {
		// up
		if (cur.r > 1 && board[cur.r - 1][cur.c] < WALL) {
			var r = cur.r - 2;
			while (r >= 0 && board[r][cur.c] < WALL) {
				if (board[r][cur.c] != PATH) {
					possible.push({r:r, c:cur.c, dir: UP});
				}
				r--;
			}
		}

		// down
		if (cur.r < ROWS - 1 && board[cur.r + 1][cur.c] < WALL) {
			var r = cur.r + 2;
			while (r < ROWS && board[r][cur.c] < WALL) {
				if (board[r][cur.c] != PATH) {
					possible.push({r:r, c:cur.c, dir: DOWN});
				}
				r++;
			}
		}
	}

	if (possible.length == 0) {
		return false;
	}

	// choose one of the possible ones
	var next_wall = possible[_.random(possible.length-1)];
	console.log(possible);
	console.log(next_wall);

	board[next_wall.r][next_wall.c] = WALL;
	print_board(board, COLS, ROWS);

	var path = Session.get('path');
	if (next_wall.dir == UP) {
		// flag all things on the path
		for (var r = cur.r; r > next_wall.r; r--) {
			//throw new Error("lol");
			board[r][cur.c] = PATH;
			path.push({r:r, c: cur.c});
		}
		cur.r = next_wall.r+1;
		cur.dir = UP;	
	}
	else if (next_wall.dir == DOWN) {
		for (var r = cur.r; r < next_wall.r; r++) {
			board[r][cur.c] = PATH;
			path.push({r:r, c: cur.c});
		}
		cur.r = next_wall.r-1;
		cur.dir = DOWN;	
	}	
	else if (next_wall.dir == LEFT) {
		for (var c = cur.c; c > next_wall.c; c--) {
			board[cur.r][c] = PATH;
			path.push({r:cur.r, c:c});
		}
		cur.c = next_wall.c+1;
		cur.dir = LEFT;	
	}
	else if (next_wall.dir == RIGHT) {
		for (var c = cur.c; c < next_wall.c; c++) {
			board[cur.r][c] = PATH;
			path.push({r:cur.r, c:c});
		}
		cur.c = next_wall.c-1;
		cur.dir = RIGHT;	
	}
	print_board(board, COLS, ROWS);
	Session.set('path', path);
	return true;
}

function move(dir) {
	var res = move_dest(Session.get('me'), dir);
	document.MAZE.display.animate_move(res);
	Session.set('me', res.dest);
}

function try_finish() {
	console.log("try finish");
	var end = Session.get('end');
	var me = Session.get('me');
	if (me.r == end.r && me.c == end.c) {
		Session.set('score', Session.get('score')+1);
		new_maze();
		document.MAZE.display.new_game();
	}
}

function print_sparse(block_data) {
	for (var i = 0; i < block_data.length; i++) {
		console.log(block_data[i]);
	}
}

function print_board(board_data, xm, ym) {
	var str = '';
	for (var i = 0; i < ym; i++) {
		for (var j = 0; j < xm; j++) {
			str += board_data[i][j];
		}
		str += '\n';
	}
	console.log(str);
}

document.MAZE.game = {
	move: move,
	new_game: new_game,
	restart: restart,
	try_finish: try_finish, 
};
