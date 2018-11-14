const Character = require('./character.js').Character
const Location = require('./location.js').Location
const Weapon = require('./weapon.js').Weapon
const Truth = require('./truth.js').Truth

require('./utils.js')

class Game {
    constructor(location_count=5, character_count=5, truth_count=5, weapon_count=5) {
        // Init
        this.characters = []
        this.locations = []
        this.weapons = []
        this.truths = []
        this.stepCount = 0

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

        // Generate truths
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
            console.log(`${character1.name} attacks ${character2.name} and learns ${truthsBefore < truthsAfter ? `the truth about "${newTruth.name}"` : "nothing new"}`);
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
                    console.log(`${character1.name} talks to ${character2.name} and learns ${truthsBefore < truthsAfter ? `the truth about "${newTruth.name}"` : "nothing new"}`);
                }
            } else {
                console.log(`${character1.name} does not like ${character2.name} enough to learn anything from conversation`)
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
                console.log(`${character.name} goes to the ${location.name} and learns ${truthsBefore < truthsAfter ? `the truth about "${newTruth.name}"` : "nothing new"}`);
            }

        }
    }

    /**
     * A character investigates a given location and possibly learns a new truth
     */
    investigate(character, location) {
        if (character.location === location) {
            let truthsBefore = character.truths.count
            let newTruth = location.truths.sample()
            character.learnTruth(newTruth)
            let truthsAfter = character.truths.count
            console.log(`${character.name} investigates ${location.name} and learns ${truthsBefore < truthsAfter ? `the truth about "${newTruth.name}"` : "nothing new"}`);
        }
    }

    /**
     * A character wanders off into the unknown
     * @param {Character} character wanderer
     */
    wanderOff(character) {
        // character.die()
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
        for (let index = 0; index < charactersForStep.length; index++) {
            const character = charactersForStep[index];

            // Allow a character to perform one action
            character.performAction()

            // Check for winning conditions
            if (this.knowsTheWholeTruth(character)) { break }
        }
    }

    /**
     * Run simulation until an end condition is met
     */
    run() {
        this.printStateOfTheWorld()
        while (this.canStep() && this.stepCount < 200) {
            this.stepCount += 1
            console.log(`Round ${this.stepCount}`)
            console.log(`===============================`)
            this.step()
            console.log(`-------------------------------`)
        }
        this.printStateOfTheWorld()
    }

    printStateOfTheWorld() {
        console.log("========== THE WORLD ==========")
        console.log(`The whole truth: [${this.truths.map(x => `"${x.name}"`).join(",")}]`)
        this.locations.forEach(x => console.log(x.toString()))
        this.characters.forEach(x => console.log(x.toString()))
        this.weapons.forEach(x=>console.log(x.toString()))
        console.log("===============================")
    }
}

module.exports = { Game }