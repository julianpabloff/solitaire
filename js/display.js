const Display = function() {

	let stdout = process.stdout;

	this.clear = () => stdout.write('\x1b[2J');
	this.init = function() {
		this.clear();
		stdout.cursorTo(0,0);
		greenBackground();
		stdout.write('\x1b[?25l');
	}

	this.setSize = function() {
		rows = stdout.rows;
		columns = stdout.columns;
		cardX = Math.floor((columns - (cardWidth + margin) * 7 + margin) / 2);
		cardY = Math.floor((rows - cardHeight) / 2);
		wastePos = {x: cardX + cardWidth + margin, y: cardY - cardHeight - margin + 1};
		stockPos = {x: cardX, y: cardY - cardHeight - margin + 1};
	}

	let cardWidth = 14; let cardHeight = 10;
	let rows, columns, cardX, cardY, wastePos;
	let margin = 4;
	this.setSize();

	const colors = {
		fg : {black:'\x1b[30m', red:'\x1b[31m', magenta:'\x1b[35m', cyan:'\x1b[36m', white:'\x1b[37m'},
		bg : {black:'\x1b[40m', red:'\x1b[41m', green:'\x1b[42m', white:'\x1b[47m'},
		reset : '\x1b[0m'
	};
	const setFg = function(color_name) { stdout.write(colors.fg[color_name]) }
	const setBg = function(color_name) { stdout.write(colors.bg[color_name]) }

	const greenBackground = function() {
		stdout.write(colors.bg.green);
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < columns; c++) {
				stdout.write(' ');
			}
		}
		stdout.write(colors.fg.black);
	}

	const cardBox = ['┌────────────┐', '│            │', '└────────────┘'];
	const cardVals = [null,'A','2','3','4','5','6','7','8','9','10','J','Q','K'];
	const cardSuits = {
		'h' : ['  _  _  ', ' / \\/ \\ ', ' \\    / ', '  \\  /  ', '   \\/   '],
		'c' : ['   __   ', ' _|  |_ ', '[      ]', '[__  __]', '   /\\   '],
		'd' : ['        ', '   /\\   ', '  /  \\  ', '  \\  /  ', '   \\/   '],
		's' : ['   /\\   ', '  /  \\  ', ' /    \\ ', ' \\_/\\_/ ', '   /\\   '],
		'j' : ['  ____  ', ' /\\  _\\ ', '/ 0  0 \\', '\\ \\__/ /', ' \\____/ '],
	}

	this.drawCardBox = function(x, y) {
		for (let i = 0; i < 10; i++) {
			stdout.cursorTo(x, y+i);
			if (i == 0) stdout.write(cardBox[0]);
			else if (i > 0 && i < 9) stdout.write(cardBox[1]);
			else stdout.write(cardBox[2]);
		}
	}

	this.drawCard = function(card, x, y) {
		let suit = card.suit;
		let value = cardVals[card.value];

		stdout.write(colors.fg.white);
		if (suit == 'h' || suit == 'd') stdout.write(colors.bg.red);
		else stdout.write(colors.bg.black);
		this.drawCardBox(x, y);
		for (let i = 0; i <= 4; i++) {
			stdout.cursorTo(x + 3, y + 2 + i);
			stdout.write(cardSuits[suit][i]);
		}
		// Stamps the values on the corners
		stdout.cursorTo(x + 2, y + 1);
		stdout.write('  ');
		stdout.cursorTo(x + 2, y + 1);
		stdout.write(value.toString());
		stdout.cursorTo(x + 7, y + 8);
		stdout.write('  ');
		stdout.cursorTo(x + 12 - value.length, y + 8);
		stdout.write(value);
		stdout.cursorTo(0,0);

		stdout.write(colors.reset);
	}

	this.drawCardBack = function(x, y) {
		stdout.write(colors.bg.white);
		stdout.write(colors.fg.black);
		this.drawCardBox(x,y, false);
		for (let i = 1; i < 9; i+=2) {
			stdout.cursorTo(x + 1, y+i);
			stdout.write('· · · · · · ');
			stdout.cursorTo(x + 1, y+i+1);
			stdout.write(' · · · · · ·');
		}
	}

	this.drawFoundationSpot = function(x, y) {
		stdout.write(colors.fg.black);
		stdout.write(colors.bg.green);
		for (let i = 0; i < 10; i++) {
			stdout.cursorTo(x, y + i);
			stdout.write('░░░░░░░░░░░░░░');
		}
		stdout.write(colors.reset);
	}

	this.clearCard = function(x, y) {
		setBg('green');
		for (let i = 0; i < cardHeight; i++) {
			stdout.cursorTo(x, y+i);
			stdout.write('              ');
		}
	}

	this.drawGameBoard = function(game) {
		let stock = game.stock; let waste = game.waste;
		let piles = game.piles; let foundations = game.foundations;

		for (let p = 0; p < piles.length; p++) {
			for (let c = 0; c < piles[p].length; c++) {
				let x = cardX + (cardWidth + margin) * p;
				let y = cardY + 2 * c;
				if (piles[p][c].faceUp == false) this.drawCardBack(x, y);
				else this.drawCard(piles[p][c], x, y);
			}
		}

		stdout.write(colors.bg.green);
		this.updateDeck(stock, waste);
		for (let i = 0; i < 4; i++)
			this.drawFoundationSpot(cardX + (cardWidth + margin) * (3 + i), cardY - cardHeight - margin + 1);
	}
	this.updateDeck = function(stock, waste) {
		if (waste.length == 0) {
			this.clearCard(wastePos.x, wastePos.y);
			this.clearCard(wastePos.x + 8, wastePos.y);
		}
		if (stock.length > 0) this.drawCardBack(cardX, cardY - cardHeight - margin + 1);
		else this.drawFoundationSpot(cardX, cardY - cardHeight - margin + 1);

		if (waste.length > 0) {
			if (waste[waste.length-1].length > 2)
				this.drawCard(waste[waste.length-1][2], wastePos.x, wastePos.y);
			if (waste[waste.length-1].length > 1)
				this.drawCard(waste[waste.length-1][1], wastePos.x + 4, wastePos.y);
			if (waste[waste.length-1].length > 0)
				this.drawCard(waste[waste.length-1][0], wastePos.x + 8, wastePos.y);
		}
	}

	this.resize = function() {
		if (rows != stdout.rows || columns != stdout.columns) {
			console.log('RESIZE');
		}
	}

	this.exit = function() {
		stdout.write('\x1b[?25h' + colors.reset);
		stdout.cursorTo(0,0);
		//this.clear();
	}

	this.debug = function(game) {
		console.clear();
		stdout.cursorTo(0,0); stdout.write('STOCK');
		for (let i = 0; i < game.stock.length; i++) {
			stdout.cursorTo(0,i + 1);
			stdout.write(game.stock[i].value.toString() + game.stock[i].suit);
		}
		stdout.cursorTo(10,0); stdout.write('WASTE');
		for (let i = 0; i < game.waste.length; i++) {
			for (let j = 0; j < game.waste[i].length; j++) {
				stdout.cursorTo(10, 1 + i * 4 + j);
				stdout.write(game.waste[i][j].value.toString() + game.waste[i][j].suit);
			}
		}
	}
	this.debugController = function(controller) {
		setFg('white');
		setBg('black');
		for (let i = 0; i < 15; i++) {
			stdout.cursorTo(0, i);
			stdout.write('                    ');
		}
		stdout.cursorTo(0,0);
		console.log(controller.buffer);
		console.log(controller.action);
	}

}

module.exports = Display;
