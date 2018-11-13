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
        this.game.wanderOff(this)
      }
      // controlled by aggression
      else if (character &&  (action < (this.aggression())) ) {
        this.game.attack(this, character)
      }
      // controlled by charisma
      else if (character && (action < (this.aggression() + this.charisma())) ) {
        this.game.talk(this, character)
      }
      // controlled by curiosity
      else if ( location && (action < (this.aggression() + this.charisma() + this.curiosity())) ) {
        this.game.travel(this, location)
      }
      // controlled by intelligence
      else if (action < 1.0) {
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
        let others = this.game.characters.filter(x=> (x.name !== this.name && x.alive) )

        let other_char_truths = [];
        
    
        others.forEach(other=>{
            let t = other.truths.map(x=>x.truth);
            while(t.length != 0){
                
                let c_truth = t.pop();
                if(typeof(c_truth) === 'undefined'){
                    return;
                } 
                if(typeof(other_char_truths[c_truth.index]) === 'undefined'){
                    other_char_truths[c_truth.index] = c_truth;
                }

            }
        });
        
        //loop through the truths this character knows, 
        for (let i = 0; i < true_truths.length; i++) {
            
            const element = true_truths[i];
            //find a true truth
            if(other_char_truths[element.index] !== element){
                
                return true;
            }
            
        }

        return false;
       
    }
    toString() {
      return `${this.name} (${this.personality.map(x=>x.toFixed(2))})`
    }
}

module.exports = { Character }


