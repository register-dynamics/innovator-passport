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
    return Math.floor(Math.random() * max) + 1;
  }

  function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  filters.randomDate = function () {
    currentDate = new Date();
    max_year = currentDate.getFullYear();
    day = generateRandomInt(30);
    month = generateRandomInt(12);
    year = getRandomArbitrary((max_year - 2), max_year);
    rdate = new Date(year, month, day);
    return rdate.toString();
  };

  /* keep the following line to return your filters to the app  */
  return filters;
};

/**
 * @import { Environment } from 'nunjucks'
 */
