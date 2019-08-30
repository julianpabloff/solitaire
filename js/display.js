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
		//cardY = 40;
		topY = cardY - cardHeight - margin;

		wastePos = {x: cardX + cardWidth + margin, y: topY};
		stockPos = {x: cardX, y: topY};
		foundationPos = {x: [], y: topY};
		for (let i = 0; i < 4; i++)
			foundationPos.x.push(cardX + (cardWidth + margin) * (3 + i));
	}

	let cardWidth = 14; let cardHeight = 10;
	let rows, columns, cardX, cardY;
	let wastePos, stockPos, foundationPos;
	let margin = 4;
	this.setSize();

	const colors = {
		fg : {black:'\x1b[30m', red:'\x1b[31m', green:'\x1b[32m', white:'\x1b[37m', reset:'\x1b[0m'},
		bg : {black:'\x1b[40m', red:'\x1b[41m', green:'\x1b[42m', white:'\x1b[47m', reset:'\x1b[0m'},
		reset : '\x1b[0m'
	};

	let foreground = colors.reset;
	let background = colors.reset;

	const setFg = function(colorName) { 
		stdout.write(colors.fg[colorName]);
		foreground = colors.fg[colorName];
	}
	const setBg = function(colorName) { 
		stdout.write(colors.bg[colorName]);
		background = colors.bg[colorName];
	}

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
	const logo = [
		'                                                                                                 ',
		'  █████████  █████████  ██        ████████  ████████  █████████  ████████  █████████  █████████  ',
		'  ██         ██     ██  ██           ██        ██     ██     ██     ██     ██     ██  ██         ',
		'  █████████  ██     ██  ██           ██        ██     █████████     ██     █████████  ████████   ',
		'         ██  ██     ██  ██           ██        ██     ██     ██     ██     ██    ██   ██         ',
		'  █████████  █████████  ████████  ████████     ██     ██     ██  ████████  ██     ██  █████████  ',
		'                                                                                                 ',
	];
	const options = ['  NEW GAME  ', '  CONTINUE  ', '  SETTINGS  ', '    QUIT    '];

	const centerString = function(string) { return Math.floor(columns/2) - Math.floor(string.length/2) }

	this.drawSquare = function(x, y, width, height) {
		stdout.cursorTo(x, y);
		stdout.write('┌');
		for (let i = 0; i < width - 2; i++) {
			stdout.write('─');
		}
		stdout.write('┐');
		for (let i = 0; i < height - 2; i++) {
			stdout.cursorTo(x, y + 1 + i);
			stdout.write('│');
			stdout.cursorTo(x + width - 1, y + 1 + i);
			stdout.write('│');
		}
		stdout.cursorTo(x, y + height - 1);
		stdout.write('└');
		for (let i = 0; i < width - 2; i++) {
			stdout.write('─');
		}
		stdout.write('┘');
	}

	this.drawMainMenu = function(selectedIndex) {
		let x = centerString(logo[0]);
		let y = Math.floor(rows * 0.35);
		setFg('white'); setBg('black');
		this.drawSquare(x-1, y-1, logo[0].length + 2, logo.length + 2);
		for (let i = 0; i < logo.length; i++) {
			stdout.cursorTo(x, y + i);
			stdout.write(logo[i]);
		}

		let optionsY = y + logo.length + 4;
		let boxWidth = 16;
		let boxX = Math.floor(columns/2) - Math.floor(boxWidth/2);
		setBg('black'); setFg('white');
		for (let i = 0; i < options.length + 5; i++) {
			stdout.cursorTo(boxX, optionsY - 1 + i);
			for (let j = 0; j < boxWidth; j++) {
				stdout.write(' ');
			}
		}
		this.drawSquare(boxX, optionsY - 1, boxWidth, options.length + 5);
		for (let i = 0; i < options.length; i++) {
			stdout.cursorTo(centerString(options[i]), optionsY + 2 * i);
			if (i == selectedIndex) {
				setFg('black');
				setBg('white');
			} else {
				setFg('white');
				setBg('black');
			}
			stdout.write(options[i]);
		}
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
		if (!card.faceUp) {
			this.clearCard(x,y);
			this.drawCardBox(x,y);
			return;
		}
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
			let x = cardX + (cardWidth + margin) * p;
			for (let c = 0; c < piles[p].length; c++) {
				let y = cardY + 2 * c;
				if (piles[p][c].faceUp == false) this.drawCardBack(x, y);
				else this.drawCard(piles[p][c], x, y);
			}
		}

		this.updateDeck(stock, waste);
		this.updateFoundations(foundations);
	}

	this.clearGameBoard = function() {
		setBg('green');
		for (let i = topY; i < rows; i++) {
			stdout.cursorTo(0, i);
			for (let j = 0; j < columns; j++) {
				stdout.write(' ');
			}
		}
	}

	this.wasteLength = 0;
	this.updateDeck = function(stock, waste) {
		if (stock.length == 0) this.drawFoundationSpot(cardX, topY);
		if (stock.length > 0) this.drawCardBack(cardX, topY);

		let cardSet = [];
		if (waste.length == 0) {
			this.clearCard(wastePos.x, wastePos.y);
			this.clearCard(wastePos.x + 8, wastePos.y);
		} else {
			this.clearCard(wastePos.x + 8, wastePos.y);
			let i = 0;
			while (i < 3 && i < waste.length) {
				cardSet.unshift(waste[waste.length - 1 - i]);
				i++;
			}
			this.wasteLength = i;
		}
		for (let c = 0; c < cardSet.length; c++)
			this.drawCard(cardSet[c], wastePos.x + c * 4, wastePos.y);
	}

	this.updateFoundations = function(foundations) {
		for (let i = 0; i < foundations.length; i++) {
			if (foundations[i].length == 0) {
				this.drawFoundationSpot(foundationPos.x[i], foundationPos.y);
			} else {
				let topCard = foundations[i][foundations[i].length-1];
				this.drawCard(topCard, foundationPos.x[i], foundationPos.y);
			}
		}
	}

	this.drawPile = function(pile, index, diff) {
		let x = cardX + (cardWidth + margin) * index;
		//stdout.cursorTo(x, cardY - 1);
		//stdout.write(colors.bg.black + colors.fg.white + pile.length.toString());

		if (diff < 0) { // The pile that loses cards
			let y = cardY + 2 * pile.length;
			/*for (i = 0; i < Math.abs(diff); i++) {
				this.clearCard(x, y + 2 * i);
			}*/
			let i = 0;
			while (i < 10 + 2 * (Math.abs(diff) - 1)) {
				setBg('green');
				stdout.cursorTo(x, y + i);
				stdout.write('              ');
				i++;
			}
			if (pile.length > 0)
				this.drawCard(pile[pile.length-1], x, y - 2);
		}
		if (diff > 0) { // The pile that gains cards
			let y = cardY + 2 * (pile.length - Math.abs(diff));
			for (i = 0; i < Math.abs(diff); i++) {
				let card = pile[pile.length - diff + i];
				if (card.faceUp) this.drawCard(card, x, y + 2 * i);
			}
		}
	}

	this.drawController = function(controller) {
		let buffer = controller.buffer;

		setBg('green'); setFg('black');
		for (let i = 0; i < 7; i++) {
			stdout.cursorTo(cardX + i * (cardWidth + margin), cardY - 2);
			//stdout.write(pileName(i));
			stdout.write('              ');
		}
		stdout.cursorTo(cardX + cardWidth + margin, topY - 2);
		for (let i = 0; i < 22; i++) stdout.write(' ');
		let wasteX = cardX + cardWidth + margin + 4 * (this.wasteLength - 1)

		if (buffer.length == 1) {
			if (buffer[0].type == 'pile') {
				let index = buffer[0].index;
				setBg('white');
				stdout.cursorTo(cardX + index * (cardWidth + margin), cardY - 2);
				stdout.write(pileName(index));
			}
			if (buffer[0].type == 'waste') {
				setBg('white');
				stdout.cursorTo(wasteX, topY - 2);
				stdout.write('   TOP PILE   ');
			}
		}
		if (buffer.length == 2) {
			let firstIndex = buffer[0].index;
			let secondIndex = buffer[1].index;
			let firstX = cardX + firstIndex * (cardWidth + margin);
			let secondX = cardX + secondIndex * (cardWidth + margin);

			if (controller.toMode) {
				if (buffer[0].type == 'pile') {
					setFg('white'); setBg('black');
					stdout.cursorTo(firstX, cardY - 2);
					stdout.write(pileName(firstIndex));
				}
				if (buffer[0].type == 'waste') {
					setFg('white'); setBg('black');
					stdout.cursorTo(wasteX, topY - 2);
					stdout.write('   TOP PILE   ');
				}
				if (secondIndex != firstIndex || buffer[0].type == 'waste') {
					stdout.cursorTo(secondX, cardY - 2);
					setFg('black'); setBg('white');
					stdout.write(pileName(secondIndex));
				}
			}
		}
		function pileName(index) {
			return '    PILE ' + (index + 1) + '    ';
		}

		stdout.cursorTo(cardX + cardWidth + margin, topY - 2)
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
		for (let i = 0; i < 25; i++) {
			for (let j = 0; j < columns; j++) {
				stdout.cursorTo(j, i);
				stdout.write(' ');
			}
		}
		stdout.cursorTo(0,0); stdout.write('STOCK');
		for (let i = 0; i < game.stock.length; i++) {
			drawCardText(game.stock[i], 0, 1 + i);
		}
		stdout.cursorTo(10,0); stdout.write('WASTE');
		for (let i = 0; i < game.waste.length; i++) {
			drawCardText(game.waste[i], 10, 1 + i);
		}
		stdout.cursorTo(20,0); stdout.write('PILES');
		for (let p = 0; p < game.piles.length; p++) {
			for (let c = 0; c < game.piles[p].length; c++) {
				drawCardText(game.piles[p][c], 20 + p * 5, 1 + c);
			}
		}
		stdout.cursorTo(58, 0); stdout.write('FOUNDATIONS');
		for (let f = 0; f < game.foundations.length; f++) {
			for (let c = 0; c < game.foundations[f].length; c++) {
				drawCardText(game.foundations[f][c], 58 + f * 5, 1 + c);
			}
		}
		function drawCardText(card, x, y) {
			if (card.suit == 'h' || card.suit == 'd') setFg('red');
			else setFg('white');
			stdout.cursorTo(x,y);
			stdout.write(card.value.toString() + card.suit);
			setFg('white');
		}

	}
	this.debugActions = function(cardAction) {
		stdout.cursorTo(20, 20); stdout.write('ACTION:');
		stdout.cursorTo(20, 22); stdout.write(cardAction.description);
		stdout.cursorTo(20, 23);
		if (cardAction.valid) stdout.write(colors.fg.green + 'VALID');
		else stdout.write(colors.fg.red + 'INVALID');
	}
	this.debugController = function(game, controller, history) {
		stdout.write(colors.reset);
		for (let i = 0; i < 23; i++) {
			for (let j = 0; j < columns; j++) {
				stdout.cursorTo(j, i);
				stdout.write(' ');
			}
		}
		stdout.cursorTo(1,1); console.log('BUFFER:');
		stdout.cursorTo(1,2); console.log(controller.buffer);
		stdout.cursorTo(1,4); console.log('ACTION:');
		stdout.cursorTo(1,5); console.log(controller.action);
		stdout.cursorTo(10, 1); console.log('(TO MODE: ' + controller.toMode + ')');
		stdout.cursorTo(30, 1); console.log('lastIndex: ' + controller.lastIndex);
		stdout.cursorTo(60, 1); console.log('pileData:');
		stdout.cursorTo(60, 2); console.log(controller.pileData);
		stdout.cursorTo(1, 10); console.log('HISTORY LENGTH: ' + history.length);
		if (history.length > 0) {
			stdout.cursorTo(1,12); console.log('NEXT REVERSE COMMAND:');
			stdout.cursorTo(3, 13);
			let command = history[history.length-1];
			console.log(command);
		}
	}

}

module.exports = Display;
