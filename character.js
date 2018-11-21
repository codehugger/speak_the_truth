const randomGaussian = require('./utils.js').randomGaussian
const names = require('./names.js').characterNames

let characterNames = []

class Character {
    constructor(engine, name="", personality=[]) {
        this.engine = engine
        this.name = (name ? name : names.filter(n=>!characterNames.includes(n)).sample())
        this.alive = true
        this.truths = []
        this.actionMemory = []

        // Locations visited
        this.locationsVisited = []

        // Locations investigated
        this.locationsInvestigated = []

        // Characters spoken to
        this.charactersSpokenTo = []

        // Characters attacked
        this.charactersAttacked = []

        if (personality.empty) {
            this.personality = [Math.random(),
                                Math.random(),
                                Math.random(),
                                Math.random()]
        }

        // Personality = 1
        let personalitySum = this.personality.reduce((x,y)=>x+y)
        this.personality = this.personality.map((x)=>x/personalitySum)

        this.peopleSkills = (this.personality[0] + this.personality[1])
        this.worldSkills = (this.personality[2] + this.personality[3])

        // Record the name used so that we don't use it again
        characterNames.push(this.name)

        // Reset the characterNames when they have been used up
        if (characterNames.length = names.length) { characterNames = [] }
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
        this.charactersAttacked = []
        this.charactersSpokenTo = []
        this.locationsVisited = []
        this.locationsInvestigated = []
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
        this.truths.includes(truth)
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
     * Returns a normalized vector similar but not equivalent
     * to this characters vector.
     */
    mutate(){
        let newPersonality = []
        let std = 0.5
        this.personality.forEach(function(p) {
            newPersonality.push(Math.max(0, Math.min(1, randomGaussian(p, std))))
        });
        return newPersonality;
    }

    /**
     * Attack a given character
     * @param {Character} character victim of the attack
     */
    attack(character) {
        this.engine.attack(this, character)
        this.charactersSpokenTo.push(character)
    }

    /**
     * Talk to given character
     * @param {Character} character target for conversation
     */
    talkTo(character) {
        this.engine.talkTo(this, character)
        this.charactersSpokenTo.push(character)
    }

    /**
     * Travel to given destiation location
     * @param {Location} location destination
     */
    travelTo(location) {
        this.engine.travelTo(this, location)
        this.locationsVisited.push(location)
    }

    /**
     * Investigate the current location
     */
    investigate() {
        this.engine.investigate(this, this.location)
        this.locationsInvestigated.push(this.location)
    }

    /**
     * Wander off into the unknown
     */
    wanderOff() {
        this.engine.wanderOff(this)
    }

    /**
     * Perform an action based on this character's personality
     */
    performAction() {
        // Random action parameter
        let action = Math.random()
        let noop = Math.random()

        // Depending on difficulty level there is a chance
        // that a character might stand around and do nothing
        // easy: 50% chance, normal: 25% chance, hard: 12.5%
        if (this.engine.difficulty == 'easy' && noop < 0.5) {
            return false
        } else if (this.engine.difficulty == 'normal' && noop < 0.25) {
            return false
        } else if (this.engine.difficulty == 'hard' && noop < 0.125) {
            return false
        }

        // There is always a 1% chance that the character wanders
        if (action < 0.001) {
            this.wanderOff()
        } else {
            // Select another character to interact with
            let character = this.engine.availableCharacters(this).sample()

            // Select a location to interact with
            let location = this.engine.availableLocations(this).sample()

            // People skills only apply when there is a character nearby
            if (character && action < this.peopleSkills) {
                let scaledAction = action * (this.aggression() + this.charisma())

                if (scaledAction < this.aggression()) {
                    // Attack another character
                    this.attack(character)
                } else {
                    // Talk to a character
                    this.talkTo(character)
                }
            } else {
                let scaledAction = action * (this.curiosity() + this.intelligence())

                if (scaledAction < this.curiosity()) {
                    // Explore a new location if any are available
                    this.travelTo(location)
                } else {
                    // Investigate the current location
                    this.investigate()
                }
            }
        }
        return true
    }

    toString() {
        return `Character name: ${this.name}, ` +
               `personality: [${this.personality.map(x => x.toFixed(2)).join(",")}], ` +
               `truths: [${this.truths.map(x => `"${x.name}"`).join(",")}], ` +
               `location: ${this.location ? this.location.name : ""}`
    }
}

module.exports = { Character }