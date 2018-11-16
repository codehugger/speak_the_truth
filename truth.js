require('./utils.js')

let truthNames = []
let characterCount = 0
let locationCount = 0
let weaponCount = 0

class Truth {
    constructor(engine, name="") {
        this.engine = engine
        // A truth is something already present in the engine
        let availableNames = [this.engine.characters, this.engine.locations, this.engine.weapons].sample()

        // Available names override to make sure we have at least one of each location, character, weapon
        if (locationCount == 0) {
            availableNames = this.engine.locations
        } else if (characterCount == 0) {
            availableNames = this.engine.characters
        } else if (weaponCount == 0) {
            availableNames = this.engine.weapons
        }

        // Choose one object at random which has not already been used
        let chosenObject = availableNames.filter(n=>!truthNames.includes(n.name)).sample()

        if (chosenObject.constructor.name == 'Character') {
            characterCount += 1
        } else if (chosenObject.constructor.name == 'Location') {
            locationCount += 1
        } else if (chosenObject.constructor.name == 'Weapon') {
            weaponCount += 1
        }

        this.name = (name ? name : chosenObject.name)

        truthNames.push(this.name)
    }

    toString() {
        return `Truth name: "${this.name}"`
    }
}

module.exports = { Truth }