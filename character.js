const names = require('./names.js').characterNames

let characterNames = []

class Character {
    constructor(game, name="") {
        this.game = game
        this.name = (name ? name : names.filter(n=>!characterNames.includes(n)).sample())
        this.alive = true
        this.truths = []
        this.personality = [Math.random(), Math.random(), Math.random(), Math.random()]
        this.actionMemory = []

        // Scale personality so that the sum is 1
        let personalitySum = this.personality.reduce((prev,curr) => prev + curr)
        this.personality = this.personality.map(x => x/personalitySum)

        characterNames.push(this.name)
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

    /**
     * This character's curiosity
     */
    curiosity() {
        return this.personality[2]
    }

    /**
     * This character's intelligence
     */
    intelligence() {
        return this.personality[3]
    }

    /**
     * Reset this character's truths
     */
    reset() {
        this.truths = []
        this.alive = true
    }

    /**
     * Kill this character
     */
    die() {
        this.alive = false
    }

    /**
     * Learn a truth
     * @param {Truth} truth the truth to learn
     */
    learnTruth(truth) {
        if (truth) {
            this.truths.push(truth)
            this.truths = this.truths.distinct()
        }
    }

    /**
     * Verify if the character knows a given truth
     * @param {Truth} truth truth to verify
     */
    hasTruth(truth) {
        this.truths.indexOf(truth) > 0
    }

     /**
      * Returns the similiarity to given character
      * @param {Character} other character to determine similarity from
      */
    similarity(other) {
        // https://en.wikipedia.org/wiki/Cosine_similarity
        let usum = 0;

        for (let i = 0; i < this.personality.length; i++) {
            usum += (other.personality[i] * this.personality[i]);
        }

        let mySum = this.personality.reduce((x,y) => x + (y*y) )
        let theirSum = other.personality.reduce((x,y) => x + (y*y) )

        return usum / (Math.sqrt(mySum)*Math.sqrt(theirSum));
    }

    /**
     * Return true or false based on the given threshold of similarity
     * @param {Character} other character to determine if we like
     */
    likes(other, threshold=0.2) {
        if (this.similarity(other) > threshold) { return true }
        return false
    }

    /**
     * Attack a given character
     * @param {Character} character victim of the attack
     */
    attack(character) {
        this.game.attack(this, character)
    }

    /**
     * Talk to given character
     * @param {Character} character target for conversation
     */
    talkTo(character) {
        this.game.talkTo(this, character)
    }

    /**
     * Travel to given destiation location
     * @param {Location} location destination
     */
    travelTo(location) {
        this.game.travelTo(this, location)
    }

    /**
     * Investigate the current location
     */
    investigate() {
        this.game.investigate(this, this.location)
    }

    /**
     * Wander off into the unknown
     */
    wanderOff() {
        this.game.wanderOff(this)
    }

    /**
     * Perform an action based on this character's personality
     */
    performAction() {
        let action = Math.random()

        // There is always a 1% chance of the character wandering off
        if (action < 0.01) {
            this.wanderOff()
        }
        else {
            // Select another character to interact with
            let character = this.game.characters.filter(x => x !== this).sample()

            // Select a location to interact with
            let location = this.game.locations.filter(x => x !== this.location).sample()

            // console.log(action, character.personality, this.aggression() + this.charisma() + this.curiosity());

            // Personality profile probability
            if (action < this.aggression()) {
                // Attack somebody unless the character is alone
                if (character) { this.attack(character) }
            } else if (action < (this.aggression() + this.charisma())) {
                // Talk to somebody unless the character is alone
                if (character) { this.talkTo(character) }
            } else if (action < (this.aggression() + this.charisma() + this.curiosity())) {
                // Explore a new location if any are available
                if (location) { this.travelTo(location) }
            } else {
                // Investigate the current location
                this.investigate()
            }
        }
    }

    toString() {
        return `Character name: ${this.name}, personality: [${this.personality.map(x => x.toFixed(2)).join(",")}], truths: [${this.truths.map(x => `"${x.name}"`).join(",")}]`
    }
}

module.exports = { Character }