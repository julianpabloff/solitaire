const Game = function() {
	let cards = [];
	let suits = ['h','c','d','s'];
	let values = [1,2,3,4,5,6,7,8,9,10,11,12,13];
	this.piles = [];
	this.stock = [];
	this.waste = [];
	this.foundations = [[],[],[],[]];

	this.buildDeck = function() {
		for (let suit of suits) {
			for (let value of values) {
				cards.push(new Card(suit, value));
			}
		}
		return this;
	}

	this.shuffle = function() {
		for (let i in cards) {
			randomIndex = Math.floor(Math.random() * cards.length);
			let temp = cards[i];
			cards[i] = cards[randomIndex];
			cards[randomIndex] = temp;
		}
		return this;
	}
	
	this.dealCards = function() {
		let cardsIndex = 0;
		for (let i = 0; i < 7; i++) { // 7 piles
			this.piles.push([]);
			for (let j = 0; j < i + 1; j++) { // with increasing amounts
				if (j > i - 1) cards[cardsIndex].faceUp = true;
				this.piles[i].push(cards[cardsIndex]);
				cardsIndex++;
			}
		}
		for (let i = cardsIndex; i < cards.length; i++) {
			this.stock.push(cards[i]);
		}
		return this;
	}

	let deckStartOver = false;
	this.flipDeck = function() {
		this.waste.push([]);
		let i = 0;
		while (this.stock.length > 0 && i < 3) {
			let card = this.stock.pop();
			card.flip();
			this.waste[this.waste.length-1].push(card);
			i++;
		}
		if (this.stock.length == 0) {
			if (deckStartOver) {
				let whole = this.waste.length;
				for (let i = whole-1; i >= 0; i--) {
					let section = this.waste[i].length;
					for (let j = 0; j < section; j++) {
						this.stock.push(this.waste[i].pop());
					}
				}
				this.waste = [];
			}
			deckStartOver = true;
		} else deckStartOver = false;
	}

	const validPair = function(card, target) {
		if (target == undefined)
			if (card.value == 13) return true;
			else return false;
		let cardSuitIndex = suits.indexOf(card.suit);
		let targetSuitIndex = suits.indexOf(target.suit);
		if (cardSuitIndex % 2 != targetSuitIndex % 2)
			if (card.value + 1 == target.value) return true;
		return false;
	}

	this.pileData = function() {
		let output = [];
		for (let pile of this.piles) {
			let count = 0;
			for (let card of pile) {
				if (card.faceUp) count++;
			}
			output.push(count);
		}
		return output;
	}

	this.moveCards = function(command) {
		let first = command[0]; let second = command[1];
		if (first.type == 'pile') {
			if (second.type == 'pile') {
				this.pileToPile(first, second);
			}
		}
	}

	this.pileToPile = function(first, second) {
		let firstPile = this.piles[first.index];
		let secondPile = this.piles[second.index];

		let c, depth;
		for (c = 0; c < firstPile.length; c++) {
			if (firstPile[c].faceUp) break;
		}

		depth = c + first.depth;
		let count = firstPile.length - depth;

		let firstCard = firstPile[depth];
		let secondCard = secondPile[secondPile.length - 1];

		if (validPair(firstCard, secondCard)) {
			this.piles[second.index] = secondPile.concat(firstPile.splice(depth, count));
			let firstPileLength = this.piles[first.index].length;
			if (firstPileLength > 0)
				this.piles[first.index][firstPileLength - 1].faceUp = true;
		}
	}

	this.pileToPileOld = function(first, second) {
		let pile = first.index;
		let target = second.index;
		let depth = first.depth;
		let targetCard = this.piles[target][this.piles[target].length - 1];
		let checking = true;
		let faceUpCount = 0;

		for (let card of this.piles[pile]) {
			if (card.faceUp == true) {
				if (checking) {
					checking = false;
					if (!validPair(card, targetCard)) return;
				}
				this.piles[target].push(card);
				faceUpCount++;
			}
		}
		for (let i = 0; i < faceUpCount; i++)
			this.piles[pile].pop();
		if (this.piles[pile].length > 0)
			this.piles[pile][this.piles[pile].length-1].faceUp = true;
	}

	this.submitCard = function(command) {
		let bleh = 'hehe';
	}
}

const Card = function(suit, value) {
	this.suit = suit;
	this.value = value;
	this.faceUp = false;
	this.selected = false;

	this.flip = function() {
		if (this.faceUp == false) this.faceUp = true;
		else this.faceUp = false;
	}
}

module.exports = Game;
