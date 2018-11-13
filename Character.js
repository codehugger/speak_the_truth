const randomGaussian = require('./Util.js').randomGaussian

class Beleif {
    constructor(truth, probability){
        this.truth = truth
        this.probability = probability
    }
    toString(){
        return `[${this.probability}|${this.truth}]`
    }
}

class Character {
    constructor(game, name, location=null, truths=[], alive=true, personality=[], inert=false) {
      this.game = game
      this.name = name
      this.location = location
      //a newborn character will believe anything told to him 100%
    
      this.truths = truths.map(x=>new Beleif(x, 1.0));
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
    
    aggression(){
        return this.personality[0];
    }
    charisma(){
        return this.personality[1];
    }
    curiosity(){
        return this.personality[2];
    }
    intelligence(){
        return this.personality[3];
    }
    /**
     * Sets a truth with 100% certainty.
     */
    setTruth(truth){
        this.truths[truth.index] = new Beleif(truth, 1);
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
      
    //   console.log(character.name, location.name);
      

      if (noop < 0.5) {
        this.game.noop(this)
      }

      else if (action < 0.01) {
        console.log("wandering off ");
        
        this.game.wanderOff(this)
      }
      // controlled by aggression
      else if (character && action < (this.aggression())) {
          
        console.log("attacking ");
        this.game.attack(this, character)
      }
      // controlled by charisma
      else if (character && action < (this.aggression() + this.charisma())) {
          
        console.log("talking ");
        this.game.talk(this, character)
      }
      // controlled by curiosity
      else if ( location && action < (this.aggression() + this.charisma() + this.curiosity()) ) {
          
        console.log("travelling ");
        this.game.travel(this, location)
      }
      // controlled by intelligence
      else if (action < 1.0) {
          
        console.log("Ivestingation ");
        this.game.investigate(this, this.location)
      }
      
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


    receiveTruths(truths, from){

        let likeness = this.similarity(from);
        let intelligence = this.personality[3];

        // if the characters intelligence is low, he will more probably beleive lies from bad people.
        //to-do

        for (let i = 0; i < truths.length; i++) {
            const element = truths[i];
            if(element)
                this.truths[element.index] = new Beleif(element, 1.0);
        }
    }

    /**
     * Determines if this character holds a certain truth that no other character holds. 
     */
    hasEssentialTruth() {
        

        let true_truths = this.truths.filter(x=>x.probability===1.0).map(x=>x.truth);//.filter(x=> x.probability === 1).map(x=>x.truth);
        //get other characters.
        let others = this.game.characters.filter(x=> (x.name !== this.name) )

        let other_char_truths = [];

        for(var i = 0; i < others.length ; i++){
            const c = others[i];
            
            //find true truths that this character has.
            let t = c.truths.filter(x => (x.probability === 1.0) );
            t = t.map( x => x.truth )
            //
            while(t.length != 0 ){
                let el = t.pop();

                if(typeof(el) === 'undefined'){
                    continue;
                }

                if( typeof(other_char_truths[el.index]) === 'undefined'){
                    other_char_truths[el.index] = el;
                }

            }

        }
        console.log(true_truths);
        console.log(other_char_truths);
        
        //loop through the truths this character knows, 
        for (let i = 0; i < true_truths.length; i++) {
            
            const element = true_truths[i];
            //find a true truth
            if(other_char_truths[element.index] !== element){
                
                return true;
            }
            
        }

        return false;
        

        /*
        for (let i = 0; i < true_truths.length; i++) {
            const t = true_truths[i];
            found = false;

            //check for others.
            for (let j = 0; j < others.length; j++) {
                const character = others[j];
                let character_truths = character.truths.filter(x=>x.probability === 1).map(x=>x.truth);

                //loop through character true_truths.
                for(var n = 0; n < character_truths.length; n++){
                    if(character_truths[n] === t){
                        found = true;
                        continue;
                    }
                }

                if(found){
                    break;
                }
                

            }

            if(!found){
                return true
            }
            
        }
        return false;
        */
        /*
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
      */
    }
    toString() {
      return `${this.name} (${this.personality.map(x=>x.toFixed(2))})`
    }
}

module.exports = { Character }


