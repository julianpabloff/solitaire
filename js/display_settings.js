const DisplaySettings = function(d) {

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
		d.drawBackground('black');
		d.setFg('white');
		for (let i = 0; i < settingsLogo.length; i++) {
			stdout.cursorTo(x, y + i);
			stdout.write(settingsLogo[i]);
		}
		stdout.cursorTo(x, y + 29);
		stdout.write('press esc when done');
	}

	this.drawDynamic = function(buffer, code) {
		let items = ['THEME', 'LABELS', 'DIFFICULTY'];
		let options = [
			['NORMAL', 'LIGHT', 'DARK', 'ICE'],
			['ENABLED', 'DISABLED'],
			['DRAW 1', 'DRAW 3']
		];

		d.setColor('white', 'black');
		d.drawSquare(x - 1, y + 4, 23, 5, false);
		for (let i = 0; i < items.length; i++) {
			stdout.cursorTo(x, y + 5 + i);
			if (i == buffer[0]) d.setColor('black', 'white');
			else d.setColor('white', 'black');
			let output = options[i][code[i]];
			stdout.write(' ' + items[i] + ' - ' + output);
			let spaceAmount = 20 - (items[i].length + 3 + output.length);
			for (let j = 0; j < spaceAmount; j++)
				stdout.write(' ');
		}
		if (buffer.length == 1) {
			d.setColor('black', 'black');
			d.drawSquare(x + 23, y + 4, 16, 6, true);
		}
		if (buffer.length == 2) {
			d.setColor('white', 'black');
			d.drawSquare(x + 23, y + 4, 16, 2 + options[buffer[0]].length, false);
			for (let i = 0; i < options[buffer[0]].length; i++) {
				stdout.cursorTo(x + 24, y + 5 + i);
				if (i == buffer[1]) d.setColor('black', 'white');
				else d.setColor('white', 'black');
				let output = options[buffer[0]][i];
				stdout.write(' ' + output);
				let spaceAmount = 13 - output.length;
				for (let j = 0; j < spaceAmount; j++)
					stdout.write(' ');
			}
		}
	}

	this.encodeThemes = function(themes) {
		for (let t in themes) {
			for (let k of Object.keys(themes[t])) {
				if (k != 'title') {
					let color1 = themes[t][k][0];
					let color2 = themes[t][k][1];
					themes[t][k] = d.fullColor(color1, color2);
				}
			}
		}
		this.themes = themes;
	}

	const jsonThemes = require('../json/themes.json');
	this.encodeThemes(jsonThemes);

	this.drawPreview = function(code) {
		let theme = this.themes[code[0]];
		let one = theme.one; // Card color one
		let two = theme.two; // Card color two
		let bac = theme.bac; // Back of card color
		let tab = theme.tab; // Table color
		let cur = theme.cur; // Cursor color
		let tom = theme.tom; // To Mode color

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
		d.setColor('white', 'black');
		d.drawSquare(x - 1, y + 10, 74, preview.length + 2, false);
	}

}

module.exports = DisplaySettings;
