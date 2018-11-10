
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
      return this.name
    }
}

module.exports = { Character }