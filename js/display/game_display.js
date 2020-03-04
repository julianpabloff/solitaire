const GameDisplay = function(d) {

	let stdout = process.stdout;

	const cardWidth = 14;
	const cardHeight = 10;
	const margin = 4;

	const findPileX = (index) => { return cardX + (cardWidth + margin) * index; }

	this.setSize = function() {
		cardX = Math.floor((d.columns - (cardWidth + margin) * 7 + margin) / 2);
		cardY = Math.floor((d.rows - cardHeight) / 2);
		topY = cardY - cardHeight - margin;
		foundationX = [];
		for (let i = 0; i < 4; i++) {
			foundationX.push(findPileX(3 + i));
		}
	}

	let cardX, cardY, topY;
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

	this.clear = function(piles) {
		d.clearCard(cardX, topY);
		d.drawSquare(findPileX(1), topY, 22, cardHeight, true, 'none');
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

module.exports = GameDisplay;
