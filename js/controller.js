let settings = require("../json/settings.json");
let controls = settings.controls;
let suits = ['h', 'c', 'd', 's'];

const Controller = function() {

	this.buffer = [{type: 'pile', index: 3, depth: 0, fullDepth: 3}];
	this.menuOption = 0;
	this.action = {execute: false, command: []};
	this.toMode = false;
	// this.pileData and this.gameData from main file

	this.update = function(key) {
		this.flip = this.submit = this.waste = this.quit = false;
		this.up = this.down = this.left = this.right = false;
		this.to = this.cancel = this.undo = false;
		this.jumpTo = null;
		move = null;

		switch(key) {
			case controls.selectUp : this.up = true; break;
			case controls.selectDown : this.down = true; break;
			case controls.selectLeft : this.left = true; break;
			case controls.selectRight : this.right = true; break;

			case controls.pileOne : this.jumpTo = 0; break;
			case controls.pileTwo : this.jumpTo = 1; break;
			case controls.pileThree : this.jumpTo = 2; break;
			case controls.pileFour : this.jumpTo = 3; break;
			case controls.pileFive : this.jumpTo = 4; break;
			case controls.pileSix : this.jumpTo = 5; break;
			case controls.pileSeven : this.jumpTo = 6; break;

			case controls.flip : this.flip = true; break;
			case controls.submit : this.submit = true; break;
			case controls.waste : this.waste = true; break;
			case controls.to : this.to = true; break;
			case controls.cancel : this.cancel = true; break;

			case controls.undo : this.undo = true; break;
			case controls.quit : this.quit = true; break;
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
	}

	this.handleBuffer = function() {
		let first = this.buffer[0];
		let second = this.buffer[1];

		let last = this.buffer[this.buffer.length - 1];
		if (this.jumpTo != null && last.type == 'pile')
			last.index = this.jumpTo;

		if (this.buffer.length == 2) {
			if (this.toMode && this.submit)
				this.toMode = false;

			if (this.toMode) {

				if (this.left) second.index = this.cycleLeft(second.index, false);
				if (this.right) second.index = this.cycleRight(second.index, false);
				if (this.left || this.right)
					second.fullDepth = this.gameData.piles[second.index].length - 1;

				if (this.up && first.depth > 0)
					first.depth--;
				if (this.down && first.depth + 1 < this.pileData[first.index])
					first.depth++;
				first.fullDepth = this.fullDepth(first.index, first.depth);

				if (/*this.cancel || */this.to) { // getting out of to mode
					if (this.pileData[second.index] != 0)
						this.buffer[0].index = second.index;
					this.buffer.pop();
					this.toMode = false;
				}

			} else {
				this.action = {
					execute: true,
					command: [this.buffer[0], this.buffer[1]],
				}
				return;
			}

		} else if (this.buffer.length == 1) {
			
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

			if (this.submit) {
				let suitIndex = suits.indexOf(this.gameData.piles[first.index][this.gameData.piles[first.index].length - 1].suit);
				this.buffer.push({type: 'foundation', index: suitIndex, depth: null});
				this.handleBuffer();
				return;
			}

		} else {
		}
		this.action = {execute: false, command: []};

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
}




module.exports = Controller;
