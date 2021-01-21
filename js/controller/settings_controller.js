const SettingsController = function() {
	this.buffer = [0];
	this.counts = [];
	// this.code = [];

	const cycleDown = function(index, length) {
		if (index == 0) return length - 1;
		else return index - 1;
	}
	const cycleUp = function(index, length) {
		if (index == length - 1) return 0;
		else return index + 1;
	}

	this.handleBuffer = function(controller) {
		this.exit = false;
		let length = this.buffer.length;
		if (length == 1) {
			if (controller.up) this.buffer[0] = cycleDown(this.buffer[0], this.counts.length);
			else if (controller.down) this.buffer[0] = cycleUp(this.buffer[0], this.counts.length);
			else if (controller.submit) this.buffer.push(this.code[this.buffer[0]]);
			else if (controller.esc) {
				this.buffer[0] = 0;
				this.exit = true;
			}
		}
		else if (length == 2) {
			if (controller.up) this.buffer[1] = cycleDown(this.buffer[1], this.counts[this.buffer[0]]);
			else if (controller.down) this.buffer[1] = cycleUp(this.buffer[1], this.counts[this.buffer[0]]);
			else if (controller.submit) {
				this.code[this.buffer[0]] = this.buffer[1];
				this.buffer.pop();
				if (this.buffer[0] == 0 || this.buffer[0] == 1) return true;
			}
			else if (controller.esc) this.buffer.pop();
		}
		return false;
	}

	this.exportChanges = function(settings) {
		let output = {};
		let i = 0;
		for (let k of Object.keys(settings)) {
			output[k] = settings[k][this.code[i]];
			i++;
		}
		return output;
	}
}

module.exports = SettingsController;
