const GameDisplay = function(d) {

	let stdout = process.stdout;
	this.pause = new Pause(d);

	const cardWidth = 14;
	const cardHeight = 10;
	const margin = 4;

	const findPileX = (index) => { return cardX + (cardWidth + margin) * index; }

	this.setSize = function() {
		cardX = Math.floor((d.columns - (cardWidth + margin) * 7 + margin) / 2);
		cardY = Math.floor((d.rows - cardHeight) / 2);
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

	let wasteLength = 0; // Might be a problem when starting program and playing from a save
	this.drawWaste = function(waste) {
		let cardSet = [];
		if (waste.length != 0) {
			let clearWidth = 4 * wasteLength - 1;
			d.drawSquare(wasteX, topY, 8, cardHeight, true, 'none');
			let i = 0;
			while (i < 3 && i < waste.length) {
				cardSet.unshift(waste[waste.length - 1 - i]);
				i++;
			}
			wasteLength = i;
		}
		for (let c = 0; c < cardSet.length; c++)
			d.drawCard(cardSet[c], wasteX + c * 4, topY);
	}

	this.clear = function(piles) {
		d.clearCard(cardX, topY);
		d.drawSquare(wasteX, topY, 22, cardHeight, true, 'none');
		for (let f = 0; f < 4; f++)
			d.clearCard(foundationX[f], topY);
		for (let p = 0; p < piles.length; p++) {
			let length = piles[p].length;
			if (length == 0) continue;
			let height = cardHeight + 2 * (length - 1);
			d.drawSquare(findPileX(p), cardY, cardWidth, height, true, 'none');
		}
	}
}

const Pause = function(d) {
	let x, y;
	let width = 18;
	let height = 7;
	const options = ['RESUME', 'SETTINGS', 'SAVE && QUIT'];

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
}

module.exports = GameDisplay;
