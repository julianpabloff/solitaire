const game = new (require('./js/game.js'));
const display = new (require('./js/display/display.js'));
	const MenuDisplay = require('./js/display/menu_display.js');
	display.menu = new MenuDisplay(display);
	const GameDisplay = require('./js/display/game_display.js');
	display.game = new GameDisplay(display);
	const SettingsDisplay = require('./js/display/settings_display.js');
	display.settings = new SettingsDisplay(display);
const controller = new (require('./js/controller/controller.js'));
	controller.settings = new (require('./js/controller/settings_controller.js'));
const fs = require('fs');


///// MAIN MENU /////

function updateMenu() {
	controller.handleMenu();
	//display.drawMainMenu(controller.menuOption);
	display.menu.drawDynamic(controller.menuOption);
	if (controller.submit) {
		if (controller.menuOption == 0)
			switchTo('game');
		else if (controller.menuOption == 2) {
			switchTo('settings');
		}
		else if (controller.menuOption == 3) {
			display.exit();
			console.clear();
			process.exit();
		}
	}
}


///// GAME SCREEN /////

let history = [];
let lastBuffer;

function updateGame() {
	display.game.controller(controller.buffer, true);
	let initialBuffer = JSON.parse(JSON.stringify(controller.buffer));
	controller.handleBuffer();

	if (controller.flip && !controller.toMode) {
		let prevStock = game.stock.length;
		game.flipDeck(true);
		if (game.stock.length > 0 && prevStock == 0 || game.stock.length == 0 && prevStock > 0)
			display.game.stock(game.stock);
		//history.push(game.getGameData());
		
		//display.updateDeck(game.stock, game.waste);
		display.game.waste(game.waste);
		let command = { type: 'flip' };
		history.push(command);
	}

	if (controller.pause) {
		//display.drawPauseMenu(controller.pauseOption);
		display.game.pause.drawStatic();
		update = screenUpdates['pause'];
		return;
	}


	/* Disabling undo for now
	if (controller.undo && history.length > 0) {
		let recent = history[history.length - 1];
		if (recent.type == 'flip') {
			game.flipDeck(false);
			display.updateDeck(game.stock, game.waste);
		} else {
			controller.action.execute = true;
			controller.action.command = recent;
		}
		history.pop();
	}*/

	// Pop the cursor back down when the waste is empty
	if (game.waste.length == 0)
		controller.buffer[0].type = 'pile';

	//// MOVEMENT TYPES ////
	// pile to pile CHECK

	// pile to foundation
	// foundation to pile *

	// waste to pile CHECK
	// pile to waste *

	// waste to foundation
	// foundation to waste *

	if (controller.action.execute) {
		let command = JSON.parse(JSON.stringify(controller.action.command));
		let action = game.moveCards(command, !controller.undo);
		let reverseCommand;

		if (action.ran) {
			if (action.type == 'pileTOpile') {
				let firstIndex = command[0].index; let secondIndex = command[1].index;
				let firstPile = game.piles[firstIndex]; let secondePile = game.piles[secondIndex];

				let firstDiff = firstPile.length - action.initialLength[0];
				let secondDiff = secondePile.length - action.initialLength[1];

				display.game.pile(firstPile, firstIndex, firstDiff);
				display.game.pile(secondePile, secondIndex, secondDiff);
				if (!controller.undo) {
					reverseCommand = [command[1], command[0]];
					reverseCommand[0].fullDepth += 1;
					if (reverseCommand[1].fullDepth > 0) reverseCommand[1].fullDepth -= 1;
					controller.buffer.shift();
				} else {
					if (secondePile.length > 1)
						game.piles[secondIndex][command[1].fullDepth].faceUp = false;
					controller.buffer[0].index = secondIndex;
				}
				//display.init();
				//display.drawGameBoard(game);

				
			} else if (action.type == 'pileTOfoundation') {
				let pileIndex = command[0].index;
				let pile = game.piles[pileIndex];
				let diff = pile.length - action.initialLength;

				if (!controller.undo) {
					reverseCommand = [command[1], command[0]];
					controller.buffer.pop();
					if (game.piles[pileIndex].length == 0)
						controller.buffer[0].index = controller.cycleRight(pileIndex, true);
					if (game.over()) {
						display.clearGameBoard();
						update = updateEnd;
						update();
						return;
					}
				}

				display.game.pile(pile, pileIndex, diff);
				display.game.waste(game.waste);
				display.game.foundations(game.foundations);

				//display.init();
				//display.drawGameBoard(game);

			} else if (action.type == 'foundationTOpile') {
				let pileIndex = command[1].index;
				let pile = game.piles[pileIndex];
				let diff = pile.length - action.initialLength;


				if (!controller.undo) {

				} else {
					if (pile.length > 1)
						game.piles[pileIndex][command[1].fullDepth - 1].faceUp = false;
					controller.buffer[0].index = pileIndex;;
					//display.init();
					//display.drawGameBoard(game);
				}

				display.game.pile(pile, pileIndex, diff);
				display.game.foundations(game.foundations);

			} else if (action.type == 'wasteTOpile') {
				let pileIndex = command[1].index;
				let pile = game.piles[pileIndex];
				let diff = pile.length - action.initialLength;

				if (!controller.undo) {
					reverseCommand = [command[1], command[0]];
				}

				display.game.pile(pile, pileIndex, diff);
				display.game.waste(game.waste);
				controller.buffer.shift();

			} else if (action.type == 'wasteTOfoundation') {
				display.game.waste(game.waste);
				display.game.foundations(game.foundations);
				if (game.waste.length == 0)
					controller.buffer[0].type = 'pile';
				controller.buffer.pop();
				if (game.over()) {
					display.clearGameBoard();
					update = updateEnd;
					update();
				}
			}
			if (!controller.undo) history.push(reverseCommand);
		} else {
			if (action.type == 'wasteTOpile') {
				controller.buffer[0].index = controller.buffer[1].index;
			}
			controller.buffer.pop();
		}
	}
	//display.drawController(initialController, controller);
	display.game.controller(controller.buffer, false);
}

