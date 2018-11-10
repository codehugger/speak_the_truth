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
      var character = new Character(this, `Character ${i+1}`, getRandomFromArray(this.locations))
      this.characters.push(character)
    }

    for (var i = 0; i < truth_count; i++) {
      this.truths.push(i)

      // hand out the truth
      var character = getRandomFromArray(this.characters)
      character.truths.push(i)
    }
  }

  talk(character1, character2) {
    if (this.verbose) {
      console.log(`${character1.name} talks to ${character2.name}`)
    }
    character1.truths = [...new Set(character1.truths.concat(character2.truths))]
  }

  attack(character1, character2) {
    if (character1 !== character2) {
      console.log(`${character1.name} attacks ${character2.name}`)
      character2.alive = false
      this.keepTheTruthGoing(character2)
    }
  }

  travel(character, location) {
    if (this.verbose) {
      console.log(`${character.name} travels to ${location.name}`)
    }
    character.location = location
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

  keepTheTruthGoing(character) {
    if (character.hasEssentialTruth()) {
      console.log(`${character.name} had essential truth`)
      var replacement = new Character(this, `Character ${this.characters.length+1}`, getRandomFromArray(this.locations), character.truths)
      this.characters.push(replacement)
      console.log(`${replacement.name} takes his place`)
    }
  }

  simulate() {
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
      console.log("Current Status")
    }

    for (var i = 0; i < this.characters.length; i++) {
      var char = this.characters[i]
      if (this.verbose) {
        if (char.alive) {
          console.log(`${char} is at ${char.location} and knows [${char.truths}]`)
        } else {
          console.log(`${char} is dead`)
        }
      }
    }

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
