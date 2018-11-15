require('./utils.js')

let truthNames = []

class Truth {
    constructor(game, name="") {
        this.game = game
        // A truth is something already present in the game
        let availableNames = [this.game.characters, this.game.locations, this.game.weapons].sample()
        this.name = (name ? name : availableNames.filter(n=>!truthNames.includes(n.name)).sample().name)

        truthNames.push(this.name)

        console.log(truthNames)
    }

    toString() {
        return `Truth name: "${this.name}"`
    }
}

module.exports = { Truth }