///// PAUSE //////

function updatePause() {
	controller.handlePause();
	if (controller.pause == false) {
		//display.clearPauseMenu(game.piles[3]);
		display.game.pause.clear(game.piles[3]);
		//display.drawController(controller);
		update = screenUpdates['game'];
	}
	else if (controller.submit) {
		if (controller.pauseOption == 1) {
			controller.toMode = false;
			switchTo('menu');
		}
		controller.resetPause();
	}
	else display.game.pause.drawDynamic(controller.pauseOption);
}

///// SETTINGS /////

//Temporary
let jsonSettings = {
	theme: 'ice',
	label: false,
	draw: 1
};
const allSettings = {
	theme: ['normal', 'light', 'dark', 'ice'],
	label: [true, false],
	draw: [1, 3]
};

const settingCounts = []; // [4, 2, 2]
for (let k of Object.keys(allSettings))
	controller.settings.counts.push(allSettings[k].length);

function genControllerSettingsCode(settings) {
	let code = [];
	for (let k of Object.keys(settings))
		code.push(allSettings[k].indexOf(settings[k]));
	return code;
}
controller.settings.code = genControllerSettingsCode(jsonSettings);

function updateSettings() {
	let changed = controller.handleSettings();
	if (controller.settings.exit) {
		let newSettings = controller.settings.exportChanges(allSettings);
		applySettings(newSettings);
		if (newSettings.theme != jsonSettings.theme)
			display.init();
		jsonSettings = newSettings;
		switchTo('menu');
		return;
	}
	if (changed) display.settings.drawPreview(controller.settings.code);
	display.settings.drawDynamic(controller.settings.buffer, controller.settings.code);
}

function applySettings(settings) {
	game.drawAmount = settings.draw;
	display.setTheme(settings.theme);
}

///// WIN SCREEN /////

function updateEnd() {
	display.clearGameBoard();
	if (controller.quit) { display.exit(); process.exit(); }
}



let screenUpdates = {
	menu: updateMenu,
	game: updateGame,
	pause: updatePause,
	settings: updateSettings,
	end: updateEnd,
}

let screen = 'menu';
let update = screenUpdates[screen];

function switchTo(name) {
	clearScreen(screen);
	screen = name;
	update = screenUpdates[name];
	startScreen(name);
}

function clearScreen(name) {
	if (name == 'menu') display.menu.clear();
	else if (name == 'game') display.game.clear(game.piles);//display.init(); //display.clearGameBoard();
	else if (name == 'settings') display.settings.clear();
}

function startScreen(name) {
	if (name == 'menu') {
		display.menu.drawStatic();
		display.menu.drawDynamic(controller.menuOption);
	} else if (name == 'game') {
		game.shuffle().restart();
		controller.setBuffer();
		display.game.drawAll(game.piles);
		display.game.controller(controller.buffer);
		//display.game.controller(controller.buffer);
	} else if (name == 'settings') {
		display.settings.drawStatic();
		display.settings.drawDynamic(controller.settings.buffer, controller.settings.code);
		display.settings.drawPreview(controller.settings.code);
	}
}

applySettings(jsonSettings);
game.buildDeck();
display.init();
startScreen('menu');
//display.debug(game);
//display.debugController(game, controller, history);

let keypress = require("keypress");
keypress(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on("keypress", function(ch, k) {
	let key = (k == undefined) ? ch : k;
	/* Use this scrolling dynamically
	if (key.name == 'up') { process.stdout.write('\033[0;0f\033[M'); return; }
	if (key.name == 'down') { 
		for (let i = 0; i < 5; i++)
			process.stdout.write('\033[0;0f\033[L');
		return;
	}*/
	controller.pileData = game.getPileData();
	controller.gameData = game.getGameData();
	controller.update(key.name);
	update();
	//display.debug(game);
	//display.debugController(game, controller, history);
});

let rows = process.stdout.rows;
let columns = process.stdout.columns;
setInterval(() => {
	if (rows != process.stdout.rows || columns != process.stdout.columns) {
		rows = process.stdout.rows;
		columns = process.stdout.columns;
	}
}, 20);
