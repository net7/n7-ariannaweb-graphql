"use strict";
/**
 * Javascript file containing helper functions used to generate the mock data
 */
Object.defineProperty(exports, "__esModule", { value: true });
var apollo_server_1 = require("apollo-server");
/**
 * Function which picks randomly an element (of type any)
 * from a given array.
 *
 * @param array
 *  Array of elements from which to pick one randomly.
 *
 * @param probab
 *  Optional array containing the probability for each element to
 *  be picked (values between 0 and 1). If not given the array assumes
 *  all the elements have the same probability to be picked.
 *  The number of probabilities must be equal to the numer of elements in
 *  the array, their values should neven be lower than 0 or greater than 1
 *  and the sum of all the probabilities has to equal 1, if any of those
 *  conditions is not met than the function will ignore the probabilities
 *  (and will prompt a warning in the console)
 *
 */
function randomPick(array, probab) {
    if (!probab)
        return array[Math.floor(Math.random() * (array.length))];
    if (probab.length != array.length) {
        console.warn("Wrong probability array! (its length must equal that of the input array). Ignoring the probabilities");
        return this.randomPick(array);
    }
    for (var i = 0; i < probab.length; i++) {
        if (isNaN(probab[i])) {
            console.warn("Wrong probability array! (element number " + i + " is not a number). Ignoring the probabilities");
            return this.randomPick(array);
        }
        if (probab[i] < 0) {
            console.warn("Wrong probability array! (element number " + i + " is negative). Ignoring the probabilities");
            return this.randomPick(array);
        }
        if (probab[i] > 1) {
            console.warn("Wrong probability array! (element number " + i + " is bigger than 1).  Ignoring the probabilities");
            return this.randomPick(array);
        }
    }
    var sum = 0;
    probab.forEach(function (p) { return sum += p; });
    if (sum != 1) {
        console.warn("Wrong probability array! (their sum should be 1). Ignoring the probabilities");
        return this.randomPick(array);
    }
    var rand = Math.random();
    var i = 0;
    var randomIdx = -1;
    sum = 0;
    while (randomIdx < 0 && i < probab.length) {
        sum += probab[i];
        if (rand < sum)
            randomIdx = i;
        i++;
    }
    return array[randomIdx];
}
exports.randomPick = randomPick;
;
/**
 * Function which returns an integer included in the
 * [ min , max ] interval (min and max included)
 * from a given array.
 *
 * @param min
 *  Minimum possible integer
 *
 * @param max
 *  Maximum possible integer
 *
 */
