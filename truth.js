require('./utils.js')

class Truth {
    constructor(game, name="") {
        this.game = game
        // A truth is something already present in the game
        this.name = (name ? name : [this.game.characters, this.game.locations, this.game.weapons].sample().sample().name)
    }

    toString() {
        return `Truth name: "${this.name}"`
    }
}

module.exports = { Truth }