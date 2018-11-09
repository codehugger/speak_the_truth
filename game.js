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
  constructor(game, name) {
    this.game = game
    this.name = name
  }

  characters() {
    return game.characters.filter(character => character.location === this)
  }

  toString() {
    return this.name
  }
}

class Character {
  constructor(game, name, location=null, truths=[], alive=true) {
    this.game = game
    this.name = name
    this.location = location
    this.truths = truths
    this.alive = alive
  }

  perform_action() {
    if (!this.alive) {
      return false
    }

    var action = getRandomInt(100)
    var character = getRandomFromArray(this.location.characters())
    var location = getRandomFromArray(this.game.locations)

    if (action == 1) {
      this.game.wanderOff(this)
    }
    else if (action == 2) {
      this.game.attack(this, character)
    }
    else if (action > 2 && action < 10) {
      this.game.talk(this, character)
    }
    else if (action > 10 && action < 20) {
      this.game.travel(this, location)
    }
    else {
      this.game.noop(this)
    }
  }

  toString() {
    return this.name
  }
}

class Game {
  constructor(location_count=5, character_count=5, truth_count=5) {
    this.locations = []
    this.characters = []
    this.truths = []
    this.simulationCount = 0
    this.truthSayer = null

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
    console.log(`${character1.name} talks to ${character2.name}`)
    character1.truths = [...new Set(character1.truths.concat(character2.truths))]
  }

  attack(character1, character2) {
    console.log(`${character1.name} attacks ${character2.name}`)
    character2.alive = false
  }

  travel(character, location) {
    console.log(`${character.name} travels to ${location.name}`)
    character.location = location
  }

  wanderOff(character) {
    console.log(`${character.name} has wandered off`)
  }

  noop(character) {
    console.log(`${character.name} does nothing`)
  }

  simulate() {
    while (true) {
      if (!game.simulateStep()) {
        break;
      }
    }
  }

  simulateStep() {
    if (this.truthSayer) {
      return false
    }

    this.simulationCount += 1

    console.log("Current Status")

    for (var i = 0; i < this.characters.length; i++) {
      var char = this.characters[i]
      console.log(`${char} is at ${char.location} and knows [${char.truths}]`)
    }

    console.log(`Simulation #${this.simulationCount}`)

    var shuffled_characters = shuffleArray(this.characters)

    for (var i = shuffled_characters.length - 1; i >= 0; i--) {
      var currentChar = shuffled_characters[i]

      if (!currentChar.alive) {
        continue
      }

      currentChar.perform_action()

      // check if the current character knows everything
      if (currentChar.truths.length == this.truths.length) {
        console.log(`${currentChar.name} has learned the whole truth`)
        this.truthSayer = currentChar
        break
      }
    }

    console.log("==================================================")

    return true
  }
}

game = new Game()
