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


//function that I found years ago on the internet and can never cite correctly
//this is also the only function that does 
function randomGaussian(mean, standardDeviation) {

    mean = mean || 0.0;
    standardDeviation = standardDeviation || 1.0;


    if (randomGaussian.nextGaussian !== undefined) {
        var nextGaussian = randomGaussian.nextGaussian;
        delete randomGaussian.nextGaussian;
        return (nextGaussian * standardDeviation) + mean;
    } else {
        var v1, v2, s, multiplier;
        do {
            v1 = 2 * Math.random() - 1; // between -1 and 1
            v2 = 2 * Math.random() - 1; // between -1 and 1
            s = v1 * v1 + v2 * v2;
        } while (s >= 1 || s == 0);
        multiplier = Math.sqrt(-2 * Math.log(s) / s);
        randomGaussian.nextGaussian = v2 * multiplier;
        return (v1 * multiplier * standardDeviation) + mean;
    }

};





module.exports = { getRandomInt, onlyUnique, shuffleArray, getRandomFromArray, randomGaussian }
