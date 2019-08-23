const game = new (require('./js/game.js'));
const display = new (require('./js/display.js'));
const controller = new (require('./js/controller.js'));

display.init();
game.buildDeck().shuffle();
game.dealCards();
display.drawGameBoard(game);

const update = function() {
	if (controller.flip) game.flipDeck();
	if (controller.quit) { display.exit(); process.exit(); }
	if (controller.move.execute) {
		game.moveCards(controller.move.command);
	}
}

let keypress = require("keypress");
keypress(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on("keypress", function(ch, k) {
	let key = (k == undefined) ? ch : k;
	controller.update(key.name);
	update();
	display.init();
	display.drawGameBoard(game);
});
