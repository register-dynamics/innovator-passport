/**
 * @param {Environment} env
 */
module.exports = function (env) {
  const filters = {};

  /* ------------------------------------------------------------------
    add your methods to the filters obj below this comment block:
    @example:

    filters.sayHi = function(name) {
        return 'Hi ' + name + '!'
    }

    Which in your templates would be used as:

    {{ 'Paul' | sayHi }} => 'Hi Paul'

    Notice the first argument of your filters method is whatever
    gets 'piped' via '|' to the filter.

    Filters can take additional arguments, for example:

    filters.sayHi = function(name,tone) {
      return (tone == 'formal' ? 'Greetings' : 'Hi') + ' ' + name + '!'
    }

    Which would be used like this:

    {{ 'Joel' | sayHi('formal') }} => 'Greetings Joel!'
    {{ 'Gemma' | sayHi }} => 'Hi Gemma!'

    For more on filters and how to write them see the Nunjucks
    documentation.

  ------------------------------------------------------------------ */
  function generateRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  filters.randomDate = function () {
    const currentDate = new Date();
    const max_year = currentDate.getFullYear();
    const day = generateRandomInt(30);
    const month = generateRandomInt(12);
    const year = getRandomArbitrary((max_year - 2), max_year);
    const hours = generateRandomInt(24);
    const mins = generateRandomInt(60);
    rdate = new Date(year, month, day, hours, mins);
    return rdate.toUTCString();

  };

  filters.randomID = function(length) {
    return generateRandomInt(length * 10 **length)
  }

  /* keep the following line to return your filters to the app  */
  return filters;
};

/**
 * @import { Environment } from 'nunjucks'
 */
