const Game = require('./Game.js').Game
// const Character = require('./Character.js');
console.log(Game);
//locations, characters, truths
var game = new Game(1,5, 5)

process.argv.forEach(function (val, index, array) {
  if (val === "--verbose") {
    game.verbose = true
  }
});


game.simulate()
// game.printStatus()
