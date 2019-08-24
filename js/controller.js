let controls = require("../json/controls.json");

const Controller = function() {

	let move;
	this.buffer = [];
	this.action = {execute: false, command: []};
	this.pileData = null; // crucial data from the game class

	this.handleBuffer = function() {
		if (this.buffer.length == 2) {
			this.action = {
				execute: true,
				command: [this.buffer[0], this.buffer[1]]
			}
			this.buffer = [];
			return;

		} else if (this.buffer.length == 1) {
			if (this.up && this.buffer[0].depth > 0)
				this.buffer[0].depth--;
			if (this.down && this.buffer[0].depth + 1 < this.pileData[this.buffer[0]["index"]])
				this.buffer[0].depth++;

		} else {
		}
		this.action = {execute: false, command: []};
	}

	//// Movement Types ////
	// pile to pile
	// pile to foundation
	// waste to pile
	// waste to foundation

	this.update = function(key) {
		this.flip = this.submit = this.quit = false;
		this.up = this.down = this.left = this.right = false;
		move = null;

		switch(key) {
			case controls.flip : this.flip = true; break;
			case controls.pileOne : move = {type: 'pile', index: 0, depth: 0}; break;
			case controls.pileTwo : move = {type: 'pile', index: 1, depth: 0}; break;
			case controls.pileThree : move = {type: 'pile', index: 2, depth: 0}; break;
			case controls.pileFour : move = {type: 'pile', index: 3, depth: 0}; break;
			case controls.pileFive : move = {type: 'pile', index: 4, depth: 0}; break;
			case controls.pileSix : move = {type: 'pile', index: 5, depth: 0}; break;
			case controls.pileSeven : move = {type: 'pile', index: 6, depth: 0}; break;
			case controls.submit : move = {type: 'submit', index: null, depth: null}; break;
			case controls.selectUp : this.up = true; break;
			case controls.selectDown : this.down = true; break;
			case controls.selectLeft : this.left = true; break;
			case controls.selectRight : this.right = true; break;
		}

		// Escape key clears the buffer or quits the game if it did that
		if (key == controls.escape) {
			if (this.buffer.length == 0) this.quit = true;
			this.buffer = [];
		}

		if (move != null) {
			this.buffer.push(move);
		}
		this.handleBuffer();
	}
	this.update();


}

module.exports = Controller;
