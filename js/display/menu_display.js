const MenuDisplay = function(d) {
	
	let stdout = process.stdout;

	const logoText = [
		'  █████████  █████████  ██        ████████  ████████  █████████  ████████  █████████  █████████  ',
		'  ██         ██     ██  ██           ██        ██     ██     ██     ██     ██     ██  ██         ',
		'  █████████  ██     ██  ██           ██        ██     █████████     ██     █████████  ████████   ',
		'         ██  ██     ██  ██           ██        ██     ██     ██     ██     ██    ██   ██         ',
		'  █████████  █████████  ████████  ████████     ██     ██     ██  ████████  ██     ██  █████████  '
	];
	const optionText = ['NEW GAME', 'CONTINUE', 'SETTINGS', 'QUIT'];

	this.drawContinueBtn = true;

	this.setSize = function() {
		logo = {
			w: logoText[0].length + 2,
			h: logoText.length + 4,
			x: d.centerWidth(logoText[0].length),
			y: d.centerHeight(20)
		}
		options = {
			w: 16,
			h: optionText.length + 5 - (this.drawContinueBtn ? 0 : 2),
			x: d.centerWidth(16),
			y: logo.y + logoText.length + 6
		}
	}
	let x, y;
	let options;
	this.setSize();

	let colorscheme;
	this.drawStatic = function() {
		d.setColour(d.menuScheme.text);
		d.drawSquare(logo.x, logo.y, logo.w, logo.h, false);
		for (let i = 0; i < 2; i++)
			d.draw(' '.repeat(logo.w - 2), logo.x + 1, logo.y + 1 + 6 * i);
		for (let i = 0; i < logoText.length; i++)
			d.draw(logoText[i], logo.x + 1, logo.y + 2 + i);

		d.drawSquare(options.x, options.y, options.w, options.h, true);
	}

	this.drawDynamic = function(selectedIndex) {
		for (let i = 0; i < optionText.length; i++) {
			if (i == 1 && !this.drawContinueBtn) continue;
			if (i == selectedIndex) d.setColour(d.menuScheme.cursor);
			else d.setColour(d.menuScheme.text);
			let spacing = (options.w - optionText[i].length - 2) / 2;
			let output = ' '.repeat(spacing) + optionText[i] + ' '.repeat(spacing);
			d.draw(output, options.x + 1, options.y + 1 + 2 * i);
		}
	}

	this.clear = function() {
		d.setColour('tab');
		d.drawSquare(logo.x, logo.y, logo.w, logo.h, true, 'none');
		d.drawSquare(options.x, options.y, options.w, options.h, true, 'none');
	}
}

module.exports = MenuDisplay;
