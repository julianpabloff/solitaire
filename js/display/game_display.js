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
		cardY = Math.floor((d.rows - cardHeight) / 2);
		// cardY = 40;
		topY = cardY - cardHeight - margin;
		foundationX = [];
		for (let i = 0; i < 4; i++) {
			foundationX.push(findPileX(3 + i));
		}
		this.pause.setSize(cardY);
	}

	let cardX, cardY, topY;
	let foundationX;
	this.setSize();

	this.drawAll = function(piles) {
		d.drawCardBack(cardX, topY);
		for (let i = 0; i < 4; i++)
			d.drawFoundationSpot(foundationX[i], topY);

		for (let p = 0; p < piles.length; p++) {
			this.fullPile(piles[p], p);
			/*
			let x = findPileX(p);
			let pileLength = piles[p].length;
			for (let c = 0; c < pileLength; c++) {
				let y = cardY + 2 * c;
				let card = piles[p][c];
				if (c < pileLength - 1) d.drawCardTop(card, x, y);
				else d.drawCard(card, x, y)
				//if (card.faceUp == false) d.drawCardBackTop(x, y);
				//else d.drawCard(card, x, y);
			}
			*/
		}
	}

	this.stock = function(stock) {
		if (stock.length == 0) d.drawFoundationSpot(cardX, topY);
		else d.drawCardBack(cardX, topY);
	}

	let wasteLength = 0; // Might be a problem when starting program and playing from a save
	let prevWasteVisible = 0;
	let wasteLengthChanged = false;
	this.wasteVisible = 0;
	this.waste = function(waste) {
		let cardSet = [];
		let wasteX = findPileX(1);
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

	this.highlightPile = function(pile, pileIndex, index, faceUpCount) {
		let x = findPileX(pileIndex);
		let y = cardY + (index * 2) + 2;
		if (index > 0) {
			d.drawCardMid(x, y - 2);
		}
		let faceCount = pile.length - index;
		d.setColour('cur');
		d.draw(faceCount.toString(), 0, 0);
		d.draw(index.toString(), 0, 1);
		if (faceCount > 1) {
			for (let i = 0; i < faceCount - 1; i++) {
				d.drawCardTop(pile[index + i], x, y + i * 2);
			}
		}
		d.drawCard(pile[pile.length - 1], x, y + (faceCount - 1) * 2);
		//this.drawCardTop(pile[index], x, y);
	}

	this.fullPile = function(pile, index) {
		let x = findPileX(index);
		let pileLength = pile.length;
		for (let c = 0; c < pileLength; c++) {
			let y = cardY + 2 * c;
			let card = pile[c];
			//if (card.faceUp) d.drawCard(card, x, cardY + 2 * c);
			//else d.drawCardBack(x, cardY + 2 * c);
			if (c < pileLength - 1) d.drawCardTop(card, x, y);
			else d.drawCard(card, x, y)
		}
	}

	this.clear = function(piles, buffer) {
		this.pause.erase(); // clears pause menu
		d.clearCard(cardX, topY); // clears the stock
		let wasteClearWidth = cardWidth + 4 * (this.wasteVisible - 1);
		d.drawSquare(findPileX(1), topY, wasteClearWidth, cardHeight, true, 'none'); // clears waste cards
		for (let f = 0; f < 4; f++) // clears foundations
			d.clearCard(foundationX[f], topY);
		for (let p = 0; p < piles.length; p++) { //clears piles
			let length = piles[p].length;
			if (length == 0) continue;
			let height = cardHeight + 2 * (length - 1);
			d.drawSquare(findPileX(p), cardY, cardWidth, height, true, 'none');
		};
		this.drawController(buffer[0], 'tab');
		this.wasteVisible = 0;
	}

	this.wasteAmount = 0;
	this.drawController = function(buffer, attribute) { // only pass in a single buffer, not array
		let cursor = ' '.repeat(cardWidth);
		//let cursor = wasteLength + ' '.repeat(cardWidth - 1); // for debugging wasteLength
		d.setColour(attribute);

		if (buffer.type == 'pile') {
			d.draw(cursor, findPileX(buffer.index), cardY - 2);
		}
		else if (buffer.type == 'waste') {
			let wasteX;
			let wasteAmount = (attribute == 'tab') ? prevWasteVisible : this.wasteVisible;
			//let wasteAmount = this.wasteVisible;
			wasteX = findPileX(1) + 4 * ((wasteAmount - 1)); //* (wasteAmount > 0));
			//else wasteX = findPileX(1) + 4 * (wasteLength);
			d.draw(cursor, wasteX, topY - 2);
			/*
			if (attribute != 'tab' && prevWasteVisible != this.wasteVisible) {
				d.setColour('tab');
				let x = wasteX + cardWidth - ((cardWidth + 4) * (this.wasteVisible - prevWasteVisible > 0));
				d.draw(' '.repeat(4), x, topY - 2);
			}
			if (wasteLengthChanged) {
				d.setColour('tab');
				d.draw(' '.repeat(4), wasteX - 4, topY - 2);
				d.draw(' '.repeat(4), wasteX + cardWidth, topY - 2);
			}*/
			prevWasteVisible = this.wasteVisible;
		}
	}

	this.controller = function(buffer, prevBuffer) {
		if (buffer.length == 1) {
			if (prevBuffer.length == 2) // coming out of toMode
				this.drawController(prevBuffer[1], 'tab');
			this.drawController(prevBuffer[0], 'tab');
			this.drawController(buffer[0], 'cur');
		}
		else if (buffer.length == 2) {
			let firstIndex = buffer[0].index;
			let secondIndex = buffer[1].index;
			let prevFirstIndex = prevBuffer[0].index;
			let prevSecondIndex;
			let firstX = findPileX(firstIndex);
			let secondX = findPileX(secondIndex);

			if (prevBuffer.length == 1) { // Just getting into toMode
				this.drawController(buffer[0], 'tom');
				if (prevFirstIndex != firstIndex)
					this.drawController(prevBuffer[0], 'tab');
				if (buffer[0].type == 'waste' || firstIndex != secondIndex) {
					this.drawController(buffer[1], 'cur');
				}
			} else { // currently in toMode
				prevSecondIndex = prevBuffer[1].index;
				// if you're cursor is on the toMode spot and your leaving
				if (buffer[0].type != 'waste' && prevSecondIndex == firstIndex && prevSecondIndex != secondIndex) {
					this.drawController(buffer[1], 'cur');
				// if you're cursor is going onto the toMode spot
				} else if (buffer[0].type != 'waste' && secondIndex == prevFirstIndex) {
					this.drawController(prevBuffer[1], 'tab');
					this.drawController(buffer[1], 'tom');
				} else {
					this.drawController(prevBuffer[1], 'tab');
					this.drawController(buffer[1], 'cur');
				}


			}
		}
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
	this.erase = function() {
		d.setColour('tab');
		d.drawSquare(x, y, width, height, true, 'none');
	}
	this.clear = function(pile) {
		this.erase();
		d.game.fullPile(pile, 3);
	}
}

module.exports = GameDisplay;
