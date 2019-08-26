const game = new (require('./js/game.js'));
const display = new (require('./js/display.js'));
const controller = new (require('./js/controller.js'));

let history = [];

display.init();
game.buildDeck().shuffle();
game.dealCards();
display.drawGameBoard(game);
display.drawController(controller);
//display.debug(game);
//display.debugController(controller);

const update = function() {
	if (controller.flip) { //&& !controller.toMode) {
		game.flipDeck();
		if (game.waste.length == 0)
			controller.buffer[0].type = 'pile';
		display.updateDeck(game.stock, game.waste);
	}
	if (controller.quit) { display.exit(); process.exit(); }

	if (controller.undo && history.length > 0) {

	}

	if (controller.action.execute) {
		let command = controller.action.command;
		let action = game.moveCards(command);

		if (action.ran) {
			if (action.type == 'pileToPile') {
				let firstIndex = command[0].index; let secondIndex = command[1].index;
				let firstPile = game.piles[firstIndex]; let secondePile = game.piles[secondIndex];

				let firstDiff = firstPile.length - action.initialLength[0];
				let secondDiff = secondePile.length - action.initialLength[1];

				display.drawPile(firstPile, firstIndex, firstDiff);
				display.drawPile(secondePile, secondIndex, secondDiff);
				controller.buffer.shift();
				
			} else if (action.type == 'pileToFoundation') {
				let pileIndex = command[0].index;
				let pile = game.piles[pileIndex];
				let diff = pile.length - action.initialLength;

				display.drawPile(pile, pileIndex, diff);
				display.updateFoundations(game.foundations);
				controller.buffer.pop();

			} else if (action.type == 'wasteToPile') {
				let pileIndex = command[1].index;
				let pile = game.piles[pileIndex];
				let diff = pile.length - action.initialLength;

				display.drawPile(pile, pileIndex, diff);
				display.updateDeck(game.stock, game.waste);
				controller.buffer.shift();
			} else if (action.type == 'wasteToFoundation') {
				display.updateDeck(game.stock, game.waste);
				display.updateFoundations(game.foundations);
				if (game.waste.length == 0)
					controller.buffer[0].type = 'pile';
				controller.buffer.pop();
			}
			history.push({cards: game.getGameData(), action});
		} else {
			if (action.type == 'wasteToPile') {
				controller.buffer[0].index = controller.buffer[1].index;
			}
			controller.buffer.pop();
		}
	}
}

let keypress = require("keypress");
keypress(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on("keypress", function(ch, k) {
	let key = (k == undefined) ? ch : k;
	if (key.name == 'up') { process.stdout.write('\033[0;0f\033[M'); return; }
	if (key.name == 'down') { 
		for (let i = 0; i < 5; i++)
			process.stdout.write('\033[0;0f\033[L');
		return;
	}
	controller.pileData = game.getPileData();
	controller.gameData = game.getGameData();
	controller.update(key.name);
	update();
	//display.debug(game);
	//display.debugController(controller);
	display.drawController(controller);
});
