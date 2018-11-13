const names = require('./names.js').weaponNames

class Weapon {
    constructor(game, name) {
        this.game = game
        this.name = names.sample()
    }

    toString() {
        return `Weapon name: ${this.name}`
    }
}

module.exports = { Weapon }