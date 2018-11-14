const names = require('./names.js').weaponNames

let weaponNames = []

class Weapon {
    constructor(game, name) {
        this.game = game
        this.name = names.filter(n=>!weaponNames.includes(n)).sample()

        weaponNames.push(this.name)
    }

    toString() {
        return `Weapon name: ${this.name}`
    }
}

module.exports = { Weapon }