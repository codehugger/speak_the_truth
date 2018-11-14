const Character = require('./character.js').Character
const Location = require('./location.js').Location
const Weapon = require('./weapon.js').Weapon
const Truth = require('./truth.js').Truth

require('./utils.js')

class Game {
    constructor(location_count=5, character_count=5, weapon_count=5, truth_count=5, options={}) {
        // Init
        this.characters = []
        this.locations = []
        this.weapons = []
        this.truths = []
        this.deadCharacters = []
        this.stepCount = 0
        this.regenerateCharacters = true

        // Override with options
        this.parseOptions(options)

        // Generate locations
        for (let i = 0; i < location_count; i++) {
            this.characters.push(new Character(this))
        }

        // Generate characters
        for (let i = 0; i < character_count; i++) {
            this.locations.push(new Location(this))
        }

        // Generate weapons
        for (let i = 0; i < weapon_count; i++) {
            this.weapons.push(new Weapon(this))
        }

        // Create the truth
        for (let i = 0; i < truth_count; i++) {
            this.truths.push(new Truth(this))
        }

        this.reset()
    }

    /**
     * Reset the simulation
     */
    reset() {
        // Reset the step counter
        this.stepCount = 0

        // Reset locations and characters
        this.characters.forEach(x => x.reset())
        this.locations.forEach(x => x.reset())

        // All characters are now alive
        this.deadCharacters = []

        // Assign characters to random locations
        this.characters.forEach(x => x.location = this.locations.sample())

        // Assign truths randomly to characters and locations
        for (let index = 0; index < this.truths.length; index++) {
            const truth = this.truths[index]
            const prob = Math.random()

            // Assign truth to character or location with probability 0.5
            if (prob < 0.5) {
                this.locations.sample().learnTruth(truth)
            } else {
                this.characters.sample().learnTruth(truth)
            }
        }
    }

    /**
     * Parses options from given object and applies them
     * @param {Object} options options to parse
     */
    parseOptions(options) {
        Object.keys(options).forEach(key=>this[key]=options[key])
    }

    /**
     * Check if a truth has been lost
     */
    truthLost() {
        var self = this
        this.truths.forEach(function(x) {
            var found = false
            self.locations.forEach(function(location) {
                if (location.hasTruth(x)) { found = true; return }
            })
            self.characters.forEach(function(character) {
                if (character.hasTruth(x)) { found = true; return }
            })
            if (!found) { return true }
        })
        return false
    }

    /**
     * Checks if the given character knows the whole truth
     *
     * @param {Character} character the character to check
     */
    knowsTheWholeTruth(character) {
        if (this.truths.length === character.truths.length) {
            return true
        }
        return false
    }

    /**
     * Inspects a character and determines if the character is the only
     * one that knows some truth.
     * @param {Character} character character to inspect
     */
    hasEssentialTruth(character) {
        return this.essentialTruths(character).length > 0
    }

    essentialTruths(character) {
        let truths = []
        for (let index = 0; index < character.truths.length; index++) {
            let truth = character.truths[index]
            let relevantCharacters = this.characters.filter(c=>c.hasTruth(truth))
                                                    .filter(c=>c.alive)
                                                    .filter(c=>c!=character)
            let relevantLocations = this.locations.filter(l=>l.hasTruth(truth))

            if (relevantCharacters.length == 0 &&
                relevantLocations.length == 0) {
                truths.push(truth)
            }
        }
        return truths
    }

    /**
     * A character attack another character and possibly learns a new truth
     * @param {Character} character1 attacker
     * @param {Character} character2 victim
     */
    attack(character1, character2) {
        if (character1 !== character2) {
            let truthsBefore = character1.truths.length
            let newTruth = character2.truths.sample()
            character1.learnTruth(newTruth)
            let truthsAfter = character1.truths.length
            character2.die()
            console.log(`${character1.name} attacks ${character2.name} in the ${character2.location.name} ${truthsBefore < truthsAfter ? `and learns the truth about "${newTruth.name}"` : "but learns nothing new"}`);
            this.deadCharacters.push(character2)
        }
    }

    /**
     * A character talks to another character and possibly learns a new truth
     * @param {Character} character1 initiatior
     * @param {Character} character2 target
     */
    talkTo(character1, character2) {
        if (character1 !== character2) {
            if (character1.likes(character2)) {
                let truthsBefore = character1.truths.length
                let newTruth = character2.truths.sample()
                if (newTruth) {
                    character1.learnTruth(newTruth)
                    let truthsAfter = character1.truths.length
                    console.log(`${character1.name} talks to ${character2.name} in the ${character2.location.name} ${truthsBefore < truthsAfter ? `and learns the truth about "${newTruth.name}"` : "but learns nothing new"}`);
                }
            } else {
                console.log(`${character1.name} tries to talk to ${character2.name} but ${character2.name} refuses to pass on any knowledge`)
            }
        }
    }

