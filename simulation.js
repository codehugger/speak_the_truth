#!/usr/bin/env node

const Engine = require('./engine.js').Engine

let everybodyDead = 0
let wholeTruthDiscovered = 0

var program = require('commander')

program
    .version('0.1.0')
    .option('-r, --rooms <n>', 'How many rooms?', 8)
    .option('-c, --characters <n>', 'How many characters?', 8)
    .option('-l, --clues <n>', 'How many clues?', 3)
    .option('-i, --iterations <n>', 'Max iterations in a single simulation', 100)
    .option('-s, --simulations <n>', 'How many simulations?', 1)
    .option('-n, --noneed', 'Turn off need-based character replacement')
    .option('-a, --all', 'Allow the simulation to end in the death of all characters')
    .option('-v, --verbose', 'Verbose output')
    .parse(process.argv)

var engine = new Engine(program.rooms, program.characters, program.clues, false, {
    isSimulation: true,
    verbose: program.verbose ? true : false,
    needBased: !program.noneed,
    allowDeathOfAll: program.all,
    iterations: program.iterations
})

for (let i = 0; i < program.simulations; i++) {
    engine.reset()
    engine.run()

    if (engine.characters.filter(c=>c.alive).length == 0) { everybodyDead += 1 }
    else if (engine.wholeTruthDiscovered) { wholeTruthDiscovered += 1 }
}

console.log('')
console.log('# Summary')
console.log('')
console.log(`## Results`)
console.log('')
if (program.simulations > 1) {
    console.log(`* Simulations: ${program.simulations}`)
    console.log(`* Truth uncovered: ${wholeTruthDiscovered}`)
    console.log(`* Everybody died: ${everybodyDead}`)
    console.log(`* Unresolved: ${program.simulations - wholeTruthDiscovered - everybodyDead}`)
} else {
    console.log(`* Truth uncovered: ${wholeTruthDiscovered > 0 ? "Yes" : "No" }`)
    console.log(`* Everybody died: ${everybodyDead > 0 ? "Yes": "No" }`)
    console.log(`* Unresolved: ${(everybodyDead == 0 && wholeTruthDiscovered == 0) ? "Yes" : "No" }`)
}
console.log('')
console.log(`## Simulation settings`)
console.log('')
console.log(`* Rooms: ${program.rooms}`)
console.log(`* Characters: ${program.characters}`)
console.log(`* Clues: ${program.clues}`)
console.log(`* Max iterations per simulation: ${program.iterations}`)
console.log(`* Need-based character generation: ${!program.noNeed ? 'On' : 'Off'}`)
console.log(`* Allow death of all: ${!!program.all ? 'On' : 'Off'}`)
console.log('')