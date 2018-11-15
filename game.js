const inquirer = require('inquirer')
const Engine = require('./engine').Engine

let characterCount = 0
let locationCount = 0
let weaponCount = 0
let truthCount = 0
var engine;

inquirer
    .prompt([
        {
            type: 'list',
            name: 'difficulty',
            message: 'What difficulty level would you like?',
            choices: ['Easy', 'Medium', 'Hard']
        }
    ])
    .then(answers => {
        switch(answers['difficulty'].toLowerCase()) {
            case 'easy': {
                characterCount = 5; locationCount = 5; weaponCount = 5; truthCount = 3; break
            }
            case 'medium': {
                characterCount = 10; locationCount = 10; weaponCount = 8; truthCount = 5; break
            }
            case 'hard': {
                characterCount = 20; locationCount = 15; weaponCount = 8; truthCount = 8; break
            }
        }

        engine = new Engine(locationCount, characterCount, weaponCount, truthCount, true)

        console.log("-------------------------------------------------------------------------------------")
        console.log("A NIGHT TO REMEMBER")
        console.log("-------------------------------------------------------------------------------------")
        console.log("It's a dark and stormy night.")
        console.log("A terrible crime has been committed at the Dunner Mansion.")
        console.log("The host Mr. Dunner has been killed during a public fundraiser.")
        console.log("You, my dear detective Shaw have been sent to the location.")
        console.log("Get to the bottom of this before it turns into a media fiasco!")
        console.log("Everything has been done in order to secure the area.")
        console.log("However, there simply aren't enough officers available to keep track of everyone.")
        console.log("The guests themselves seem quite eager to talk to the press.")
        console.log("As far as I can tell they have started their own little investigation.")
        console.log("They will stop at nothing!")
        console.log("Some might even say that they are 'dying' for the truth to come out.")
        console.log("Solve this quickly! Be thorough! Use force if necessary!")
        console.log("-------------------------------------------------------------------------------------")

        function attack() {
            if (engine.playerAvailableCharacters().length > 1) {
                inquirer.prompt({
                    type: 'list',
                    name: 'character',
                    message: 'Who would you like to attack?',
                    choices: engine.playerAvailableCharacters().map(l=>l.name)
                }).then(answers => {
                    engine.playerAttack(answers.character)
                    endTurn()
                })
            } else {
                engine.playerAttack(engine.playerAvailableCharacters()[0].name)
                endTurn()
            }
        }

        function explore() {
            inquirer.prompt({
                type: 'list',
                name: 'location',
                message: 'Where would you like to go?',
                choices: engine.playerAvailableLocations().map(l=>l.name)
            }).then(answers => {
                engine.playerTravelTo(answers.location)
                endTurn()
            })
        }

        function talkTo() {
            if (engine.playerAvailableCharacters().length > 1) {
                inquirer.prompt({
                    type: 'list',
                    name: 'character',
                    message: 'Who would you like to speak with?',
                    choices: engine.playerAvailableCharacters().map(c=>c.name)
                }).then(answers => {
                    engine.playerTalkTo(answers.character)
                    endTurn()
                })
            } else {
                engine.playerTalkTo(engine.playerAvailableCharacters()[0].name)
                endTurn()
            }
        }

        function investigate() {
            engine.playerInvestigate()
            endTurn()
        }

        function endTurn() {
            if (engine.canStep()) {
                engine.step()
                ask()
            }
        }

        function ask() {
            console.log(`You are standing in the ${engine.player.location.name}`)

            debugger

            if (engine.playerAvailableCharacters().length) {
                console.log("There are people with you.")
                engine.playerAvailableCharacters().forEach((c) => console.log(`- ${c.name}`))
            } else {
                console.log("You are alone.")
            }

            if (engine.canStep()) {
                inquirer.prompt([{
                    type: 'list',
                    name: 'action',
                    message: 'What would you like to do?',
                    choices: engine.playerAvailableActions()
                }]).then(answers => {
                    if (answers.action == 'Explore') {
                        explore()
                    } else if (answers.action == 'Talk') {
                        talkTo()
                    } else if (answers.action == 'Investigate') {
                        investigate()
                    } else if (answers.action == 'Attack') {
                        attack()
                    }
                })
            } else {
                "The mystery has been solved!"
            }
        }

        ask()
    });