    /**
     * A character travels to a new location and possibly learns a new truth
     * @param {Character} character traveller
     * @param {Location} location destination
     */
    travelTo(character, location) {
        if (character.location !== location) {
            let truthsBefore = character.truths.length
            let newTruth = location.truths.sample()
            if (newTruth) {
                character.learnTruth(newTruth)
                let truthsAfter = character.truths.length
                character.location = location
                console.log(`${character.name} goes to the ${location.name} ${truthsBefore < truthsAfter ? `and learns the truth about "${newTruth.name}"` : "but learns nothing new"}`);
            }
        }
    }

    /**
     * A character investigates a given location and possibly learns a new truth
     */
    investigate(character, location) {
        if (character.location === location) {
            let truthsBefore = character.truths.length
            let newTruth = location.truths.sample()
            character.learnTruth(newTruth)
            let truthsAfter = character.truths.length
            console.log(`${character.name} investigates the ${location.name} ${truthsBefore < truthsAfter ? `and learns the truth about "${newTruth.name}"` : "but learns nothing new"}`);
        }
    }

    /**
     * A character wanders off into the unknown
     * @param {Character} character wanderer
     */
    wanderOff(character) {
        console.log(`${character.name} has wandered off into the night.`)
        character.die()
        this.deadCharacters.push(character)
    }

    /**
     * Check if the simulation can continue
     */
    canStep() {
        // Does somebody know the whole truth?
        for (let index = 0; index < this.characters.length; index++) {
            const character = this.characters[index];
            if (this.knowsTheWholeTruth(character)) {
                console.log(`${character.name} has learned the whole truth!`)
                return false
            }
        }

        // Has a truth been lost?
        if (this.truthLost()) { console.log(`A truth has been lost!`); return false }

        // Is everybody dead?
        if (this.characters.filter(x => x.alive) == 0) { console.log(`Everybody is dead!`); return false }

        // Nothing prevents execution
        return true
    }

    /**
     * Execute one step of the simulation
     */
    step() {
        // Return false if simulation is in a termination state
        if (!this.canStep()) { return false }

        // Allow each character (in random order) to perform an action
        let charactersForStep = this.characters.shuffle()
        for (let i = 0; i < charactersForStep.length; i++) {
            const character = charactersForStep[i];

            // Allow a character that is not dead to perform one action
            if (character.alive) {
                character.performAction()
            }

            // Check for winning conditions
            if (this.knowsTheWholeTruth(character)) { break }
        }

        if (this.deadCharacters.length > 0) {
            // Generate new characters if needed to continue the story
            let lostTruths = []

            // Collect lost truths
            for (let i = 0; i < this.deadCharacters; i++) {
                let deadCharacter = this.deadCharacters[i]
                lostTruths.concat(this.essentialTruths(deadCharacter))
            }

            // make sure we don't have any duplicate truths
            lostTruths = lostTruths.distinct()

            console.log("Lost Truths", lostTruths.length)

            if (lostTruths.length > 0) {
                // pick a dead character at random and use as template for new character
                let modelCharacter = this.deadCharacters.sample()
                // Spawn a new character with a mutated personality
                let newCharacter = new Character(this, "", modelCharacter.mutate())
                // Put the new character in a random location
                newCharacter.location = this.locations.sample()
                // Let the character have the essential knowledge
                newCharacter.truths = lostTruths
                // Add the new character to the pool of characters
                this.characters.push(newCharacter)

                console.log(`${newCharacter.name} arrives with essential knowledge of [${newCharacter.truths.map(n=>`"${n.name}"`).join(",")}]`)
            }

            // Reset dead characters
            this.deadCharacters = []
        }
    }

    /**
     * Run simulation until an end condition is met
     */
    run() {
        this.printStateOfTheWorld()
        while (this.canStep() && this.stepCount < 1000) {
            this.stepCount += 1
            console.log(`Round ${this.stepCount}`)
            console.log(`===============================`)
            this.step()
            console.log(`-------------------------------`)
            this.printStateOfTheWorld()
        }
    }

    printStateOfTheWorld() {
        console.log("========== THE WORLD ==========")
        console.log(`The whole truth: [${this.truths.map(x => `"${x.name}"`).join(",")}]`)
        this.locations.forEach(x => console.log(x.toString()))
        this.characters.filter(c=>c.alive).forEach(x => console.log(x.toString()))
        this.weapons.forEach(x=>console.log(x.toString()))
        console.log("===============================")
    }
}

module.exports = { Game }