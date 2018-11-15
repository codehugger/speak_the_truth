const Engine = require('./Engine.js').Engine

var engine = new Engine(6, 8, 8, 3)

let everybodyDead = 0
let wholeTruthDiscovered = 0

for (let i = 0; i < 100; i++) {
    engine.reset()
    engine.run()

    if (engine.characters.filter(c=>c.alive).length == 0) { everybodyDead += 1 }
    else if (engine.wholeTruthDiscovered) { wholeTruthDiscovered += 1 }
}

console.log('Everybody Dead:', everybodyDead)
console.log('Whole truth discovered:', wholeTruthDiscovered)