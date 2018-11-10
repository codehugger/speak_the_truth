function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
  
  function getRandomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)]
  }
  
  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
  
  function shuffleArray(array) {
    var new_array = array.slice()
    var currentIndex = new_array.length;
    var temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = new_array[currentIndex];
      new_array[currentIndex] = new_array[randomIndex];
      new_array[randomIndex] = temporaryValue;
    }
  
    return new_array;
  }
  

module.exports = { getRandomInt, onlyUnique, shuffleArray, getRandomFromArray }
