const inquirer = require('inquirer')
const program = require('commander')
const Engine = require('./engine').Engine

let characterCount = 0
let locationCount = 0
let weaponCount = 0
let truthCount = 0
var engine;

program
    .version('0.1.0')
    .option('-d, --debug')
    .parseOptions(process.argv)

let options = { "debug": program.debug }

inquirer.prompt([
    {
        type: 'list',
        name: 'difficulty',
        message: 'What difficulty level would you like?',
        choices: ['Easy', 'Normal', 'Hard']
    }
    // {
    //     type: 'list',
    //     name: 'agression',
    //     message: 'Oh no! there is a man!',
    //     choices: ['Hit the man!', 'run away']
    // },
    // {
    //     type: 'list',
    //     name: 'curiousity',
    //     message: 'Oh no there is a button',
    //     choices: ['press it', 'run away', '']
    // },
    // {
    //     type: 'list',
    //     name: 'intelligence',
    //     message: 'What is the answer to life, something else and the universe?',
    //     choices: ['Hit the man!', '42']
    // },
    // {
    //     type: "list",
    //     name: "charisma",
    //     message: "GOOD LOOKING PERSON!!!",
    //     choices: ["Hit the man!", "*wolf whistle*"]
    // }
]).then(answer => {
    switch(answer.difficulty) {
        case 'Normal': {
            characterCount = 8; locationCount = 12; truthCount = 5; difficulty = 'normal'; break
        }
        case 'Hard': {
            characterCount = 10; locationCount = 15; truthCount = 7; difficulty = 'hard'; break
        }
        default: {
            characterCount = 6; locationCount = 9; truthCount = 3; difficulty = 'easy'; break
        }
    }

    engine = new Engine(locationCount, characterCount, truthCount, true, options)

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

    function showCurrentKnowledge() {
        engine.playerPrintKnowledge(program.debug)
        ask()
    }

    function endTurn() {
        if (engine.canStep()) {
            engine.step()
            ask()
        }
    }

    function introduction() {
        process.stdout.write('\033c')

        console.log(`-------------------------------------------------------------------------------------`)
        console.log(`A NIGHT TO REMEMBER`)
        console.log(`-------------------------------------------------------------------------------------`)
        console.log(`It's a dark and stormy night.`)
        console.log(`A terrible crime has been committed at the Dunner Mansion.`)
        console.log(`The host Mr. Dunner has been killed during a public fundraiser.`)
        console.log(`You, detective LeGrasse have been sent to the location.`)
        console.log(`Everything has been done in order to secure the area.`)
        console.log(`We estimate that there are well over 100 guests on premise!`)
        console.log(`There simply aren't enough police officers to keep track of everyone.`)
        console.log(`Also, due to someone-soon-to-be-fired's stupidity has resulted in the body being moved.`)
        console.log(`As far as I can tell the guests have started their own little investigation.`)
        console.log(`Once they have enough to go on I believe they will talk to the press.`)
        console.log(`These people will stop at nothing!`)
        console.log(`Some might even say that they are 'dying' for the truth to come out.`)
        console.log(`Get to the bottom of this before this turns into a media fiasco!`)
        console.log(`Solve this quickly! Be thorough! Use force if necessary!`)
        console.log(`-------------------------------------------------------------------------------------`)

        ask()
    }

    function printContext() {
        console.log(`You are standing in the ${engine.player.location.name}`)

        if (engine.playerAvailableCharacters().length) {
            console.log("There are people with you.")
            engine.playerAvailableCharacters().forEach((c) => console.log(`- ${c.name}`))
        } else {
            console.log("You are alone.")
        }
    }

    function ask() {
        if (engine.canStep()) {
            printContext()
            let choices = engine.playerAvailableActions()

            choices.push("Review Knowledge")

            if (program.debug) {
                choices.push("Solve")
            }

            inquirer.prompt([{
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: choices
            }]).then(answers => {
                if (answers.action == 'Explore') {
                    process.stdout.write('\033c')
                    explore()
                } else if (answers.action == 'Talk') {
                    process.stdout.write('\033c')
                    talkTo()
                } else if (answers.action == 'Investigate') {
                    process.stdout.write('\033c')
                    investigate()
                } else if (answers.action == 'Attack') {
                    process.stdout.write('\033c')
                    attack()
                } else if (answers.action == 'Review Knowledge') {
                    process.stdout.write('\033c')
                    showCurrentKnowledge()
                } else if (answers.action == 'Solve') {
                    process.stdout.write('\033c')
                    engine.playerSolve()
                    ask()
                }
            })
        } else {
            "The mystery has been solved!"
        }
    }

    introduction()
})