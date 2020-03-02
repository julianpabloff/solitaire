const ControllerSettings = function() {
	this.buffer = [0];
	this.action = {execute: false, command: []};
	this.code = [];
	const cycleDown = function(index, length) {
		if (index == 0) return length - 1;
		else return index - 1;
	}
	const cycleUp = function(index, length) {
		if (index == length - 1) return 0;
		else return index + 1;
	}
	this.handleBuffer = function(controller, counts) {
		let length = this.buffer.length;
		if (length == 1) {
			if (controller.up) this.buffer[0] = cycleDown(this.buffer[0], counts.length);
			else if (controller.down) this.buffer[0] = cycleUp(this.buffer[0], counts.length);
			else if (controller.submit) this.buffer.push(0);
		}
		else if (length == 2) {
			if (controller.up) this.buffer[1] = cycleDown(this.buffer[1], counts[this.buffer[0]]);
			else if (controller.down) this.buffer[1] = cycleUp(this.buffer[1], counts[this.buffer[0]]);
			else if (controller.submit) this.buffer.pop();
		}
	}
}

module.exports = ControllerSettings;
