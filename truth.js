require('./utils.js')

let truthNames = []

class Truth {
    constructor(engine, name="") {
        this.engine = engine
        // A truth is something already present in the engine
        let availableNames = [this.engine.characters, this.engine.locations, this.engine.weapons].sample()
        this.name = (name ? name : availableNames.filter(n=>!truthNames.includes(n.name)).sample().name)

        truthNames.push(this.name)
    }

    toString() {
        return `Truth name: "${this.name}"`
    }
}

module.exports = { Truth }