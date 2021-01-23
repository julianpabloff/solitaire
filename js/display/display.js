const Display = function() {

	let stdout = process.stdout;
	this.draw = function(string, x, y) {
		stdout.cursorTo(x, y);
		stdout.write(string);
	}

	this.clear = () => stdout.write('\x1b[2J');
	this.init = function() {
		this.clear();
		this.setColour('tab');
		this.fillScreen();
		stdout.write('\x1b[?25l');
	}

	this.setSize = function() {
		this.rows = stdout.rows;
		this.columns = stdout.columns;
		//this.columns = 120;

		cardX = Math.floor((this.columns - (cardWidth + margin) * 7 + margin) / 2);
		//cardY = Math.floor((this.rows - cardHeight) / 2);
		cardY = 40;

		// Settings
		settingsX = Math.floor(this.columns / 2 - 36);

		// Game related
		topY = cardY - cardHeight - margin;
		wastePos = {x: cardX + cardWidth + margin, y: topY};
		wasteX = cardX + cardWidth + margin;
		stockPos = {x: cardX, y: topY};
		foundationPos = {x: [], y: topY};
		for (let i = 0; i < 4; i++)
			foundationPos.x.push(cardX + (cardWidth + margin) * (3 + i));
	}

	let cardWidth = 14; let cardHeight = 10; let margin = 4;
	let cardX, cardY;
	let wastePos, stockPos, foundationPos;
	let wasteX;
	let settingsX;
	this.setSize();

	// Game related
	const findPileX = function(index) {
		return cardX + (cardWidth + margin) * index;
	}

	const colors = {
		fg : { black:'\x1b[30m', red:'\x1b[31m', green:'\x1b[32m', blue:'\x1b[34m', cyan:'\x1b[36m', white:'\x1b[37m', reset:'\x1b[0m' },
		bg : { black:'\x1b[40m', red:'\x1b[41m', green:'\x1b[42m', blue:'\x1b[44m', cyan:'\x1b[46m', white:'\x1b[47m', reset:'\x1b[0m' },
		reset : '\x1b[0m'
	};
	this.fullColor = function(fg, bg) {
		return colors.fg[fg] + colors.bg[bg];
	}

	let foreground = colors.reset;
	let background = colors.reset;

	this.setFg = function(colorName) { 
		stdout.write(colors.fg[colorName]);
		foreground = colors.fg[colorName];
	}
	this.setBg = function(colorName) { 
		stdout.write(colors.bg[colorName]);
		background = colors.bg[colorName];
	}
	this.setColor = function(fg, bg) {
		this.setFg(fg); this.setBg(bg);
	}
	this.writeColor = function(colorCode) {
		stdout.write(colorCode);
	}
	this.fillScreen = function() {
		stdout.cursorTo(0,0);
		for (let r = 0; r < this.rows; r++) {
			for (let c = 0; c < this.columns; c++) {
				stdout.write(' ');
			}
		}
	}
	this.drawBackground = function(color) {
		this.setBg(color);
		stdout.cursorTo(0,0);
		for (let r = 0; r < this.rows; r++) {
			for (let c = 0; c < this.columns; c++) {
				stdout.write(' ');
			}
		}
	}
	
	this.themes = require('../../json/newThemes.json');
	this.menuScheme = {};
	this.setTheme = function(name) {
		for (let t of Object.keys(this.themes)) {
			if (name == this.themes[t].title) {
				this.theme = this.themes[t];
				break;
			}
		}
		this.menuScheme.text = (this.theme.title == 'normal' || this.theme.title == 'light') ? 'two' : 'one';
		this.menuScheme.cursor = (this.theme.title == 'dark') ? 'tom' : 'cur';
	}
	this.setColour = function(attribute) {
		this.setFg(this.theme[attribute].fg);
		this.setBg(this.theme[attribute].bg);
	}

	const suits = ['h', 'c', 'd', 's'];
	const values = [1,2,3,4,5,6,7,8,9,10,11,12,13];
	const cardBox = ['┌────────────┐', '│            │', '└────────────┘'];
	const cardVals = [null,'A','2','3','4','5','6','7','8','9','10','J','Q','K'];
	const cardSuits = {
		'h' : ['  _  _  ', ' / \\/ \\ ', ' \\    / ', '  \\  /  ', '   \\/   '],
		'c' : ['   __   ', ' _|  |_ ', '[      ]', '[__  __]', '   /\\   '],
		'd' : ['        ', '   /\\   ', '  /  \\  ', '  \\  /  ', '   \\/   '],
		's' : ['   /\\   ', '  /  \\  ', ' /    \\ ', ' \\_/\\_/ ', '   /\\   '],
		'j' : ['  ____  ', ' /\\  _\\ ', '/ 0  0 \\', '\\ \\__/ /', ' \\____/ '],
	}
	const cardSuitChars = {'h': '♥', 'c': '♣', 'd': '♦', 's': '♠'};
	const pauseOptions = ['   RESUME   ', '  SETTINGS  ', ' SAVE && QUIT '];

	this.centerString = function(string) {
		return Math.floor(this.columns/2 - string.length/2);
	}
	this.centerWidth = function(width) {
		return Math.floor(this.columns/2 - width/2);
	}
	this.centerHeight = function(height) {
		return Math.floor(this.rows/2 - height/2);
	}

	const squareElements = {
		none: {tl: ' ', tr: ' ', bl: ' ', br: ' ', h: ' ', v: ' '},
		thin: {tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│'},
		thick: {tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│'}
	};

	this.drawSquare = function(x, y, width, height, fill, border = 'thin') {
		let piece = squareElements[border];
		this.draw(piece.tl + piece.h.repeat(width - 2) + piece.tr, x, y);

		for (let i = 0; i < height - 2; i++) {
			this.draw(piece.v, x, y + 1 + i);
			if (fill) stdout.write(' '.repeat(width - 2));
			this.draw(piece.v, x + width - 1, y + 1 + i);
		}
		this.draw(piece.bl + piece.h.repeat(width - 2) + piece.br, x, y + height - 1);
	}

	this.animateCards = function() {
		setInterval(() => {
			let x = Math.floor(Math.random() * this.columns);
			let y = Math.floor(Math.random() * this.rows);
			let suit = suits[Math.floor(Math.random() * suits.length)];
			let value = Math.floor(Math.random() * 13) + 1;
			let card = {suit: suit, value: value};
			this.drawCard(card, x, y);
		}, 1000);
	}

	this.drawCardBox = function(x, y) {
		this.drawSquare(x, y, 14, 10, true);
	}

	this.drawCard = function(card, x, y) {
		let suit = card.suit;
		let value = cardVals[card.value];

		if (suit == 'h' || suit == 'd') this.setColour('one');
		else this.setColour('two');

		if (!card.faceUp) {
			this.clearCard(x,y);
			this.drawCardBox(x,y);
			return;
		} // Just in case you draw a card that's supposed to be face down

		this.drawSquare(x, y, 14, 10, true);
		for (let i = 0; i <= 4; i++) {
			stdout.cursorTo(x + 3, y + 2 + i);
			stdout.write(cardSuits[suit][i]);
		}
		// Stamps the values on the corners
		stdout.cursorTo(x + 2, y + 1);
		stdout.write(value.toString() + ' '); //+ cardSuitChars[suit] + ' ');
		stdout.cursorTo(x + 11 - value.length, y + 8);
		stdout.write(' ' + value);
	}

	this.drawCardSide = function(card, x, y) {
		let suit = card.suit;
		let value = cardVals[card.value].toString();
		
		if (suit == 'h' || suit == 'd') this.setColour('one');
		else this.setColour('two');

		this.draw('┌' + '─'.repeat(3), x, y);
		this.draw('│   ', x, y + 1);
		this.draw(value, x + 2, y + 1);
		for (let i = 0; i < 5; i++)
			this.draw('│  ' + cardSuits[suit][i][0], x, y + 2 + i);
		for (let i = 0; i < 2; i++)
			this.draw('│   ', x, y + 7 + i);
		this.draw('└' + '─'.repeat(3), x, y + 9);
	}

	this.drawCardBack = function(x, y) {
		this.setColour('bac');
		this.drawCardBox(x, y);
		for (let i = 1; i < 9; i += 2) {
			stdout.cursorTo(x + 1, y+i);
			stdout.write('· · · · · · ');
			stdout.cursorTo(x + 1, y+i+1);
			stdout.write(' · · · · · ·');
		}
	}

	this.drawFoundationSpot = function(x, y) {
		this.setColour('tab');
		for (let i = 0; i < 10; i++) {
			stdout.cursorTo(x, y + i);
			stdout.write('░░░░░░░░░░░░░░');
		}
	}

	this.clearCard = function(x, y) {
		this.setColour('tab');
		this.drawSquare(x, y, cardWidth, cardHeight, true, 'none');
	}

	const pauseWidth = 20;
	const pauseHeight = 7;
	const pauseX = cardX + (cardWidth + margin) * 3 - 3;
	const pauseY = cardY - 3;
	this.drawPauseMenu = function(selectedIndex) {
		let width = 20;
		let height = 7;
		let x = Math.floor(this.columns / 2 - width / 2);
		let y = cardY - 3;
		this.setColor('white', 'black');
		this.drawSquare(pauseX, pauseY, pauseWidth, pauseHeight, true);
		for (let i = 0; i < pauseOptions.length; i++) {
			stdout.cursorTo(this.centerString(pauseOptions[i]), y + 1 + i * 2);
			if (i == selectedIndex)
				this.setColor('black', 'white');
			else
				this.setColor('white', 'black');
			stdout.write(pauseOptions[i]);
		}
	}
	this.clearPauseMenu = function(pile) {
		this.setColour('tab');
		this.drawSquare(pauseX, pauseY, pauseWidth, pauseHeight, true, 'none');
		let x = findPileX(3);
		for (let i = 0; i < pile.length; i++) {
			if (pile[i].faceUp) this.drawCard(pile[i], x, cardY + 2 * i);
			else this.drawCardBack(x, cardY + 2 * i);
		}
	}

	/*
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

	*/
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
				this.setColour('tab');
				stdout.cursorTo(x, y + i);
				stdout.write('              ');
				i++;
			}
			if (pile.length > 0)
				this.drawCard(pile[pile.length-1], x, y - 2);
		}
		if (diff > 0) { // The pile that gains cards
			let y = cardY + 2 * (pile.length - Math.abs(diff));
			for (let i = 0; i < Math.abs(diff); i++) {
				let card = pile[pile.length - diff + i];
				if (card.faceUp) this.drawCard(card, x, y + 2 * i);
			}
		}
	}

	this.drawController = function(controller) {
		let buffer = controller.buffer;
		//let label = (controller.settings.code[1] == 0);

		this.setColour('tab');
		let wasteX = cardX + cardWidth + margin + 4 * (this.wasteLength - 1)
		//if (label) this.draw('   TOP PILE   ', wasteX, topY - 2);
		for (let i = 0; i < 7; i++) {
			stdout.cursorTo(cardX + i * (cardWidth + margin), cardY - 2);
			//if (label) stdout.write(pileName(i)); // Enable to write the piles that the cursor isn't on
			stdout.write('              ');
		}
		stdout.cursorTo(cardX + cardWidth + margin, topY - 2);
		for (let i = 0; i < 22; i++) stdout.write(' ');

		if (buffer.length == 1) {
			this.setColour('cur');
			if (buffer[0].type == 'pile') {
				let index = buffer[0].index;
				stdout.cursorTo(cardX + index * (cardWidth + margin), cardY - 2);
				stdout.write(pileName(index));
			}
			if (buffer[0].type == 'waste') {
				stdout.cursorTo(cardX + cardWidth + margin, topY - 2);
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
					this.setColour('tom');
					stdout.cursorTo(firstX, cardY - 2);
					stdout.write(pileName(firstIndex));
				}
				if (buffer[0].type == 'waste') {
					this.setColour('tom');
					stdout.cursorTo(wasteX, topY - 2);
					stdout.write('   TOP PILE   ');
				}
				if (secondIndex != firstIndex || buffer[0].type == 'waste') {
					stdout.cursorTo(secondX, cardY - 2);
					this.setColour('cur');
					stdout.write(pileName(secondIndex));
				}
			}
		}
		function pileName(index) {
			return '    PILE ' + (index + 1) + '    ';
		}

		stdout.cursorTo(cardX + cardWidth + margin, topY - 2)
	}

	this.exit = function() {
		stdout.write('\x1b[?25h' + colors.reset);
		stdout.cursorTo(0,0);
		//this.clear();
	}