function getRandomIntInclusive(min, max) {
    if (!(min < max))
        return -1;
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
exports.getRandomIntInclusive = getRandomIntInclusive;
/**
 * Function which returns a float included in the
 * [ min , max ] interval (min and max included)
 * from a given array.
 *
 * @param min
 *  Minimum possible float
 *
 * @param max
 *  Maximum possible float
 *
 */
function getRandomFloat(min, max) {
    if (!(min < max))
        return -1;
    var shift = 0;
    if (min < 0)
        shift = Math.abs(min);
    min += shift;
    max += shift;
    var tmp = Math.random() * (max - min) + min;
    tmp -= shift;
    return tmp;
}
exports.getRandomFloat = getRandomFloat;
/**
 * Function which returns a random date ( as a Date Object ) included in the
 * [ startDate , endDate ] interval (startDate and endDate included).
 *
 * @param startDate
 *  Starting possible date
 *
 * @param endDate
 *  Ending possible date
 *
 */
function getRandomDate(startDate, endDate) {
    if (!startDate || !endDate)
        return new Date();
    if (startDate > endDate)
        return new Date();
    var timeInMillis = getRandomIntInclusive(startDate.getTime(), endDate.getTime());
    return new Date(timeInMillis);
}
exports.getRandomDate = getRandomDate;
/**
 * Function which returns a string of a random date included in the
 * [ startDate , endDate ] interval (startDate and endDate included).
 *
 * @param startDate
 *  Starting possible date
 *
 * @param endDate
 *  Ending possible date
 *
 */
function getRandomDateStr(startDate, endDate) {
    var m = getRandomDate(startDate, endDate);
    /*var dateString =
      m.getUTCFullYear() + "-" +
      ("0" + (m.getUTCMonth()+1)).slice(-2) + "-" +
      ("0" + m.getUTCDate()).slice(-2) + " " +
      ("0" + m.getUTCHours()).slice(-2) + ":" +
      ("0" + m.getUTCMinutes()).slice(-2) + ":" +
      ("0" + m.getUTCSeconds()).slice(-2);
    return dateString;*/
    // I think it'll be better to always use ISO Strings
    return m.toISOString();
}
exports.getRandomDateStr = getRandomDateStr;
/**
 * Function which returns a randomly generated string.
 *
 * @param length
 *  Length of the random string generated (10 if not given)
 *
 */
function getRandomString(length) {
    var l = 10;
    if (length && length > 0)
        l = length + 1;
    var strTmp = '';
    while (l > 0) {
        var minV = Math.min(6, l);
        strTmp += Math.random().toString(36).substring(2, 2 + minV);
        l -= minV;
    }
    return strTmp;
}
exports.getRandomString = getRandomString;
/**
 * Function which returns a randomly generated rgb color object
 *
 * @returns object with the three fields 'r','g' and 'b' each containing
 *          a randomly generated integer between 0 and 255
 */
function getRandomRGB() {
    var randomR = getRandomIntInclusive(0, 255);
    var randomG = getRandomIntInclusive(0, 255);
    var randomB = getRandomIntInclusive(0, 255);
    return {
        'r': randomR,
        'g': randomG,
        'b': randomB
    };
}
exports.getRandomRGB = getRandomRGB;
/**
 * Function which returns a randomly generated rgb css string
 */
function getRandomRgbCssString() {
    var rgb = getRandomRGB();
    return "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")";
}
exports.getRandomRgbCssString = getRandomRgbCssString;
/**
 * Converts an RGB color component in a string
 * (for conversion to hexadecimal)
 *
 * @param c the numerical RGB color component
 *
 * @returns the string obtained by the conversion
 */
function convertRgbComponentToHex(c) {
    var hex = c.toString(16);
    return (hex.length == 1 ? "0" + hex : hex);
}
/**
 * Function which returns a randomly generated hexadecimal string
 * representing a color
 */
function getRandomHexColorString() {
    var rgb = getRandomRGB();
    var hex1 = convertRgbComponentToHex(rgb.r);
    var hex2 = convertRgbComponentToHex(rgb.g);
    var hex3 = convertRgbComponentToHex(rgb.b);
    return "#" + hex1 + hex2 + hex3;
}
exports.getRandomHexColorString = getRandomHexColorString;
/**
 * Function which randomly shuffles a given array.
 */
function shuffleArray(array) {
    array.sort(function () { return Math.random() - 0.5; });
}
exports.shuffleArray = shuffleArray;
/**
 * Function used to pick n different integers from the range [0,max]
 *
 * @param max greatest positive number which can be picked
 *            (note: if the number is not an integer it's rounddown to
 *            the nearest integer can be picked at maximum)
 * @param n number of integers to pick
 *
 * @param array containing the picked numbers or null if wrong inputs hav
 *              been given to the function
 */
function pickNDistinctPositiveIntegers(max, n) {
    if (max < 0)
        return null;
    if (n > max)
        return null;
    var nums = [];
    for (var i = 0; i <= max; i++) {
        nums.push(i);
    }
    var toRemove = max - n + 1;
    while (toRemove > 0) {
        var tmpIdx = getRandomIntInclusive(0, nums.length - 1);
        nums.splice(tmpIdx, 1);
        toRemove--;
    }
    return nums;
}
exports.pickNDistinctPositiveIntegers = pickNDistinctPositiveIntegers;
/**
 * Function used to throw an Apollo UserInputError signaling that
 * a specific parameter (for a query or mutation) which was supposed
 * to represent a date in ISO format does not
 *
 * @param parameter name of the argument of the query/mutation
 */
