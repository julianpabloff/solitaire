const game = new (require('./js/game.js'));
const display = new (require('./js/display.js'));
const controller = new (require('./js/controller.js'));
const fs = require('fs');

//// MOVEMENT TYPES ////
// pile to pile CHECK

// pile to foundation
// foundation to pile *

// waste to pile CHECK
// pile to waste *

// waste to foundation
// foundation to waste *

game.buildDeck();
display.init();
display.drawMainMenu(controller.menuOption);


function updateMenu() {
	controller.handleMenu();
	display.drawMainMenu(controller.menuOption);
	if (controller.submit) {
		if (controller.menuOption == 0) switchTo('game');
		if (controller.menuOption == 3) {
			display.exit();
			console.clear();
			process.exit();
		}
	}
}

let history = [];
let lastBuffer;

function updateGame() {
	controller.handleBuffer();

	if (controller.flip && !controller.toMode) {
		game.flipDeck(true);
		//history.push(game.getGameData());
		display.updateDeck(game.stock, game.waste);
		let command = { type: 'flip' };
		history.push(command);
	}

	if (controller.quit) { display.exit(); process.exit(); }
	if (controller.cancel) {
		switchTo('menu');
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

	if (game.waste.length == 0)
		controller.buffer[0].type = 'pile';

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

				display.drawPile(firstPile, firstIndex, firstDiff);
				display.drawPile(secondePile, secondIndex, secondDiff);
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

				display.drawPile(pile, pileIndex, diff);
				display.updateFoundations(game.foundations);

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

				display.drawPile(pile, pileIndex, diff);
				display.updateFoundations(game.foundations);

			} else if (action.type == 'wasteTOpile') {
				let pileIndex = command[1].index;
				let pile = game.piles[pileIndex];
				let diff = pile.length - action.initialLength;

				if (!controller.undo) {
					reverseCommand = [command[1], command[0]];
				}

				display.drawPile(pile, pileIndex, diff);
				display.updateDeck(game.stock, game.waste);
				controller.buffer.shift();

			} else if (action.type == 'wasteTOfoundation') {
				display.updateDeck(game.stock, game.waste);
				display.updateFoundations(game.foundations);
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
	display.drawController(controller);
}

function updateEnd() {
	display.clearGameBoard();
	if (controller.quit) { display.exit(); process.exit(); }
}

const screens = {
	menu: updateMenu,
	game: updateGame,
	end: updateEnd,
}

let update = screens.menu;

const switchTo = function(screen) {
	if (update == screens.menu) {
		if (screen == 'game') {
			game.shuffle();
			game.dealCards();
			//game.almostWin();
			display.init();
			display.drawGameBoard(game);
			display.drawController(controller);
			update = screens.game;
			return;
		}
	} else if (update == screens.game) {
		if (screen == 'menu') {
			display.clearGameBoard();
			display.drawMainMenu(controller.menuOption);
			update = screens.menu;
			return;
		}
	}
}


//display.debug(game);
//display.debugController(game, controller, history);

let keypress = require("keypress");
keypress(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on("keypress", function(ch, k) {
	let key = (k == undefined) ? ch : k;
	/*
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
