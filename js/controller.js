//let settings = require("../json/settings.json");
//let controls = settings.controls;
let suits = ['h', 'c', 'd', 's'];

const Controller = function() {

	this.setBuffer = function() { // Sets controller to the starting position at pile 4
		this.buffer = [{type: 'pile', index: 3, depth: 0, fullDepth: 3}];
	}
	this.setBuffer();
	this.menuOption = 0;
	this.pauseOption = 0;
	this.action = {execute: false, command: []};
	this.toMode = false;
	// this.pileData and this.gameData from main file

	const cycleDown = function(index, length) {
		if (index == 0) return length - 1;
		else return index - 1;
	}
	const cycleUp = function(index, length) {
		if (index == length - 1) return 0;
		else return index + 1;
	}

	this.update = function(key) {
		this.updated = false;
		this.flip = this.submit = this.quit = false;
		this.up = this.down = this.left = this.right = false;
		this.to = this.waste = this.esc = this.undo = false;
		this.jumpTo = null;

		switch(key) {
			case 'up' : case 'k' : this.up = true; break;
			case 'down' : case 'j' : this.down = true; break;
			case 'left' : case 'h' : this.left = true; break;
			case 'right' : case 'l' : this.right = true; break;

			case '1' : this.jumpTo = 0; break;
			case '2' : this.jumpTo = 1; break;
			case '3' : this.jumpTo = 2; break;
			case '4' : this.jumpTo = 3; break;
			case '5' : this.jumpTo = 4; break;
			case '6' : this.jumpTo = 5; break;
			case '7' : this.jumpTo = 6; break;

			case 'space' : this.flip = true; break;
			case 'return' : this.submit = true; break;
			case 't' : this.to = true; break;
			case 'w' : this.waste = true; break;
			case 'escape' : this.esc = true; break;

			case 'u' : this.undo = true; break;
			case 'q' : this.quit = true; break;
		}
	}
	this.update();

	this.handleMenu = function() {
		if (this.up) {
			if (this.menuOption == 0) this.menuOption = 3;
			else this.menuOption--;
		}
		if (this.down) {
			if (this.menuOption == 3) this.menuOption = 0;
			else this.menuOption++;
		}
		if (this.jumpTo !== null && (this.jumpTo >= 1 || this.jumpTo <= 4))
			this.menuOption = this.jumpTo;
	}

	this.resetPause = function() {
		this.pause = false;
		this.pauseOption = 0;
	}

	this.handlePause = function() {
		if (this.esc || this.submit && this.pauseOption == 0)
			this.resetPause();
		else if (this.up) {
			if (this.pauseOption == 0) this.pauseOption = 2;
			else this.pauseOption--;
		}
		else if (this.down) {
			if (this.pauseOption == 2) this.pauseOption = 0;
			else this.pauseOption++;
		}
	}

	this.handleBuffer = function() {
		let first = this.buffer[0];
		let second = this.buffer[1];

		/*
		let last = this.buffer[this.buffer.length - 1];
		if (this.jumpTo != null && last.type == 'pile')
			last.index = this.jumpTo;
		*/

		if (this.buffer.length == 2) {
			if (this.toMode && this.submit)
				this.toMode = false;

			if (this.toMode) {

				if (this.left) second.index = this.cycleLeft(second.index, false);
				if (this.right) second.index = this.cycleRight(second.index, false);
				if (this.left || this.right)
					second.fullDepth = this.gameData.piles[second.index].length - 1;

				if (this.jumpTo != null) {
					second.index = this.jumpTo;
					second.fullDepth = this.fullDepth(second.index, second.depth);
					this.toMode = false;
					this.outputCommand();
					return;
				}

				if (this.up && first.depth > 0)
					first.depth--;
				if (this.down && first.depth + 1 < this.pileData[first.index])
					first.depth++;
				first.fullDepth = this.fullDepth(first.index, first.depth);

				if (this.esc || this.to || (this.waste && first.type == 'waste')) { // getting out of to mode
					if (this.pileData[second.index] != 0)
						this.buffer[0].index = second.index;
					this.buffer.pop();
					this.toMode = false;
				}

			} else {
				this.outputCommand();
				return;
			}

		} else if (this.buffer.length == 1) {

			if (this.jumpTo != null) {
				first.index = this.jumpTo;
				first.type = 'pile';
				this.to = true;
			}
			if (this.to) {
				this.toMode = true;
				this.buffer.push({type: 'pile', index: first.index, depth: 0, fullDepth: this.fullDepth(first.index, 0)});
				first.fullDepth = this.fullDepth(first.index, first.depth);
			}
			if (this.left && first.type == 'pile') {
				first.index = this.cycleLeft(first.index, true);
				first.depth = 0;
			}
			if (this.right && first.type == 'pile') {
				first.index = this.cycleRight(first.index, true);
				first.depth = 0;
			}
			if (this.right && first.type == 'waste') {
				first.type = 'foundation';
				first.index = 0;
			}
			if (this.left || this.right)
				first.fullDepth = this.fullDepth(first.index, first.depth);

			if (this.up && this.gameData.waste.length > 0)
				first.type = 'waste';
			if (this.down)
				first.type = 'pile';

			if (this.waste && this.gameData.waste.length > 0) {
				first.type = 'waste';
				this.toMode = true;
				this.buffer.push({type: 'pile', index: first.index, depth: 0, fullDepth: this.fullDepth(first.index, 0)});
				first.fullDepth = this.fullDepth(first.index, first.depth);
			}
			if (this.submit) {
				let suitIndex = suits.indexOf(this.gameData.piles[first.index][this.gameData.piles[first.index].length - 1].suit);
				this.buffer.push({type: 'foundation', index: suitIndex, depth: null});
				this.handleBuffer();
				return;
			}
			if (this.esc) {
				if (!this.pause) this.pause = true;
				else this.pause = false;
			}
		} else {
		}
		this.action = {execute: false, command: []};

	}

	this.outputCommand = function() {
		this.action = {
			execute: true,
			command: [this.buffer[0], this.buffer[1]],
		}
	}

	this.cycleLeft = function(index, skip) {
		let newIndex;
		if (index == 0) newIndex = 6;
		else newIndex = index - 1;
		if (skip && this.pileData[newIndex] == 0)
			return this.cycleLeft(newIndex, true);
		else return newIndex;
	}
	this.cycleRight = function(index, skip) {
		let newIndex;
		if (index == 6) newIndex = 0;
		else newIndex = index + 1;
		if (skip && this.pileData[newIndex] == 0)
			return this.cycleRight(newIndex, true);
		else return newIndex;
	}
	this.fullDepth = function(index, faceUpDepth) {
		return this.gameData.piles[index].length - this.pileData[index] + faceUpDepth;
	}

	this.handleSettings = function() {
		return this.settings.handleBuffer(this);
	}
}



module.exports = Controller;
