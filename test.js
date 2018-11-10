const Game = require('./Game.js')
// const Character = require('./Character.js');
console.log(Game);


var game = new Game.Game(10,10, 10)

process.argv.forEach(function (val, index, array) {
  if (val === "--verbose") {
    game.verbose = true
  }
});


game.simulate()
// game.printStatus()
