/**
 * @file
 * Helpers related to interpreting dice results.
 */

/**
 * @typedef {object} StaChallengeResults
 * @property {number} blanks
 * @property {number} effects
 * @property {number} successes
 */

/**
 * Parse a Foundry Roll result for Challenge Dice outcomes.
 *
 * @param {Roll} roll
 * @returns {StaChallengeResults}
 */
export function countChallengeResults(roll) {
  /** @type {StaChallengeResults} */
  const results = {
    blanks: 0,
    effects: 0,
    successes: 0,
  };

  let dice = roll.terms[0].results.map((die) => die.result);
  dice.forEach((dieFace) => {
    if ([1, 2].includes(dieFace)) {
      results.successes += dieFace;
    }
    else if ([5, 6].includes(dieFace)) {
      results.successes += 1;
      results.effects += 1;
    }
    else {
      results.blanks += 1;
    }
  });

  return results;
}
