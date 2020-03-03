const Display = function() {

	this.settings = new (require('./display_settings.js'));

	let stdout = process.stdout;

	this.clear = () => stdout.write('\x1b[2J');
	this.init = function() {
		this.clear();
		stdout.cursorTo(0,0);
		drawBackground('green');
		stdout.write('\x1b[?25l');
	}

	this.setSize = function() {
		rows = stdout.rows;
		columns = stdout.columns;

		cardX = Math.floor((columns - (cardWidth + margin) * 7 + margin) / 2);
		cardY = Math.floor((rows - cardHeight) / 2);
		//cardY = 40;
		topY = cardY - cardHeight - margin;
		settingsX = Math.floor(columns / 2 - 36);

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
	let settingsX;
	this.setSize();

	const findPileX = function(index) {
		return cardX + (cardWidth + margin) * index;
	}

	const colors = {
		fg : { black:'\x1b[30m', red:'\x1b[31m', green:'\x1b[32m', blue:'\x1b[34m', cyan:'\x1b[36m', white:'\x1b[37m', reset:'\x1b[0m' },
		bg : { black:'\x1b[40m', red:'\x1b[41m', green:'\x1b[42m', blue:'\x1b[44m', cyan:'\x1b[46m', white:'\x1b[47m', reset:'\x1b[0m' },
		reset : '\x1b[0m'
	};
	const fullColor = function(fg, bg) {
		return colors.fg[fg] + colors.bg[bg];
	}

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
	const setColor = function(fg, bg) {
		setFg(fg); setBg(bg);
	}
	const drawBackground = function(color) {
		stdout.write(colors.bg[color]);
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < columns; c++) {
				stdout.write(' ');
			}
		}
		stdout.write(colors.fg.black);
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
	const logo = [
		'                                                                                                 ',
		'  █████████  █████████  ██        ████████  ████████  █████████  ████████  █████████  █████████  ',
		'  ██         ██     ██  ██           ██        ██     ██     ██     ██     ██     ██  ██         ',
		'  █████████  ██     ██  ██           ██        ██     █████████     ██     █████████  ████████   ',
		'         ██  ██     ██  ██           ██        ██     ██     ██     ██     ██    ██   ██         ',
		'  █████████  █████████  ████████  ████████     ██     ██     ██  ████████  ██     ██  █████████  ',
		'                                                                                                 ',
	];
	const logoTwo = [
		'                                                                                                 ',
		'0011111111100111111111001100000000111111110011111111001111111110011111111001111111110011111111100',
		'0011000000000110000011001100000000000110000000011000001100000110000011000001100000110011000000000',
		'0011111111100110000011001100000000000110000000011000001111111110000011000001111111110011111111000',
		'0000000001100110000011001100000000000110000000011000001100000110000011000001100001100011000000000',
		'0011111111100111111111001111111100111111110000011000001100000110011111111001100000110011111111100',
		'                                                                                                 ',
	];
	const pauseOptions = ['   RESUME   ', '  SETTINGS  ', ' SAVE && QUIT '];

	const centerString = function(string) { return Math.floor(columns/2) - Math.floor(string.length/2) }

	this.drawSquare = function(x, y, width, height, fill) {
		stdout.cursorTo(x, y);
		stdout.write('┌');
		for (let i = 0; i < width - 2; i++) {
			stdout.write('─');
		}
		stdout.write('┐');
		for (let i = 0; i < height - 2; i++) {
			stdout.cursorTo(x, y + 1 + i);
			stdout.write('│');
			if (fill) for (let j = 0; j < width - 2; j++)
				stdout.write(' ');
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
		const options = ['  NEW GAME  ', '  CONTINUE  ', '  SETTINGS  ', '    QUIT    '];

		setFg('white'); setBg('black');
		this.drawSquare(x-1, y-1, logo[0].length + 2, logo.length + 2, false);
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
		this.drawSquare(boxX, optionsY - 1, boxWidth, options.length + 5, false);
		for (let i = 0; i < options.length; i++) {
			stdout.cursorTo(centerString(options[i]), optionsY + 2 * i);
			if (i == selectedIndex)
				setColor('black', 'white');
			else
				setColor('white', 'black');
			stdout.write(options[i]);
		}
	}

	this.animateCards = function() {
		setInterval(() => {
			let x = Math.floor(Math.random() * columns);
			let y = Math.floor(Math.random() * rows);
			let suit = suits[Math.floor(Math.random() * suits.length)];
			let value = Math.floor(Math.random() * 13) + 1;
			let card = {suit: suit, value: value};
			this.drawCard(card, x, y);
		}, 1000);
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

		setFg('white');
		if (suit == 'h' || suit == 'd') setBg('red');
		else setBg('black');
		this.drawCardBox(x, y);
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

	this.drawCardBack = function(x, y) {
		setColor('black', 'white');
		this.drawCardBox(x, y);
		for (let i = 1; i < 9; i += 2) {
			stdout.cursorTo(x + 1, y+i);
			stdout.write('· · · · · · ');
			stdout.cursorTo(x + 1, y+i+1);
			stdout.write(' · · · · · ·');
		}
	}

	this.drawFoundationSpot = function(x, y) {
		setColor('black', 'green');
		for (let i = 0; i < 10; i++) {
			stdout.cursorTo(x, y + i);
			stdout.write('░░░░░░░░░░░░░░');
		}
		//stdout.write(colors.reset);
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
		for (let i = topY - 2; i < rows; i++) {
			stdout.cursorTo(0, i);
			for (let j = 0; j < columns; j++) {
				stdout.write(' ');
			}
		}
	}

	const pauseWidth = 20;
	const pauseHeight = 7;
	const pauseX = cardX + (cardWidth + margin) * 3 - 3;
	const pauseY = cardY - 3;
	this.drawPauseMenu = function(selectedIndex) {
		let width = 20;
		let height = 7;
		let x = Math.floor(columns / 2 - width / 2);
		let y = cardY - 3;
		setColor('white', 'black');
		this.drawSquare(pauseX, pauseY, pauseWidth, pauseHeight, true);
		for (let i = 0; i < pauseOptions.length; i++) {
			stdout.cursorTo(centerString(pauseOptions[i]), y + 1 + i * 2);
			if (i == selectedIndex)
				setColor('black', 'white');
			else
				setColor('white', 'black');
			stdout.write(pauseOptions[i]);
		}
	}
	this.clearPauseMenu = function(pile) {
		setColor('green', 'green');
		this.drawSquare(pauseX, pauseY, pauseWidth, pauseHeight, true);
		let x = findPileX(3);
		for (let i = 0; i < pile.length; i++) {
			if (pile[i].faceUp) this.drawCard(pile[i], x, cardY + 2 * i);
			else this.drawCardBack(x, cardY + 2 * i);
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
			for (let i = 0; i < Math.abs(diff); i++) {
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
			stdout.write(pileName(i)); // Enable to write the piles that the cursor isn't on
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
		stdout.cursorTo(80, 1); console.log('pause:' + controller.pause);
		stdout.cursorTo(1, 10); console.log('HISTORY LENGTH: ' + history.length);
		if (history.length > 0) {
			stdout.cursorTo(1,12); console.log('NEXT REVERSE COMMAND:');
			stdout.cursorTo(3, 13);
			let command = history[history.length-1];
			console.log(command);
		}
	}

////SETTINGS//////////////////////////////////////////////////////////////////////////////////

	const settingsLogo = [
		'▄▄▄▄ ▄▄▄▄ ▄▄▄▄▄ ▄▄▄▄▄ ▄▄▄▄▄ ▄▄▄▄ ▄▄▄▄ ▄▄▄▄',
		'█▄▄▄ █▄▄▄   █     █     █   █  █ █ ▄▄ █▄▄▄',
		'▄▄▄█ █▄▄▄   █     █   ▄▄█▄▄ █  █ █▄▄█ ▄▄▄█'
	];

	this.drawSettings = function() {
		drawBackground('black');
		setFg('white');
		for (let i = 0; i < settingsLogo.length; i++) {
			stdout.cursorTo(settingsX, topY + i);
			stdout.write(settingsLogo[i]);
		}
		stdout.cursorTo(settingsX, topY + 29);
		stdout.write('press esc when done');
	}
	this.updateSettings = function(buffer, code) {
		let items = ['THEME', 'LABELS', 'DIFFICULTY'];
		let options = [
			['NORMAL', 'LIGHT', 'DARK', 'ICE'],
			['ENABLED', 'DISABLED'],
			['DRAW 1', 'DRAW 3']
		];

		setColor('white', 'black');
		this.drawSquare(settingsX - 1, topY + 4, 23, 5, false);
		for (let i = 0; i < items.length; i++) {
			stdout.cursorTo(settingsX, topY + 5 + i);
			if (i == buffer[0]) setColor('black', 'white');
			else setColor('white', 'black');
			let output = options[i][code[i]];
			stdout.write(' ' + items[i] + ' - ' + output);
			let spaceAmount = 20 - (items[i].length + 3 + output.length);
			for (let j = 0; j < spaceAmount; j++)
				stdout.write(' ');
		}
		if (buffer.length == 1) {
			setColor('black', 'black');
			this.drawSquare(settingsX + 23, topY + 4, 16, 6, true);
		}
		if (buffer.length == 2) {
			setColor('white', 'black');
			this.drawSquare(settingsX + 23, topY + 4, 16, 2 + options[buffer[0]].length, false);
			for (let i = 0; i < options[buffer[0]].length; i++) {
				stdout.cursorTo(settingsX + 24, topY + 5 + i);
				if (i == buffer[1]) setColor('black', 'white');
				else setColor('white', 'black');
				let output = options[buffer[0]][i];
				stdout.write(' ' + output);
				let spaceAmount = 13 - output.length;
				for (let j = 0; j < spaceAmount; j++)
					stdout.write(' ');
			}
		}

		//DEBUG
		/*
		setColor('white', 'black');
		stdout.cursorTo(settingsX, topY + 30);
		stdout.write('buffer:          ');
		stdout.cursorTo(settingsX + 8, topY + 30);
		console.log(buffer);
		stdout.cursorTo(settingsX, topY + 32);
		console.log(code);
		*/
	}

	const themes = [
		{ // NORMAL
			one: fullColor('white', 'red'),
			two: fullColor('white', 'black'),
			bac: fullColor('black', 'white'),
			tab: fullColor('black', 'green'),
			cur: fullColor('black', 'white'),
			tom: fullColor('white', 'black')
		},
		{ // LIGHT
			one: fullColor('red', 'white'),
			two: fullColor('black', 'white'),
			bac: colors.fg.black + colors.bg.white,
			tab: colors.fg.black + colors.bg.white,
			cur: colors.fg.white + colors.bg.black,
			tom: fullColor('white', 'red')
		},
		{ // DARK
			one: colors.fg.red + colors.bg.black,
			two: colors.fg.white + colors.bg.black,
			bac: colors.fg.white + colors.bg.black,
			tab: colors.fg.white + colors.bg.black,
			cur: colors.fg.black + colors.bg.white,
			tom: fullColor('white', 'red')
		},
		{ // ICE
			one: colors.fg.black + colors.bg.cyan,
			two: colors.fg.white + colors.bg.blue,
			bac: colors.fg.black + colors.bg.white,
			tab: colors.fg.white + colors.bg.black,
			cur: colors.fg.black + colors.bg.white,
			tom: fullColor('black', 'cyan')
		},
	];

	this.drawPreview = function(code) {
		let one = themes[code[0]].one; // Card color one
		let two = themes[code[0]].two; // Card color two
		let bac = themes[code[0]].bac; // Back of card color
		let tab = themes[code[0]].tab; // Table color
		let cur = themes[code[0]].cur; // Cursor color
		let tom = themes[code[0]].tom; // To Mode color
		
		let preview = [
			one + ' ' + two + '│            │' + tab + '              ░░░░░░░░░░░░░░    ░░░░░░░░░░░░░░    ' + one + '│      ',
			one + ' ' + two + '│          J │' + tab + '              ░░░░░░░░░░░░░░    ░░░░░░░░░░░░░░    ' + one + '│      ',
			one + '─' + two + '└────────────┘' + tab + '              ░░░░░░░░░░░░░░    ░░░░░░░░░░░░░░    ' + one + '└──────',
			tab + '                                                                        ',
			tab + '                                                                        ',
			tab + 'E 2        ' + cur + '    PILE 3    ' + tab + '        PILE 4        ' + tom + '    PILE 5    ' + tab + '        PIL',
			tab + '                                                                        ',
			two + '──────┐' + tab + '    ' + bac + '┌────────────┐' + tab + '    ' + one + '┌────────────┐' + tab + '    ' + bac + '┌────────────┐' + tab + '    ' + bac + '┌──────',
			two + '      │' + tab + '    ' + bac + '│. . . . . . │' + tab + '    ' + one + '│ K          │' + tab + '    ' + bac + '│. . . . . . │' + tab + '    ' + bac + '│. . . ',
			one + '──────┐' + tab + '    ' + bac + '┌────────────┐' + tab + '    ' + two + '┌────────────┐' + tab + '    ' + bac + '┌────────────┐' + tab + '    ' + bac + '┌──────',
			one + '      │' + tab + '    ' + bac + '│. . . . . . │' + tab + '    ' + two + '│ Q          │' + tab + '    ' + bac + '│. . . . . . │' + tab + '    ' + bac + '│. . . ',
			one + ' _    │' + tab + '    ' + two + '┌────────────┐' + tab + '    ' + one + '┌────────────┐' + tab + '    ' + bac + '┌────────────┐' + tab + '    ' + bac + '┌──────',
			one + '/ \\   │' + tab + '    ' + two + '│ J          │' + tab + '    ' + one + '│ J          │' + tab + '    ' + bac + '│. . . . . . │' + tab + '    ' + bac + '│. . . ',
			one + '  /   │' + tab + '    ' + one + '┌────────────┐' + tab + '    ' + two + '┌────────────┐' + tab + '    ' + one + '┌────────────┐' + tab + '    ' + bac + '┌──────',
			one + ' /    │' + tab + '    ' + one + '│ 10         │' + tab + '    ' + two + '│ 10         │' + tab + '    ' + one + '│ 8          │' + tab + '    ' + bac + '│. . . ',
			one + '/     │' + tab + '    ' + two + '┌────────────┐' + tab + '    ' + two + '│     /\\     │' + tab + '    ' + two + '┌────────────┐' + tab + '    ' + two + '┌──────',
			one + '      │' + tab + '    ' + two + '│ 9          │' + tab + '    ' + two + '│    /  \\    │' + tab + '    ' + two + '│ 7          │' + tab + '    ' + two + '│ 6    '
		];
		let noLabel = tab + '           ' + cur + '              ' + tab + '                      ' + tom + '              ' + tab + '           ';

		for (let i = 0; i < preview.length; i++) {
			stdout.cursorTo(settingsX, topY + 11 + i);
			if (i == 5 && code[1] == 1) {
				stdout.write(noLabel);
			} else stdout.write(preview[i]);
		}
		setColor('white', 'black');
		this.drawSquare(settingsX - 1, topY + 10, 74, preview.length + 2, false);
	}
}

module.exports = Display;
