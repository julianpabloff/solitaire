let controls = require("./controls.json");

const Controller = function() {

	let cool = true;
	let selected = null;
	this.moveBuffer = [];
	this.move = {execute: false, command: []};

	this.update = function(key) {
		this.flip = false;
		this.quit = false;
		selected = null;

		switch(key) {
			case controls.flip : this.flip = cool; break;
			case controls.pileOne : if (cool) selected = 0; break;
			case controls.pileTwo : if (cool) selected = 1; break;
			case controls.pileThree : if (cool) selected = 2; break;
			case controls.pileFour : if (cool) selected = 3; break;
			case controls.pileFive : if (cool) selected = 4; break;
			case controls.pileSix : if (cool) selected = 5; break;
			case controls.pileSeven : if (cool) selected = 6; break;
		}

		if (key == controls.escape) {
			if (this.moveBuffer.length == 0) this.quit = cool;
			this.moveBuffer = [];
		}

		if (selected != null) {
			this.moveBuffer.push(selected);
			if (this.moveBuffer.length == 2) {
				this.move.execute = true;
				this.move.command = this.moveBuffer;
				this.moveBuffer = [];
			}
		} else {
			this.moveBuffer = [];
			this.move.execute = false;
		}

		if (cool) setTimeout(() => cool = true, 100);
		cool = false;
	}
	this.update();

}

module.exports = Controller;
