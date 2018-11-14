require('./utils.js')

let truthNames = []

class Truth {
    constructor(game, name="") {
        this.game = game
        // A truth is something already present in the game
        let availableNames = [this.game.characters, this.game.locations, this.game.weapons]
        this.name = (name ? name : availableNames.sample().filter(n=>truthNames.indexOf(n)).sample().name)

        truthNames.push(this.name)
    }

    toString() {
        return `Truth name: "${this.name}"`
    }
}

module.exports = { Truth }