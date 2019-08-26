const Game = function() {
	let cards = [];
	let suits = ['h','c','d','s'];
	let values = [1,2,3,4,5,6,7,8,9,10,11,12,13];
	this.piles = [];
	this.stock = [];
	this.drawAmount = 1;
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
				if (j < i) cards[cardsIndex].faceUp = false;
				this.piles[i].push(cards[cardsIndex]);
				cardsIndex++;
			}
		}
		for (let i = cardsIndex; i < cards.length; i++) {
			cards[i].faceUp = true;
			this.stock.push(cards[i]);
		}
		return this;
	}

	let deckStartOver = false;
	this.flipDeck = function() {
		let i = 0;
		while (this.stock.length > 0 && i < this.drawAmount) {
			deckStartOver = false;
			this.waste.push(this.stock.pop());
			i++;
		}
		if (this.stock.length == 0) {
			if (deckStartOver) {
				let wasteLength = this.waste.length;
				for (let i = 0; i < wasteLength; i++) {
					this.stock.push(this.waste.pop());
				}
			}
			deckStartOver = true;
		} else deckStartOver = false;
	}

	this.moveCards = function(command) {
		let first = command[0]; let second = command[1];
		let action = {type: null};
		if (first.type == 'pile')
			switch (second.type) {
				case 'pile' : action.type = 'pileToPile'; break;
				case 'submit' : action.type = 'pileToFoundation'; break;
			}
		if (first.type == 'waste')
			switch (second.type) {
				case 'pile' : action.type = 'wasteToPile'; break;
				case 'submit' : action.type = 'wasteToFoundation'; break;
			}
		if (action.type != null) {
			functionOutput = this[action.type](first, second);
			if (functionOutput.ran) {
				action.ran = true;
				action.initialLength = functionOutput.initialLength;
			}
		}
		else action.ran = false;
		return action;
	}

	this.validPair = function(card, target) {
		if (card == undefined) return false;
		if (target == undefined)
			if (card.value == 13) return true;
			else return false;
		if (card.value == 1) return false;
		let cardSuitIndex = suits.indexOf(card.suit);
		let targetSuitIndex = suits.indexOf(target.suit);
		if (cardSuitIndex % 2 != targetSuitIndex % 2)
			if (card.value + 1 == target.value) return true;
		return false;
	}

	this.pileToPile = function(first, second) {
		let firstPile = this.piles[first.index];
		let secondPile = this.piles[second.index];
		let firstInitalLength = firstPile.length;
		let secondeInitalLength = secondPile.length;

		let c, depth;
		for (c = 0; c < firstPile.length; c++) {
			if (firstPile[c].faceUp) break;
		}

		depth = c + first.depth;
		let count = firstPile.length - depth;

		let firstCard = firstPile[depth];
		let secondCard = secondPile[secondPile.length - 1];

		if (this.validPair(firstCard, secondCard)) {
			this.piles[second.index] = this.piles[second.index].concat(firstPile.splice(depth, count));
			let firstPileLength = this.piles[first.index].length;
			if (firstPileLength > 0)
				this.piles[first.index][firstPileLength - 1].faceUp = true;;
			return {
				initialLength: [firstInitalLength, secondeInitalLength],
				ran: true,
			};
		} else return {ran: false};
	}

	this.wasteToPile = function(first, second) {
		let pile = this.piles[second.index];
		let initialLength = pile.length;

		let card = this.waste[this.waste.length - 1];
		let target = pile[pile.length - 1];
		if (this.validPair(card, target)) {
			this.piles[second.index].push(this.waste.pop());
			return {
				initialLength: initialLength,
				ran: true,
			};
		} else return {ran: false};
	}

	this.validSubmit = function(card) {
		let cardSuitIndex = suits.indexOf(card.suit);
		let foundation = this.foundations[cardSuitIndex];
		if (foundation.length == 0)
			if (card.value == 1) return true;
			else return false;
		let target = foundation[foundation.length-1];
		if (card.value == target.value + 1) return true;
		else return false;
	}

	this.pileToFoundation = function(first, second) {
		let pile = this.piles[first.index];
		let initialLength = pile.length;
		let card = pile[pile.length - 1];
		if (card == undefined) return {ran: false};
		let cardSuitIndex = suits.indexOf(card.suit);
		if (this.validSubmit(card)) {
			this.foundations[cardSuitIndex].push(this.piles[first.index].pop());
			let pileLength = this.piles[first.index].length;
			if (pileLength > 0)
				this.piles[first.index][pileLength - 1].faceUp = true;
			return {
				initialLength: initialLength,
				ran: true,
			};
		} else {
			return {ran: false};
		}
	}

	this.wasteToFoundation = function(first, second) {
		let card = this.waste[this.waste.length - 1];
		if (card == undefined) return {ran: false};
		let cardSuitIndex = suits.indexOf(card.suit);
		if (this.validSubmit(card)) {
			this.foundations[cardSuitIndex].push(this.waste.pop());
			return { ran: true };
		} else return {ran: false};
	}

	this.getPileData = function() {
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

	this.getGameData = function() {
		let output = {};
		output.stock = this.stock;
		output.waste = this.waste;
		output.piles = this.piles;
		output.foundations = this.foundations;
		return output;
	}
}

const Card = function(suit, value) {
	this.suit = suit;
	this.value = value;
	this.faceUp = true;
	this.selected = false;

	this.flip = function() {
		if (this.faceUp == false) this.faceUp = true;
		else this.faceUp = false;
	}
}

module.exports = Game;
