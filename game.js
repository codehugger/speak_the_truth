const names = require('./Names.js').names

const Character = require('./Character.js').Character
const Location = require('./Location.js').Location

getRandomFromArray = require('./Util.js').getRandomFromArray;
shuffleArray = require('./Util.js').shuffleArray;
getRandomInt = require('./Util.js').getRandomInt;

class Game {
  constructor(location_count=5, character_count=5, truth_count=5) {
    this.locations = []
    this.characters = []
    this.truths = []
    this.simulationCount = 0
    this.truthSayer = null
    this.halted = false
    this.verbose = false

    for (var i = 0; i < location_count; i++) {
      var location = new Location(this, `Location ${i+1}`)
      this.locations.push(location)
    }

    for (var i = 0; i < character_count; i++) {

      let name = `${getRandomFromArray(names)} ${getRandomFromArray(names)}`

      var character = new Character(this, name, getRandomFromArray(this.locations))
      this.characters.push(character)
    }

    for (var i = 0; i < truth_count; i++) {
      this.truths.push(i)

      // hand out the truth
      var character = getRandomFromArray(this.characters)
      character.truths.push(i)

      var location = getRandomFromArray(this.locations)
      location.truths.push(i)
    }
  }

  talk(character1, character2) {
    if (this.verbose) {
      console.log(`${character1.name} talks to ${character2.name}`)
    }

    let probability_to_propogate_truth = 1-character1.similarity(character2) ;

    if(Math.random() > probability_to_propogate_truth){
      this.assignTruthToCharacter(character1, character2.truths, "conversation")
    } else {
      console.log(`${character2.name} Does not like ${character1.name} enough to tell them anything.`);
    }

  }

  attack(character1, character2) {
    if (character1 !== character2) {
      console.log(`${character1.name} attacks ${character2.name}`)
      character2.alive = false
      this.keepTheTruthGoing(character2)
    }
    this.assignTruthToCharacter(character1, character2.truths, "attack")
  }

  travel(character, location) {
    if (this.verbose) {
      console.log(`${character.name} travels to ${location.name}`)
    }
    //this.assignTruthToCharacter(character, location.truths, "travel")
  }

  investigate(character, location) {
    if (this.verbose) {
      console.log(`${character.name} investigates ${location.name}`)
    }
    //this.assignTruthToCharacter(character, location.truths, "investigation")
  }

  wanderOff(character) {
    console.log(`${character.name} has wandered off`)
    character.alive = false
    this.keepTheTruthGoing(character)
  }

  noop(character) {
    if (this.verbose) {
      console.log(`${character.name} does nothing`)
    }
  }

  assignTruthToCharacter(character, truths, context) {
    if (Math.random() < 0.5) {
      var beforeTruthCount = character.truths.length
      character.truths = [...new Set(character.truths.concat(truths))]
      var afterTruthCount = character.truths.length

      if (afterTruthCount > beforeTruthCount) {
        console.log(`${character.name} has learned a new truth through ${context}`)
      }
    }
  }

  keepTheTruthGoing(character) {
    if (character.hasEssentialTruth()) {
      console.log(`${character.name} had essential truth`)
      
      let name = `${getRandomFromArray(names)} ${getRandomFromArray(names)}`

      var replacement = new Character(this, name, getRandomFromArray(this.locations), character.truths, true, character.mutate())
      
      this.characters.push(replacement)
      console.log(`${replacement.name} takes their place`)
    }
  }

  simulate() {
    this.printStatus()

    while (true) {
      if (!this.simulateStep()) {
        break;
      }
    }
  }

  allDead() {
    var allDead = true
    for (var i = this.characters.length - 1; i >= 0; i--) {
      var char = this.characters[i]
      if (char.alive) {
        allDead = false
        break
      }
    }
    return allDead
  }

  printStatus() {
    console.log("===== STATE OF THE WORLD =====")
    for (var i = 0; i < this.characters.length; i++) {
      var char = this.characters[i]
      console.log(`- ${char.toString()}`)
      console.log(`  - knows: ${char.truths}`)
    }
    console.log("---")
    for (var i = 0; i < this.locations.length; i++) {
      var loc = this.locations[i]
      console.log(`- ${loc.toString()}`)
      console.log(`  - knows: ${loc.truths}`)
    }
    console.log("==============================")
  }

  truthLost() {
    var truths = []
    for (var i = this.characters.length - 1; i >= 0; i--) {
      var char = this.characters[i]
      if (char.hasEssentialTruth()) {
        return true
      }
    }
  }

  simulateStep() {
    if (this.halted) {
      console.log(`Simulation halted`)
      return false
    }

    if (this.truthSayer) {
      console.log(`The whole truth has been spoken after ${this.simulationCount} simulations`)
      return false
    }

    if (this.allDead()) {
      console.log(`Everyone is dead`)
      return false
    }

    if (this.truthLost()) {
      console.log(`A truth has been lost`)
      return false
    }

    this.simulationCount += 1

    if (this.verbose) {
      console.log(`Simulation #${this.simulationCount}`)
    }

    var shuffled_characters = shuffleArray(this.characters)

    for (var i = shuffled_characters.length - 1; i >= 0; i--) {
      var currentChar = shuffled_characters[i]

      if (!currentChar.alive) {
        continue
      }

      currentChar.perform_action()

      // check if the current character knows everything
      if (currentChar.truths.length == this.truths.length) {
        console.log(`${currentChar.name} speaks the whole truth`)
        this.truthSayer = currentChar
        break
      }
    }

    if (this.verbose) {
      console.log("==================================================")
    }

    return true
  }

  


}

module.exports = {
  Game
}
