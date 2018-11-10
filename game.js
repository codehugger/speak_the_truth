function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getRandomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function shuffleArray(array) {
  var new_array = array.slice()
  var currentIndex = new_array.length;
  var temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = new_array[currentIndex];
    new_array[currentIndex] = new_array[randomIndex];
    new_array[randomIndex] = temporaryValue;
  }

  return new_array;
}

class Location {
  constructor(game, name, truths=[]) {
    this.game = game
    this.name = name
    this.truths = truths
  }

  characters() {
    return this.game.characters.filter(character => character.location === this)
  }

  toString() {
    return this.name
  }
}

class Character {
  constructor(game, name, location=null, truths=[], alive=true, personality=[]) {
    this.game = game
    this.name = name
    this.location = location
    this.truths = truths
    this.alive = alive

    if (personality.length == 4) {
      this.aggression = personality[0]
      this.curiosity = personality[1]
      this.charisma = personality[2]
      this.intelligence = personality[3]
    } else {
      this.aggression = Math.random()
      this.curiosity = Math.random()
      this.charisma = Math.random()
      this.intelligence = Math.random()
    }

    // aggression + curiosity + charisma + intelligence == 1
    var total = this.aggression + this.curiosity + this.charisma + this.intelligence
    this.aggression = (this.aggression/total)
    this.curiosity = (this.curiosity/total)
    this.charisma = (this.charisma/total)
    this.intelligence = (this.intelligence/total)
  }

  perform_action() {
    // dead men do nothing ... for now
    if (!this.alive) {
      return false
    }

    var noop = Math.random()
    var action = Math.random()
    var character = getRandomFromArray(this.location.characters())
    var location = getRandomFromArray(this.game.locations)

    if (noop < 0.5) {
      this.game.noop(this)
    }
    else if (action < 0.01) {
      this.game.wanderOff(this)
    }
    // controlled by aggression
    else if (action < (this.aggression)) {
      this.game.attack(this, character)
    }
    // controlled by charisma
    else if (action < (this.aggression + this.charisma)) {
      this.game.talk(this, character)
    }
    // controlled by curiosity
    else if (action < (this.aggression + this.charisma + this.curiosity)) {
      this.game.travel(this, location)
    }
    // controlled by intelligence
    else if (action < 1.0) {
      this.game.investigate(this, this.location)
    }
  }

  hasEssentialTruth() {
    for (var i = this.truths.length - 1; i >= 0; i--) {
      var truth = this.truths[i]
      var found = false
      for (var j = this.game.characters.length - 1; j >= 0; j--) {
        var char = this.game.characters[j]
        if (char.alive && char.truths.includes(truth)) {
          found = true
          break
        }
      }

      if (!found) {
        return true
      }
    }
    return false
  }

  toString() {
    return `${this.name} (${this.aggression.toFixed(2)}, ${this.curiosity.toFixed(2)}, ${this.charisma.toFixed(2)}, ${this.intelligence.toFixed(2)})`
  }
}

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

      var location = getRandomFromArray(this.locations)
      location.truths.push(i)
    }
  }

  talk(character1, character2) {
    if (this.verbose) {
      console.log(`${character1.name} talks to ${character2.name}`)
    }
    this.assignTruthToCharacter(character1, character2.truths, "conversation")
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
    this.assignTruthToCharacter(character, location.truths, "travel")
  }

  investigate(character, location) {
    if (this.verbose) {
      console.log(`${character.name} investigates ${location.name}`)
    }
    this.assignTruthToCharacter(character, location.truths, "investigation")
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
      var replacement = new Character(this, `Character ${this.characters.length+1}`, getRandomFromArray(this.locations), character.truths)
      this.characters.push(replacement)
      console.log(`${replacement.name} takes his place`)
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
  Character,
  Location,
  Game
}