function throwUserInputErrorWrongDateFormat(param) {
    throw new apollo_server_1.UserInputError('Form Arguments invalid', {
        message: param + " is not a valid ISO Date String",
        invalidArgs: param
    });
}
/**
 * Checks if the input string represent a valid date
 *
 * Note: Tecnically we've decided to accept only strings in ISO Date Format,
 * which is : 'YYYY-MM-DDTHH:MM:ss.mmmZ', this function accepts a superset of
 * such strings, but it would always be advisable to input only strings in
 * the ISO Date Format
 *
 * @param string
 *    input string to check
 *
 * @returns true is the string represents a valid date, false otherwise
 */
function isValidIsoDateString(string) {
    return (!isNaN(Date.parse(string)));
}
exports.isValidIsoDateString = isValidIsoDateString;
/**
 * Function which checks if two strings representing dates (preferably in
 * ISO format) are in correct time order, meaning that the first (starting)
 * date has to come before the ending one
 *
 * @param startDate ISOString representing the starting date
 * @param endDate ISOString representing the ending date
 *
 * @returns boolean indicating if the order is correct or not
 */
function areInCorrectOrderDateStrings(startDate, endDate) {
    var startDateNum = Date.parse(startDate);
    if (isNaN(startDateNum))
        startDateNum = -1;
    var endDateNum = Date.parse(endDate);
    if (isNaN(endDateNum))
        endDateNum = -1;
    return (endDateNum >= startDateNum);
}
exports.areInCorrectOrderDateStrings = areInCorrectOrderDateStrings;
/**
 * Function used to throw an Apollo UserInputError signaling that
 * the user has specified a start date and end date but the
 * start date does not comes before the end date
 *
 * @param startDate name of the start date argument (in the query or mutation)
 * @param endDate name of the end date argument (in the query or mutation)
 *
 */
function throwUserInputErrorWrongStartEndDates(startDate, endDate) {
    throw new apollo_server_1.UserInputError('Form Arguments invalid', {
        message: startDate + " does not preceed " + endDate,
        invalidArgs: [startDate, endDate]
    });
}
exports.throwUserInputErrorWrongStartEndDates = throwUserInputErrorWrongStartEndDates;
/**
 * Function used to throw an Apollo UserInputError signaling that
 * a specific parameter (for a query or mutation) has not been given
 *
 * @param parameter name of the missing parameter
 */
function throwUserInputErrorParameterNotProvided(parameter) {
    throw new apollo_server_1.UserInputError('Form Arguments invalid', {
        message: "Argument " + parameter + ' not given',
        invalidArgs: [parameter]
    });
}
exports.throwUserInputErrorParameterNotProvided = throwUserInputErrorParameterNotProvided;
/** Function used to clone an array of strings
 *
 * @param array input array
 *
 * @returns an array of string identical to the input one but
 *          completely independent
 */
function cloneArrayOfStrings(array) {
    var clone = [];
    array.forEach(function (str) {
        var c = str + '';
        clone.push(c);
    });
    return clone;
}
exports.cloneArrayOfStrings = cloneArrayOfStrings;
exports.randomRangesForValues = [
    {
        currentValueStart: 50,
        currentValueEnd: 150,
        negativeRange: -89,
        positiveRange: 89
    },
    {
        currentValueStart: 535,
        currentValueEnd: 798,
        negativeRange: -190,
        positiveRange: 185
    },
    {
        currentValueStart: 500,
        currentValueEnd: 700,
        negativeRange: -180,
        positiveRange: 150
    },
    {
        currentValueStart: 700,
        currentValueEnd: 890,
        negativeRange: -150,
        positiveRange: 150
    },
    {
        currentValueStart: 300,
        currentValueEnd: 330,
        negativeRange: -250,
        positiveRange: 250
    },
    {
        currentValueStart: 7,
        currentValueEnd: 9,
        negativeRange: -230,
        positiveRange: 250
    },
    {
        currentValueStart: 800,
        currentValueEnd: 1050,
        negativeRange: -300,
        positiveRange: 250
    }
];
function dateToString(date) {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
}
exports.dateToString = dateToString;
exports.millisecondsInADay = 86400000;
exports.millisecondsInAnHour = 3600000;
