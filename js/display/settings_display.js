const SettingsDisplay = function(d) {

	let stdout = process.stdout;
	let rows, columns;
	let x, y;

	this.setSize = function() {
		rows = stdout.rows;
		columns = stdout.columns;
		x = Math.floor(columns / 2 - 36);
		y = Math.floor(rows / 2 - 15);
	}
	this.setSize();

	const settingsLogo = [
		'▄▄▄▄ ▄▄▄▄ ▄▄▄▄▄ ▄▄▄▄▄ ▄▄▄▄▄ ▄▄▄▄ ▄▄▄▄ ▄▄▄▄',
		'█▄▄▄ █▄▄▄   █     █     █   █  █ █ ▄▄ █▄▄▄',
		'▄▄▄█ █▄▄▄   █     █   ▄▄█▄▄ █  █ █▄▄█ ▄▄▄█'
	];

	this.drawStatic = function() {
		d.setColour(d.menuScheme.text);
		d.drawSquare(x - 4, y - 2, 80, 34, true);
		for (let i = 0; i < settingsLogo.length; i++)
			d.draw(settingsLogo[i], x, y + i);
		d.drawSquare(x - 1, y + 4, 23, 5, false);
		d.draw('press esc when done', x, y + 29);
	}

	this.drawDynamic = function(buffer, code) {
		let items = ['THEME', 'LABELS', 'DIFFICULTY'];
		let options = [
			['NORMAL', 'LIGHT', 'DARK', 'ICE'],
			['ENABLED', 'DISABLED'],
			['DRAW 1', 'DRAW 3']
		];

		for (let i = 0; i < items.length; i++) {
			let width = 23;
			if (i == buffer[0]) d.setColour(d.menuScheme.cursor);
			else d.setColour(d.menuScheme.text);
			let output = ' ' + items[i] + ' - ' + options[i][code[i]];
			d.draw(output, x, y + 5 + i);
			let spaceAmount = 23 - (2 + output.length);
			if (spaceAmount > 0) stdout.write(' '.repeat(spaceAmount));
		}
		if (buffer.length == 1) {
			d.setColour(d.menuScheme.text);
			d.drawSquare(x + 23, y + 4, 16, 6, true, 'none');
		}
		if (buffer.length == 2) {
			let width = 16;
			d.setColour(d.menuScheme.text);
			d.drawSquare(x + 23, y + 4, width, 2 + options[buffer[0]].length, false);

			for (let i = 0; i < options[buffer[0]].length; i++) {
				stdout.cursorTo(x + 24, y + 5 + i);
				if (i == buffer[1]) d.setColour(d.menuScheme.cursor);
				else d.setColour(d.menuScheme.text);
				let output = options[buffer[0]][i];
				stdout.write(' ' + output);
				let spaceAmount = width - 3 - output.length;
				for (let j = 0; j < spaceAmount; j++)
					stdout.write(' ');
			}
		}
	}

	this.drawPreview = function(code) {
		let theme = d.themes[code[0]];
		let one = d.fullColor(theme.one.fg, theme.one.bg); // Card color one
		let two = d.fullColor(theme.two.fg, theme.two.bg); // Card color two
		let bac = d.fullColor(theme.bac.fg, theme.bac.bg); // Back of card color
		let tab = d.fullColor(theme.tab.fg, theme.tab.bg); // Table color
		let cur = d.fullColor(theme.cur.fg, theme.cur.bg); // Cursor color
		let tom = d.fullColor(theme.tom.fg, theme.tom.bg); // To Mode color

		let preview = [
			one + ' ' + two + '│            │' + tab + '              ░░░░░░░░░░░░░░    ░░░░░░░░░░░░░░    ' + one + '│      ',
			one + ' ' + two + '│          J │' + tab + '              ░░░░░░░░░░░░░░    ░░░░░░░░░░░░░░    ' + one + '│      ',
			one + '─' + two + '└────────────┘' + tab + '              ░░░░░░░░░░░░░░    ░░░░░░░░░░░░░░    ' + one + '└──────',
			tab + '                                                                        ',
			tab + '                                                                        ',
			tab + 'E 2        ' + cur + '    PILE 3    ' + tab + '        PILE 4        ' + tom + '    PILE 5    ' + tab + '        PIL',
			tab + '                                                                        ',
			two + '──────┐' + tab + '    ' + bac + '┌────────────┐' + tab + '    ' + one + '┌────────────┐' + tab + '    ' + bac + '┌────────────┐' + tab + '    ' + bac + '┌──────',
			two + '      │' + tab + '    ' + bac + '│. . . . . . │' + tab + '    ' + one + '│ K          │' + tab + '    ' + bac + '│. . . . . . │' + tab + '    ' + bac + '│. . . ',
			one + '──────┐' + tab + '    ' + bac + '┌────────────┐' + tab + '    ' + two + '┌────────────┐' + tab + '    ' + bac + '┌────────────┐' + tab + '    ' + bac + '┌──────',
			one + '      │' + tab + '    ' + bac + '│. . . . . . │' + tab + '    ' + two + '│ Q          │' + tab + '    ' + bac + '│. . . . . . │' + tab + '    ' + bac + '│. . . ',
			one + ' _    │' + tab + '    ' + two + '┌────────────┐' + tab + '    ' + one + '┌────────────┐' + tab + '    ' + bac + '┌────────────┐' + tab + '    ' + bac + '┌──────',
			one + '/ \\   │' + tab + '    ' + two + '│ J          │' + tab + '    ' + one + '│ J          │' + tab + '    ' + bac + '│. . . . . . │' + tab + '    ' + bac + '│. . . ',
			one + '  /   │' + tab + '    ' + one + '┌────────────┐' + tab + '    ' + two + '┌────────────┐' + tab + '    ' + one + '┌────────────┐' + tab + '    ' + bac + '┌──────',
			one + ' /    │' + tab + '    ' + one + '│ 10         │' + tab + '    ' + two + '│ 10         │' + tab + '    ' + one + '│ 8          │' + tab + '    ' + bac + '│. . . ',
			one + '/     │' + tab + '    ' + two + '┌────────────┐' + tab + '    ' + two + '│     /\\     │' + tab + '    ' + two + '┌────────────┐' + tab + '    ' + two + '┌──────',
			one + '      │' + tab + '    ' + two + '│ 9          │' + tab + '    ' + two + '│    /  \\    │' + tab + '    ' + two + '│ 7          │' + tab + '    ' + two + '│ 6    '

		];
		let noLabel = tab + '           ' + cur + '              ' + tab + '                      ' + tom + '              ' + tab + '           ';

		for (let i = 0; i < preview.length; i++) {
			stdout.cursorTo(x, y + 11 + i);
			if (i == 5 && code[1] == 1)
				stdout.write(noLabel);
			else stdout.write(preview[i]);
		}
		d.setColour(d.menuScheme.text);
		d.drawSquare(x - 1, y + 10, 74, preview.length + 2, false);
	}

	this.clear = function() {
		d.setColour('tab');
		d.drawSquare(x - 4, y - 2, 80, 34, true, 'none');
	}

}

module.exports = SettingsDisplay;
