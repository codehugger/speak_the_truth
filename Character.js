const randomGaussian = require('./Util.js').randomGaussian


class Character {
    constructor(game, name, location=null, truths=[], alive=true, personality=[], inert=false) {
      this.game = game
      this.name = name
      this.location = location
      this.truths = truths
      this.alive = alive
      //inert means that this character will not 
      //try to use his personality to select actions
      this.inert = inert
      
      if (personality.length == 4) {
        this.personality = personality;
        this.aggression = personality[0]
        this.curiosity = personality[1]
        this.charisma = personality[2]
        this.intelligence = personality[3]
      } else {
        this.aggression = Math.random()
        this.curiosity = Math.random()
        this.charisma = Math.random()
        this.intelligence = Math.random()
        
        this.personality = [
            this.aggression,
            this.curiosity,
            this.charisma,
            this.intelligence
        ]

      }
      
      let sum = this.personality.reduce((x, y)=>x+y)
      this.personality = this.personality.map(x=>x/sum);

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

    /**
     * Returns a normalized vector similar but not equivalent
     * to this characters vector.
     */
    mutate(){
        let newPersonality = []
        let std = 0.5 
        this.personality.forEach(p => {
            newPersonality.push(

                Math.max(0, Math.min(1, randomGaussian(p, std)))

            )
        });
        console.log(`${this.name} Has been mutated!
                    ${this.personality}
                    ${newPersonality}`);


        return newPersonality;
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

module.exports = { Character }


