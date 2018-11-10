const randomGaussian = require('./Util.js').randomGaussian


class Character {
    constructor(game, name, location=null, truths=[], alive=true, personality=[], inert=false) {
      this.game = game
      this.name = name
      this.location = location
      this.truths = truths
      this.alive = alive
      //inert means that this character will not 
      //try to use his personality to select actions
      this.inert = inert
      
      if (personality.length == 4) {
        this.personality = personality;

      } else {
       
        this.personality = [
            Math.random(), 
            Math.random(),
            Math.random(),
            Math.random()
        ]

      }

      //Personality = [Agression, Charisma, Curiosity, Intelligence]
      
      let sum = this.personality.reduce((x, y)=>x+y)
      this.personality = this.personality.map(x=>x/sum);

    }

    /**
     * Finds the similarity of other character.
     * @param {Other character to determine similarity to} other 
     */
    similarity(other){

        //https://en.wikipedia.org/wiki/Cosine_similarity
        let usum = 0;
        
        for (let i = 0; i < this.personality.length; i++) {
            usum += (other.personality[i] * this.personality[i]);
        }

        let mySum = this.personality.reduce(        (x,y) => x + (y*y) )
        let theirSum = other.personality.reduce(    (x,y) => x + (y*y) )
        
        return usum / (Math.sqrt(mySum)*Math.sqrt(theirSum));
    }
  
    perform_action() {
      // dead men do nothing ... for now
      if (!this.alive) {
        return false
      }
  
      var noop = Math.random()
      var action = Math.random()
      var character = getRandomFromArray(this.location.characters().filter(x=> (x.name !== this.name)&& x.alive ))
      var location = getRandomFromArray(this.game.locations.filter(x=>x.name !== this.location.name))
      
      let actions = [];

      if(typeof(character) !== 'undefined'){
          actions.push(this.game.attack.bind(this.game, this, character))
          actions.push(this.game.talk.bind(this.game, this, character))
          
          if( this.similarity(character) < 0.1 ){
            console.log(`${this.name} hates ${character.name}!`);
            this.game.attack(this, character);
            return;
          }

      }
      if(typeof(location) !== 'undefined'){
          actions.push(this.game.travel.bind(this.game, this, location))
      }
      actions.push(this.game.investigate.bind(this.game, this, this.location))
      
      if (noop < 0.5) {
        this.game.noop(this)
      }
      else if (action < 0.01) {
        this.game.wanderOff(this)
      }


        
      let a = getRandomFromArray(actions);
      a();

      
    }

    /**
     * Returns a normalized vector similar but not equivalent
     * to this characters vector.
     */
    mutate(){
        let newPersonality = []
        let std = 0.5 
        this.personality.forEach(p => {
            newPersonality.push(

                Math.max(0, Math.min(1, randomGaussian(p, std)))

            )
        });

        return newPersonality;
    }
  
    hasEssentialTruth() {
      for (var i = this.truths.length - 1; i >= 0; i--) {
        var truth = this.truths[i]
        var found = false
        for (var j = this.game.characters.length - 1; j >= 0; j--) {
          var char = this.game.characters[j]
          if (char.alive && char.truths.includes(truth)) {
            found = true
            break
          }
        }
  
        if (!found) {
          return true
        }
      }
      return false
    }
  
    toString() {
      return `${this.name} (${this.personality.map(x=>x.toFixed(2))})`
    }
}

module.exports = { Character }


