const DisplaySettings = function() {
	this.drawBleh = function(display) {
		display.drawBackground('black');
		setFg('white');
	}
}

module.exports = DisplaySettings;
