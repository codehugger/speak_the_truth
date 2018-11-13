const names = require('./names.js').characterNames

class Character {
    constructor(game, name="") {
        this.game = game
        this.name = (name ? name : names.sample())
        this.alive = true
        this.truths = []
        this.personality = [Math.random(), Math.random(), Math.random(), Math.random()]
        this.actionMemory = []

        // Scale personality so that the sum is 1
        let personalitySum = this.personality.reduce((prev,curr) => prev + curr)
        this.personality = this.personality.map(x => x/personalitySum)
    }

    /**
     * This character's aggression
     */
    aggression() {
        return this.personality[0]
    }

    /**
     * This character's charisma
     */
    charisma() {
        return this.personality[1]
    }

    toString() {
        return `Character name: ${this.name}, personality: [${this.personality.map(x => x.toFixed(2)).join(",")}], truths: [${this.truths.map(x => `"${x.name}"`).join(",")}]`
    }
}

module.exports = { Character }