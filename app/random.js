//Generate random numbers, codes, names etc

module.exports = {randomCode}

function randomCode() {
    return Math.floor(Math.random() * 1000000000);
}