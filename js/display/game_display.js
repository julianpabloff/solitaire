const GameDisplay = function(d) {

	let stdout = process.stdout;
	this.pause = new Pause(d);

	const cardWidth = 14;
	const cardHeight = 10;
	const margin = 4;
	const totalWidth = 122;

	const findPileX = (index) => { return cardX + (cardWidth + margin) * index; }

	this.setSize = function() {
		cardX = Math.floor((d.columns - (cardWidth + margin) * 7 + margin) / 2);
		//cardY = Math.floor((d.rows - cardHeight) / 2);
		cardY = 40;
		topY = cardY - cardHeight - margin;
		wasteX = findPileX(1);
		foundationX = [];
		for (let i = 0; i < 4; i++) {
			foundationX.push(findPileX(3 + i));
		}
		this.pause.setSize(cardY);
	}

	let cardX, cardY, topY;
	let wasteX, foundationX;
	this.setSize();

	this.drawAll = function(piles) {
		d.drawCardBack(cardX, topY);
		for (let i = 0; i < 4; i++)
			d.drawFoundationSpot(foundationX[i], topY);

		for (let p = 0; p < piles.length; p++) {
			let x = findPileX(p);
			for (let c = 0; c < piles[p].length; c++) {
				let y = cardY + 2 * c;
				let card = piles[p][c];
				if (card.faceUp == false) d.drawCardBack(x, y);
				else d.drawCard(card, x, y);
			}
		}
	}

	this.stock = function(stock) {
		if (stock.length == 0) d.drawFoundationSpot(cardX, topY);
		else d.drawCardBack(cardX, topY);
	}

	let wasteLength = 0; // Might be a problem when starting program and playing from a save
	let wasteLengthChanged = false;
	this.waste = function(waste) {
		let cardSet = [];
		if (waste.length < wasteLength) {
			d.setColour('tab');
			let clearWidth = cardWidth + 8;
			d.drawSquare(wasteX, topY, clearWidth, cardHeight, true, 'none');
			if (waste.length == 0) wasteLength = 0;
		}
		let i = 0;
		while (i < 3 && i < waste.length) {
			cardSet.unshift(waste[waste.length - 1 - i]);
			i++;
		}
		if (wasteLength != i) {
			wasteLengthChanged = true;
		} else wasteLengthChanged = false;
		wasteLength = i;
		//d.wasteLength = i;
		for (let c = 0; c < cardSet.length; c++)
			if (c < cardSet.length - 1) d.drawCardSide(cardSet[c], wasteX + c * 4, topY);
			else d.drawCard(cardSet[c], wasteX + c * 4, topY);
	}

	this.foundations = function(f) {
		for (let i = 0; i < 4; i++) {
			if (f[i].length == 0)
				d.drawFoundationSpot(foundationX[i], topY);
			else
				d.drawCard(f[i][f[i].length - 1], foundationX[i], topY);
		}
	}

	this.pile = function(pile, index, diff) {
		let x = findPileX(index);
		if (diff < 0) {
			let y = cardY + 2 * pile.length;
			let i = 0;
			while (i < 10 + 2 * (Math.abs(diff) - 1)) {
				d.setColour('tab');
				d.draw(' '.repeat(14), x, y + i)
				i++;
			}
			if (pile.length > 0)
				d.drawCard(pile[pile.length - 1], x, y - 2);
		} else if (diff > 0) {
			let y = cardY + 2 * (pile.length - diff);
			for (let i = 0; i < diff; i++) {
				let card = pile[pile.length - diff + i];
				d.drawCard(card, x, y + 2 * i);
			}
		}
	}

	this.fullPile = function(pile, index) {
		let x = findPileX(index);
		for (let i = 0; i < pile.length; i++) {
			if (pile[i].faceUp) d.drawCard(pile[i], x, cardY + 2 * i);
			else d.drawCardBack(x, cardY + 2 * i);
		}
	}

	this.clear = function(piles) {
		this.pause.clear(piles[3]);
		d.clearCard(cardX, topY);
		d.drawSquare(wasteX, topY, 22, cardHeight, true, 'none');
		for (let f = 0; f < 4; f++)
			d.clearCard(foundationX[f], topY);
		d.draw(' '.repeat(totalWidth), cardX, cardY - 2);
		for (let p = 0; p < piles.length; p++) {
			let length = piles[p].length;
			if (length == 0) continue;
			let height = cardHeight + 2 * (length - 1);
			d.drawSquare(findPileX(p), cardY, cardWidth, height, true, 'none');
		};
	}

	this.controller = function(buffer, clear = false) {
		let cursor = ' '.repeat(cardWidth);
		d.setColour('cur');
		d.draw(cursor, findPileX(buffer.index), 0);
		/*
		if (clear) d.setColour('tab');
		else d.setColour('cur');

		if (buffer.type == 'pile')
			d.draw(cursor, findPileX(buffer.index), cardY - 2);
		else if (buffer.type == 'waste') {
			let wasteX = findPileX(1) + 4 * (wasteLength - 1);
			d.draw(cursor, wasteX, topY - 2);
			if (wasteLengthChanged && !clear) {
				d.setColour('tab');
				d.draw(' '.repeat(4), wasteX - 4, topY - 2);
				d.draw(' '.repeat(4), wasteX + cardWidth, topY - 2);
			}
		}
		*/
	}

	this.blehcontroller = function(buffer, prevBuffer) {
		//let label = controller.settings.code[1] == 0;

		//this.drawController(prevBuffer[prevBuffer.length - 1], true);
		this.drawController(buffer[buffer.length - 1]);
	}
}

const Pause = function(d) {
	let x, y;
	let width = 18;
	let height = 5;
	const options = ['RESUME', 'SAVE && QUIT'];

	this.setSize = function(cardY) {
		x = d.centerWidth(width);
		y = cardY - 3;
	}

	this.drawStatic = function() {
		d.setColour(d.menuScheme.text);
		d.drawSquare(x, y, width, height, true);
		this.drawDynamic(0);
	}
	this.drawDynamic = function(selectedIndex) {
		for (let i = 0; i < options.length; i++) {
			if (i == selectedIndex) d.setColour(d.menuScheme.cursor);
			else d.setColour(d.menuScheme.text);
			let spacing = (width - options[i].length - 2) / 2;
			let output = ' '.repeat(spacing) + options[i] + ' '.repeat(spacing);
			d.draw(output, x + 1, y + 1 + 2 * i);
		}
	}
	this.clear = function(pile) {
		d.setColour('tab');
		d.drawSquare(x, y, width, height, true, 'none');
		d.game.fullPile(pile, 3);
	}
}

module.exports = GameDisplay;
