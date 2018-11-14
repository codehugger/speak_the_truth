const names = require('./names.js').locationNames

let locationNames = []

class Location {
    constructor(game, name="") {
        this.game = game
        this.name = (name ? name : names.filter(n=>!locationNames.includes(n)).sample())
        this.truths = []

        locationNames.push(this.name)
    }

    /**
     * Reset this location's truths
     */
    reset() {
        this.truths = []
    }

    /**
     * Learn a truth
     *
     * @param {Truth} truth
     */
    learnTruth(truth) {
        if (truth) {
            this.truths.push(truth)
            this.truths = this.truths.distinct()
        }
    }

    /**
     * Verify if the location knows a given truth
     * @param {Truth} truth truth to verify
     */
    hasTruth(truth) {
        this.truths.indexOf(truth) > 0
    }

    toString() {
        return `Location name: ${this.name}, truths: [${this.truths.map(x => `"${x.name}"`).join(",")}]`
    }
}

module.exports = { Location }