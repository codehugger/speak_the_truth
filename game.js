const names = require('./Names.js').names

const Character = require('./Character.js').Character
const Location = require('./Location.js').Location

const randomGaussian = require('./Util.js').randomGaussian

getRandomFromArray = require('./Util.js').getRandomFromArray;
shuffleArray = require('./Util.js').shuffleArray;
getRandomInt = require('./Util.js').getRandomInt;

class Truth {
  constructor(index, value){
    this.index = index
    this.value = value
  }
  toString(){
    return `{${this.index},${this.value}}`
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

      let name = `${getRandomFromArray(names)} ${getRandomFromArray(names)}`

      var character = new Character(this, name, getRandomFromArray(this.locations))
      this.characters.push(character)
    }

    for (var i = 0; i < truth_count; i++) {

      let foo = (Math.random() > 0.5)? true: false;
      let truth = new Truth(i, foo)//(Math.random()+5*Math.random()+7*Math.random()).toPrecision(3)); 

      this.truths.push(truth)

      // hand out the truth
      var character = getRandomFromArray(this.characters)
      character.setTruth(truth)
      
      //locations will only sometimes have truths. 
      if(Math.random() > 0.5){
        var location = getRandomFromArray(this.locations)
        location.truths[i] = truth
      }

    }
  }

  talk(character1, character2) {
    if (this.verbose) {
      console.log(`${character1.name} talks to ${character2.name}`)
    }

    let probability_to_propogate_truth = 1-character1.similarity(character2) ;

    let val = Math.random();

    if(val > probability_to_propogate_truth){
      console.log(`${character2.name} tells ${character1.name} everything.`);
      
      this.assignTruthToCharacter(character1, character2.truths.map(x=>x.truth), "conversation", character2)
    } 
    else {

      if(val < probability_to_propogate_truth / 4){
        console.log(`${character2.name} hates ${character1.name} enough to lie to them.`);
        //this.assignTruthToCharacter(character1, character2.truths.map(x=>x.value = randomGaussian(x.value, 1)), "lie", character2)
      } else {
        console.log(`${character2.name} Does not like ${character1.name} enough to tell them anything.`);
      }
    }

  }

  /**
   * One character attacks the other.
   * @param {Attacker} character1 
   * @param {Attackee} character2 
   */
  attack(character1, character2) {

    if (character1 !== character2) {
      console.log(`${character1.name} attacks ${character2.name}`)
      character2.alive = false
      this.keepTheTruthGoing(character2)
    }

    this.assignTruthToCharacter(character1, character2.truths.map(x=>x.truth), "attack", character2)
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

  assignTruthToCharacter(character, truths, context, from) {

    character.receiveTruths(truths, from);

    console.log(`${character.name} has learned a new truth through ${context}`)
    console.log(character.truths)
    // if (Math.random() < 0.5) { 
    //   var beforeTruthCount = character.truths.length
    //   character.truths = [...new Set(character.truths.concat(truths))]
    //   var afterTruthCount = character.truths.length
    
    //   if (afterTruthCount > beforeTruthCount) {
      //   }
    // }

  }


  /**
   * Detects if character has a truth that is neccesary to keep the world going.
   * @param {character that's been killed} character 
   */
  keepTheTruthGoing(character) {

    if (character.hasEssentialTruth()) {
      console.log(`${character.name} had essential truth`)
      
      let name = `${getRandomFromArray(names)} ${getRandomFromArray(names)}`
      //create a new character.
      var replacement = new Character(this, name, getRandomFromArray(this.locations), [], true, character.mutate(), false)

      let c_true_truths = character.truths.filter(x=>x.probability === 1).map(x=>x.truth);
      console.log(c_true_truths);
      
      for (let i = 0; i < c_true_truths.length; i++) {
        const element = c_true_truths[i];
        if(element)
          replacement.setTruth(element)
      }

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


  /**
   * Returns true if there is any truth that no alive character knows.
   */
  truthLost() {

    //only characters that are alive may speak truths.
    let chars = this.characters.filter(x=>x.alive)
    
    //for every truth
    for(var i = 0; i < this.truths.length; i++){ 

      const truth = this.truths[i]

      let found =false;
      //loop through characters and find truth that is true. 
      for(var j = 0 ; j < chars.length ; j++){
        
        let c_truth = chars[j].truths[truth.index]
        //if the truth not there then it can't be true
        if(!c_truth){
          continue;
        }
        //we already know that the index is equal. if the value is the same then great.
        if(c_truth.truth.value === truth.value){
          found = true;
          break;
        }

      }
      //if we haven't found a truth in any character, kill the simulation.
      if(!found){
        return true
      }

    }
    //we got through and found all truths in all characters.
    return false;
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
      console.log(`A truth has been lost after ${this.simulationCount} steps`)
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

      let everythingCorrect = true;

      for (let i = 0; i < this.truths.length; i++) {
        const element = this.truths[i];

        if( typeof(currentChar.truths[i]) === 'undefined'){
          everythingCorrect = false;
          break;
        }

        if(element !== currentChar.truths[i].truth){
          
          everythingCorrect = false;
          break;
        }
      }

      if (everythingCorrect) {
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
