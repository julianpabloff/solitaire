const Game = function() {

	let cards = [];
	let suits = ['h','c','d','s'];
	let values = [1,2,3,4,5,6,7,8,9,10,11,12,13];
	this.piles = [];
	this.stock = [];
	this.drawAmount = 1;
	this.waste = [];
	this.wasteVisible = 0;
	this.foundations = [];

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

	this.almostWin = function() {
		let cardsIndex = 0;
		for (let c = 0; c < cards.length - 1; c++) {
			this.foundations[suits.indexOf(cards[c].suit)].push(cards[c]);
		}
		for (let i = 0; i < 7; i++) this.piles.push([]);
		this.piles[0].push(cards[cards.length - 1]);
	}

	this.restart = function() {
		this.piles = [];
		this.stock = [];
		this.waste = [];
		this.wasteVisible = 0;
		this.foundations = [];
		this.dealCards();
		return this;
	}
	
	this.dealCards = function() {
		let cardsIndex = 0;
		for (let i = 0; i < 7; i++) { // 7 piles
			if (i < 4) this.foundations.push([]);
			this.piles.push([]);
			for (let j = 0; j < i + 1; j++) { // with increasing amounts
				if (j < i) cards[cardsIndex].faceUp = false;
				else cards[cardsIndex].faceUp = true;
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
	this.flipDeck = function(forward) { // I hate the repetitiveness of this function
		if (forward) {
			let i = 0;
			while (this.stock.length > 0 && i < this.drawAmount) {
				deckStartOver = false;
				this.waste.push(this.stock.pop());
				i++;
			}
			this.wasteVisible = this.wasteVisible + (this.waste.length <= 3);

			if (this.stock.length == 0) {
				if (deckStartOver) {
					let wasteLength = this.waste.length;
					for (let i = 0; i < wasteLength; i++) {
						this.stock.push(this.waste.pop());
					}
					this.wasteVisible = 0;
				} else deckStartOver = true;
			}
		} else { // I have yet to implement this.wasteVisible because undoing isn't a thing yet
			let amount = this.waste.length - Math.floor((this.waste.length - 1) / this.drawAmount) * this.drawAmount;
			let i = 0;
			while (this.waste.length > 0 && i < amount) {
				deckStartOver = false;
				this.stock.push(this.waste.pop());
				i++;
			}
			if (this.waste.length == 0) {
				if (deckStartOver) {
					let stockLength = this.stock.length;
					for (let i = 0; i < stockLength; i++) {
						this.waste.push(this.stock.pop());
					}
				} else deckStartOver = true;
			}
		}
	}

	this.moveCards = function(command, validate) {
		let first = command[0]; let second = command[1];
		let action = {};
		action.type = first.type + 'TO' + second.type;
		if (action.type != undefined) {
			functionOutput = this[action.type](first, second, validate);
			if (functionOutput.ran) {
				action.ran = true;
				action.initialLength = functionOutput.initialLength;
			}
			else action.ran = false;
		}
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

	this.pileTOpile = function(first, second, validate) {
		let firstPile = this.piles[first.index];
		let secondPile = this.piles[second.index];
		let firstInitalLength = firstPile.length;
		let secondInitalLength = secondPile.length;

		let c, depth;
		for (c = 0; c < firstPile.length; c++) {
			if (firstPile[c].faceUp) break;
		}

		//depth = c + first.depth;
		depth = first.fullDepth;
		let count = firstPile.length - depth;

		let firstCard = firstPile[depth];
		let secondCard = secondPile[secondPile.length - 1];

		let valid;
		if (validate) valid = this.validPair(firstCard, secondCard);
		else valid = true;
		if (valid) {
			this.piles[second.index] = this.piles[second.index].concat(firstPile.splice(depth, count));
			let firstPileLength = this.piles[first.index].length;
			let secondPileLength = this.piles[second.index].length;

			if (firstPileLength > 0)
				this.piles[first.index][firstPileLength - 1].faceUp = true;

			return {
				initialLength: [firstInitalLength, secondInitalLength],
				ran: true,
			};
		} else return {ran: false};
	}

	this.wasteTOpile = function(first, second) {
		let pile = this.piles[second.index];
		let initialLength = pile.length;

		let card = this.waste[this.waste.length - 1];
		let target = pile[pile.length - 1];
		if (this.validPair(card, target)) {
			this.piles[second.index].push(this.waste.pop());
			this.wasteVisible = this.wasteVisible - (this.waste.length < 3)
			return {
				initialLength: initialLength,
				ran: true,
			};
		} else return {ran: false};
	}

	this.foundationTOpile = function(first, second, validate) {
		let pile = this.piles[second.index];
		let initialLength = pile.length;
		let foundation = this.foundations[first.index];

		let card = foundation[foundation.length - 1];
		let target = pile[pile.length - 1];

		if (validate) valid = this.validPair(card, target);
		else valid = true;

		if (valid) {
			this.piles[second.index].push(this.foundations[first.index].pop());
			return {
				initialLength: initialLength,
				ran: true,
			};
		}
		return {ran: false};
	}

	this.pileTOfoundation = function(first, second, validate) {
		let pile = this.piles[first.index];
		let initialLength = pile.length;
		let card = pile[pile.length - 1];
		if (card == undefined) return {ran: false};
		let cardSuitIndex = suits.indexOf(card.suit);
		if (validate && this.validSubmit(card)) {
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

	this.wasteTOfoundation = function(first, second, validate) {
		let card = this.waste[this.waste.length - 1];
		if (card == undefined) return {ran: false};
		let cardSuitIndex = suits.indexOf(card.suit);
		if (validate && this.validSubmit(card)) {
			this.foundations[cardSuitIndex].push(this.waste.pop());
			return { ran: true };
		} else return {ran: false};
	}

	this.countFaceUp = function(pile) {
		let count = 0;
		for (let card of pile)
			if (card.faceUp) count++;
		return count;
	}
	this.getPileData = function() {
		let output = [];
		for (let pile of this.piles)
			output.push(this.countFaceUp(pile));
		return output;
	}

	this.over = function() {
		for (let foundation of this.foundations) {
			if (foundation.length == 0) return false;
			if (foundation[foundation.length - 1].value != 13) return false;
		}
		return true;
	}

	this.getGameData = function() {
		let output = {};
		let gameNow = JSON.parse(JSON.stringify(this));
		output.stock = gameNow.stock;
		output.waste = gameNow.waste;
		output.piles = gameNow.piles;
		output.foundations = gameNow.foundations;
		return output;
	}

	this.loadGame = function(gameData) {
		let gameNow = JSON.parse(JSON.stringify(gameData));
		this.stock = gameNow.stock;
		this.waste = gameNow.waste;
		this.piles = gameNow.piles;
		this.foundations = gameNow.foundations;
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
