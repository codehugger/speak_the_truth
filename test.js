const { Character, Location, Game } = require('./game.js')

var game = new Game()

process.argv.forEach(function (val, index, array) {
  if (val === "--verbose") {
    game.verbose = true
  }
});

game.simulate()