////DEBUG//////////////////////////////////////////////////////////////////////////

	this.debug = function(game) {
		for (let i = 0; i < 25; i++) {
			for (let j = 0; j < this.columns; j++) {
				stdout.cursorTo(j, i);
				stdout.write(' ');
			}
		}
		stdout.cursorTo(0,0); stdout.write('STOCK');
		for (let i = 0; i < game.stock.length; i++) {
			this.drawCardText(game.stock[i], 0, 1 + i);
		}
		stdout.cursorTo(10,0); stdout.write('WASTE');
		for (let i = 0; i < game.waste.length; i++) {
			this.drawCardText(game.waste[i], 10, 1 + i);
		}
		stdout.cursorTo(20,0); stdout.write('PILES');
		for (let p = 0; p < game.piles.length; p++) {
			for (let c = 0; c < game.piles[p].length; c++) {
				this.drawCardText(game.piles[p][c], 20 + p * 5, 1 + c);
			}
		}
		stdout.cursorTo(58, 0); stdout.write('FOUNDATIONS');
		for (let f = 0; f < game.foundations.length; f++) {
			for (let c = 0; c < game.foundations[f].length; c++) {
				this.drawCardText(game.foundations[f][c], 58 + f * 5, 1 + c);
			}
		}
		this.drawCardText = function(card, x, y) {
			if (card.suit == 'h' || card.suit == 'd') this.setFg('red');
			else this.setFg('white');
			stdout.cursorTo(x,y);
			stdout.write(card.value.toString() + card.suit);
			this.setFg('white');
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
			for (let j = 0; j < this.columns; j++) {
				stdout.cursorTo(j, i);
				stdout.write(' ');
			}
		}
		stdout.cursorTo(1,1); console.log('BUFFER:');
		stdout.cursorTo(1,2); console.log(controller.buffer);
		stdout.cursorTo(1,6); console.log('ACTION:');
		stdout.cursorTo(1,7); console.log(controller.action);
		stdout.cursorTo(10, 1); console.log('(TO MODE: ' + controller.toMode + ')');
		stdout.cursorTo(30, 1); console.log('lastIndex: ' + controller.lastIndex);
		stdout.cursorTo(60, 1); console.log('pileData:');
		if (controller.pileData != undefined)
		for (let i = 0; i < controller.pileData.length; i++) {
			stdout.cursorTo(60 + (i * 2), 2);
			console.log(controller.pileData[i]);
		}
		stdout.cursorTo(80, 1); console.log('pause:' + controller.pause);
		stdout.cursorTo(1, 12); console.log('HISTORY LENGTH: ' + history.length);
		if (history.length > 0) {
			stdout.cursorTo(1,14); console.log('NEXT REVERSE COMMAND:');
			stdout.cursorTo(3, 15);
			let command = history[history.length-1];
			console.log(command);
		}
	}
}

module.exports = Display;
