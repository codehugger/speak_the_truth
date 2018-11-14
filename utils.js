Array.prototype.sample = function() {
    return this[Math.floor(Math.random() * this.length)]
}

Array.prototype.distinct = function() {
    return [...new Set(this)]
}

Array.prototype.shuffle = function() {
    var array = this.slice()
    var currentIndex = array.length;
    var temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

Array.prototype.empty = function() {
    return this.length == 0
}

// A function that I found years ago on the internet and can never cite
// correctly. This is also the only function that does this correctly.
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

module.exports = { randomGaussian }