class Location {
    constructor(game, name) {
      this.game = game
      this.name = name
      this.truths = []
    }
  
    characters() {
      return this.game.characters.filter(character => character.location === this)
    }
  
    toString() {
      return this.name
    }
}
module.exports = {
    Location
}