const Game = require('./Game.js').Game

var game = new Game(6, 8, 8, 3)

let everybodyDead = 0
let wholeTruthDiscovered = 0

for (let i = 0; i < 100; i++) {
    game.reset()
    game.run()

    if (game.characters.filter(c=>c.alive).length == 0) { everybodyDead += 1 }
    else if (game.wholeTruthDiscovered) { wholeTruthDiscovered += 1 }
}

console.log('Everybody Dead:', everybodyDead)
console.log('Whole truth discovered:', wholeTruthDiscovered)