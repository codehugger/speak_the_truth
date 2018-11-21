const Character = require('./character.js').Character
const Location = require('./location.js').Location
const Weapon = require('./weapon.js').Weapon
const Truth = require('./truth.js').Truth

require('./utils.js')

class Engine {
    constructor(location_count=5, character_count=5, truth_count=5, player=false, options={}) {
        // Init
        this.characters = []
        this.locations = []
        this.weapons = []
        this.truths = []
        this.deadCharacters = []
        this.stepCount = 0
        this.needBased = true
        this.wholeTruthDiscovered = false
        this.isSimulation = false
        this.allowDeathOfAll = false
        this.iterations = 100
        this.diffculty = 'easy'

        if (player) {
            this.player = new Character(this, "Detective Legrasse")
        }

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
        for (let i = 0; i < 8; i++) {
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
        if (this.player) { this.player.reset() }
        this.characters.forEach(x => x.reset())
        this.locations.forEach(x => x.reset())

        // All characters are now alive
        this.deadCharacters = []

        // Assign characters to random locations
        this.characters.forEach(c => { c.location = this.locations.sample(); c.locationsVisited.push(c.location) })

        // Assign location and initial parameters to player
        if (this.player) {
            this.player.location = this.locations.sample();
            this.player.locationsVisited.push(this.player.location);
            this.characters.filter(c=>c.location==this.player.location).forEach(c=>this.player.charactersEncountered.push(c))
        }

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

    /**
     * Extract relevant truths (that no one else has) from the given character
     * @param {Character} character character who holds the truths
     */
    essentialTruths(character) {
        let truths = []
        for (let index = 0; index < character.truths.length; index++) {
            let truth = character.truths[index]
            let relevantCharacters = this.characters.filter(c=>c.alive)
                                                    .filter(c=>c!=character)
                                                    .filter(c=>c.hasTruth(truth))
            let relevantLocations = this.locations.filter(l=>l.hasTruth(truth))

            if (relevantCharacters.length == 0 &&
                relevantLocations.length == 0) {
                truths.push(truth)
            }
        }
        return truths
    }

    /**
     * Returns a list of characters available to the given character for interaction
     * @param {Character} character character to search for
     */
    availableCharacters(character) {
        return this.characters.filter(c=>c!==character)                    // Not the same as the given character
                              .filter(c=>c.alive)                          // Only characters that are alive
                              .filter(c=>c.location===character.location)  // At the same location
    }

    /**
     * Returns a list of locations available to the given character for travel
     * @param {Character} character character to search for
     */
    availableLocations(character) {
        return this.locations.filter(l=>l!=character.location)            // Don't include the characters current location
    }

    /**
     * Returns a list of available player actions
     */
    playerAvailableActions() {
        let availableActions = []
        if (this.playerAvailableCharacters().length !== 0) {
            availableActions.push('Attack', 'Talk')
        }
        availableActions.push('Investigate', 'Explore')
        return availableActions
    }

    /**
     * Returns a list of locations available to the player for travel
     */
    playerAvailableLocations() {
        return this.availableLocations(this.player)
    }

    /**
     * Returns a list of characters available to the player for interaction
     */
    playerAvailableCharacters() {
        return this.availableCharacters(this.player)
    }

    /**
     * Move the player character to a given location
     * @param {Location} location destination location for the player
     */
    playerTravelTo(locationName) {
        let location = this.locations.find(l=>l.name == locationName)

        // Learn a truth at the location at random
        let truthsBefore = this.player.truths.length
        let newTruth = location.truths.sample()
        this.player.learnTruth(newTruth)
        let truthsAfter = this.player.truths.length

        console.log(`You go to the ${locationName}`)

        if (truthsBefore < truthsAfter) {
            console.log(`As you enter the ${locationName} you discover a clue "${newTruth.name}"`)
        }

        // Update the player's location
        this.player.location = location

        // Keep track of locations visited
        this.player.locationsVisited.push(location)

        // Keep track of the people seen at the location
        this.characters.filter(c=>c.location==location).forEach(c=>this.meets(this.player, c))
    }

    /**
     * Player attacks a character
     * @param {Character} character the character being attacked
     */
    playerAttack(characterName) {
        let character = this.characters.find(c=>c.name == characterName)
        if (character != this.player) {
            // Learn a truth from the victim at random
            let truthsBefore = this.player.truths.length
            let newTruth = character.truths.sample()
            this.player.learnTruth(newTruth)
            let truthsAfter = this.player.truths.length

            // Kill the character and add to the deathpool
            character.die()
            this.deadCharacters.push(character)

            console.log(`You attack ${character.name} in a violent attempt to get at the truth ` +
                        `${truthsBefore < truthsAfter ? `and learn about "${newTruth.name}"` : "but learn nothing of importance"}`)
            console.log(`${character.name} is knocked unconcious`)
        }

        this.player.charactersAttacked.push(character)
        this.player.charactersDead.push(character)
    }

    /**
     * Player talks to a given character
     * @param {Character} character the character being talked to
     */
    playerTalkTo(characterName) {
        let character = this.characters.find(c=>c.name == characterName)

        // TODO: since the player has no way to improve his stats this needs to work differently
        if (this.player.likes(character)) {
            // Learn the truth from given character at random
            let truthsBefore = this.player.truths.length
            let newTruth = character.truths.sample()
            this.player.learnTruth(newTruth)
            let truthsAfter = this.player.truths.length

            console.log(`You talk to ${character.name} ` +
                        `${truthsBefore < truthsAfter ?
                            `and learn about "${newTruth.name}"` :
                            "but learn nothing of importance"}`)
        } else {
            console.log(`${character.name} refuses to talk to you`)
        }

        // Keep track of which characters the player has spoken to
        this.player.charactersSpokenTo.push(character)
    }

    /**
     * Player investigates the location he is in
     */
    playerInvestigate() {
        // Learn a truth at random from the investigated location
        let truthsBefore = this.player.truths.length
        let newTruth = this.player.location.truths.sample()
        this.player.learnTruth(newTruth)
        let truthsAfter = this.player.truths.length

        console.log(`You investigate the ${this.player.location.name} ` +
                    `${truthsBefore < truthsAfter ? `and discover a clue "${newTruth.name}"` :
                                                    "but learng nothing of importance"}`)

        // Keep track of the locations the player has visited
        this.player.locationsInvestigated.push(this.player.location)
    }

    /**
     * Prints the knowledge the player has
     */
    playerPrintKnowledge(debug=false) {
        console.log('People encountered:', this.player.charactersEncountered.distinct().map(c=>c.name).join(", "))
        console.log('People inteviewed:', this.player.charactersSpokenTo.distinct().map(c=>c.name).join(", "))
        console.log('People attacked:', this.player.charactersAttacked.distinct().map(c=>c.name).join(", "))
        console.log('People unconcious:', this.player.charactersDead.distinct().map(c=>c.name).join(", "))
        console.log('Locations visited:', this.player.locationsVisited.distinct().map(l=>l.name).join(", "))
        console.log('Locations investigated:', this.player.locationsInvestigated.distinct().map(l=>l.name).join(", "))
        console.log('Truths revealed:', this.player.truths.distinct().map(t=>`"${t.name}"`).join(", "))

        if (debug) {
            console.log('Whole truth:', this.truths.map(t=>t.name))
            this.characters.filter(c=>c.alive).forEach(c=>console.log(c.toString()))
            this.locations.forEach(l=>console.log(l.toString()))
        }
    }

    /**
     * Solves the mystery by assigning all the truths to the player
     */
    playerSolve() {
        this.player.truths = this.truths
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
            this.printAction(
                `${character1.name} attacks ${character2.name} in the ${character2.location.name}` +
                `${truthsBefore < truthsAfter ?
                    `and learns about "${newTruth.name}"` :
                    "but learns nothing of importance"
                }`)

            this.deadCharacters.push(character2)

            if (this.player) {
                // If the player is in the location print that there has been an attack
                this.printAction(`${character1.name} attacks ${character2.name}`
                , character1.location == this.player.location)

                this.printAction(`${character2.name} is now unconcious on the floor`
                , character1.location == this.player.location)

                // If the player is not at the attack location print out scream
                this.printAction(`You here a terrible scream from the ${character1.location.name}`
                , character1.location != this.player.location)

                this.printAction(`The butler comes running to you and says: "Detective, ${character2.name} has just been attacked!"`
                , character1.location != this.player.location)

                if (this.hasEssentialTruth(character2)) {
                    this.printAction(`He continues: "I believe ${character2.name} had just discovered something really important!"`
                    , character1.location != this.player.location)
                }
            }
        }

        this.characters.forEach(c=>c.charactersDead.push(character2))
        if (this.player) { this.player.charactersDead.push(character2) }
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
                    this.printAction(
                        `${character1.name} talks to ${character2.name} in the ${character2.location.name} ` +
                        `${truthsBefore < truthsAfter ?
                            `and learns about "${newTruth.name}"` : "but learns nothing of importance"}`
                        )
                    if (this.player) {
                        this.printAction(
                            `${character1.name} talks to ${character2.name} but you can't hear what they're saying.`
                        , character1.location == this.player.location)
                    }
                }
            } else {
                this.printAction(
                    `${character1.name} tries to talk to ${character2.name} but ${character2.name} refuses to pass on any knowledge`)
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
            character.learnTruth(newTruth)
            let truthsAfter = character.truths.length

            this.printAction(
                `${character.name} goes to the ${location.name} ` +
                `${truthsBefore < truthsAfter ?
                    `and learns about "${newTruth.name}"` :
                    "but learns nothing of importance"}`)

            if (this.player) {
                this.printAction(
                    `${character.name} arrives at the location`
                , location == this.player.location)

                this.printAction(
                    `${character.name} leaves the location`
                , character.location == this.player.location)
            }

            character.location = location

            // Records the meetings of the characters
            this.characters.filter(c=>c.location==location).forEach(c=>this.meets(character, c))
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
            this.printAction(
                `${character.name} investigates the ${location.name} ` +
                `${truthsBefore < truthsAfter ?
                    `and learns about "${newTruth.name}"` :
                    "but learns nothing of importance"}`)

            if (this.player) {
                this.printAction(
                    `${character.name} is having a look around.`
                , location == this.player.location)
            }
        }
    }

    /**
     * A character wanders off into the unknown
     * @param {Character} character wanderer
     */
    wanderOff(character) {
        this.printAction(`${character.name} has wandered off into the night.`)

        if (this.player) {
            console.log(`You hear the sound of a car arriving outside. You look quickly outside and manage to catch a glimpse of ${name} stepping into a car and driving off.`)
        }

        character.die()
        this.deadCharacters.push(character)
    }

    /**
     * Records the meeting of two characters
     * @param {Character} character1 character that encounters
     * @param {Character} character2 characters that is encounted
     */
    meets(character1, character2) {
        character1.charactersEncountered = character1.charactersEncountered.concat([character2]).distinct()
        character2.charactersEncountered = character2.charactersEncountered.concat([character1]).distinct()
    }

    /**
     * Check if the simulation can continue
     */
    canStep() {
        // Does somebody know the whole truth?
        if (this.knowsTheWholeTruth(this.player)) {
            console.log(`Congratulations! You have uncovered enough evidence to press charges.`)
            console.log(`Location(s): ${this.player.truths.filter(t=>t.isLocation()).map(t=>t.name).join(', ')}`)
            console.log(`Suspect(s): ${this.player.truths.filter(t=>t.isCharacter()).map(t=>t.name).join(', ')}`)
            console.log(`Weapon(s): ${this.player.truths.filter(t=>t.isWeapon()).map(t=>t.name).join(', ')}`)
            return false
        }

        for (let index = 0; index < this.characters.length; index++) {
            const character = this.characters[index]
            if (this.knowsTheWholeTruth(character)) {
                this.printAction(`${character.name} has learned the whole truth!`)
                if (this.player) {
                    console.log(`${character.name} has learned truth and is now speaking to the press!`)
                }
                return false
            }
        }

        // Has a truth been lost?
        if (this.truthLost()) { this.printAction(`A truth has been lost!`); return false }

        // Is everybody dead?
        if (this.characters.filter(x => x.alive) == 0 && !this.player) { this.printAction(`Everybody is dead!`); return false }

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
            const character = charactersForStep[i]

            // Allow a character that is not dead to perform one action
            if (character.alive) {
                character.performAction()
            }

            // Check for winning conditions
            if (this.knowsTheWholeTruth(character)) { this.wholeTruthDiscovered = true; break }
        }

        // Handle dead characters
        if (this.deadCharacters.length > 0) {
            // Generate new characters if needed to continue the story
            let lostTruths = []

            // Collect lost truths
            for (let i = 0; i < this.deadCharacters.length; i++) {
                let deadCharacter = this.deadCharacters[i]
                lostTruths = lostTruths.concat(this.essentialTruths(deadCharacter))
            }

            // make sure we don't have any duplicate truths
            lostTruths = lostTruths.distinct()

            if (lostTruths.length > 0 && this.needBased) {
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

                this.printAction(`${newCharacter.name} arrives with essential knowledge of [${newCharacter.truths.map(n=>`"${n.name}"`).join(",")}]`)

                if (this.player) {
                    console.log(`The butler whispers to you: ${newCharacter.name} seems to have joined the hunt.`)
                }
            }

            // Reset dead characters
            this.deadCharacters = []
        }

        // In the somewhat unlikely event that the last character dies but no truth has been lost generate a new character
        if (this.characters.filter(c=>c.alive).length == 0 && this.needBased && !this.allowDeathOfAll) {
            let newCharacter = new Character(this)
            newCharacter.location = this.locations.sample()
            this.characters.push(newCharacter)
            this.printAction(`${newCharacter.name} arrives`)
        }
    }

    /**
     * Run simulation until an end condition is met
     */
    run() {
        this.printStateOfTheWorld()
        while (this.canStep() && (this.stepCount < this.iterations)) {
            this.stepCount += 1
            this.printAction("================================================================================")
            this.printAction(`Round ${this.stepCount}`)
            this.printAction("================================================================================")
            this.step()
            this.printAction("--------------------------------------------------------------------------------")
        }
        this.printStateOfTheWorld()
    }

    /**
     * Prints an action happening in the engine based on whether the player should see it or not
     * @param {string} action an action happening in the engine
     * @param {boolean} canPlayerSee determines whether the player should see the action or not
     */
    printAction(action, canPlayerSee=false) {
        if (canPlayerSee || (this.isSimulation && this.verbose)) {
            console.log(action)
        }
    }

    printStateOfTheWorld() {
        if (this.verbose) {
            this.printAction("--------------------------------------------------------------------------------")
            this.printAction(`The whole truth: [${this.truths.map(x => `"${x.name}"`).join(", ")}]`)
            this.printAction(`Iterations ${this.stepCount}`)
            this.locations.forEach(l=> {
                this.printAction(l.toString())
                this.printAction('- Truths contained:', l.truths.map(t => `${t.name}`).join(", "))
            })
            this.characters.filter(c=>c.alive).forEach(c => {
                this.printAction(c.toString())
                this.printAction('- People inteviewed:', c.charactersSpokenTo.distinct().map(c=>c.name).join(", "))
                this.printAction('- People attacked:', c.charactersAttacked.distinct().map(c=>c.name).join(", "))
                this.printAction('- Locations visited:', c.locationsVisited.distinct().map(l=>l.name).join(", "))
                this.printAction('- Locations investigated:', c.locationsInvestigated.distinct().map(l=>l.name).join(", "))
                this.printAction('- Truths revealed:', c.truths.map(t=>`"${t.name}"`).join(", "))
                this.printAction('- Has discovered whole truth:', this.knowsTheWholeTruth(c))
            })
        }
    }
}

module.exports = { Engine }