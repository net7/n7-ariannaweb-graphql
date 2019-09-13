/**
 * Javascript file containing helper functions used to generate the mock data
 */

import { UserInputError } from 'apollo-server';







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
export function randomPick(array: any[],probab?: number[]){
    if(!probab)
    return array[ Math.floor(Math.random()*(array.length))];
  
    if(probab.length!=array.length){
      console.warn("Wrong probability array! (its length must equal that of the input array). Ignoring the probabilities");
      return this.randomPick(array);
    }
  
    for(var i=0;i<probab.length;i++){
      if(isNaN(probab[i])){
        console.warn("Wrong probability array! (element number "+i+" is not a number). Ignoring the probabilities");
        return this.randomPick(array);
      }
      if(probab[i]<0){
        console.warn("Wrong probability array! (element number "+i+" is negative). Ignoring the probabilities");
        return this.randomPick(array);
      }
      if(probab[i]>1){
        console.warn("Wrong probability array! (element number "+i+" is bigger than 1).  Ignoring the probabilities");
        return this.randomPick(array);
      }
    }
  
    var sum = 0;
    probab.forEach(p => sum+=p); 
    if(sum!=1){ 
          console.warn("Wrong probability array! (their sum should be 1). Ignoring the probabilities");
          return this.randomPick(array);
    }
  
    var rand = Math.random();
    var i=0;
    var randomIdx = -1;
    sum=0;
    while( randomIdx<0 && i<probab.length){
      sum += probab[i];
      if(rand<sum) randomIdx = i;
      i++
    }
    return array[randomIdx];
};







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
export function getRandomIntInclusive(min:number, max:number): number {
  if(!(min<max)) return -1;
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}





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
export function getRandomFloat(min:number, max:number): number {
  if(!(min<max)) return -1;
  var shift = 0;
  if(min<0) shift = Math.abs(min);
  min += shift;
  max += shift;
  var tmp = Math.random() * (max - min) + min;
  tmp -= shift;
  return tmp;
}





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
export function getRandomDate(startDate: Date,endDate: Date): Date {
  if(!startDate || !endDate) return new Date();
  if(startDate>endDate) return new Date();

  var timeInMillis = getRandomIntInclusive(startDate.getTime(),endDate.getTime());
  return new Date( timeInMillis );
}






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
export function getRandomDateStr(startDate:Date,endDate:Date): string {
  var m: Date = getRandomDate(startDate,endDate);
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





/**
 * Function which returns a randomly generated string.
 *
 * @param length
 *  Length of the random string generated (10 if not given)
 *
 */
export function getRandomString(length:number): String {
  var l = 10;
  if(length && length>0) l = length+1;
  var strTmp = '';
  while(l>0){
    var minV = Math.min(6,l);
    strTmp += Math.random().toString(36).substring(2,2+minV);
    l-=minV;
  }
  return strTmp;
}






/**
 * Function which returns a randomly generated rgb color object
 *
 * @returns object with the three fields 'r','g' and 'b' each containing
 *          a randomly generated integer between 0 and 255
 */
export function getRandomRGB(): any {
  var randomR: number = getRandomIntInclusive(0,255);
  var randomG: number = getRandomIntInclusive(0,255);
  var randomB: number = getRandomIntInclusive(0,255);
  return {
    'r':randomR,
    'g':randomG,
    'b':randomB
  };
}






/**
 * Function which returns a randomly generated rgb css string
 */
export function getRandomRgbCssString(): String {
  var rgb = getRandomRGB();
  return `rgb(${rgb.r},${rgb.g},${rgb.b})`;
}






/**
 * Converts an RGB color component in a string
 * (for conversion to hexadecimal)
 *
 * @param c the numerical RGB color component
 *
 * @returns the string obtained by the conversion
 */
function convertRgbComponentToHex(c: number): string{
  var hex = c.toString(16);
  return ( hex.length == 1 ? "0" + hex : hex );
}






/**
 * Function which returns a randomly generated hexadecimal string
 * representing a color
 */
export function getRandomHexColorString(): String {
  var rgb = getRandomRGB();
  var hex1 : string = convertRgbComponentToHex(rgb.r);
  var hex2 : string = convertRgbComponentToHex(rgb.g);
  var hex3 : string = convertRgbComponentToHex(rgb.b);
  return `#${hex1}${hex2}${hex3}`;
}







/**
 * Function which randomly shuffles a given array.
 */
export function shuffleArray(array:any[]) : void {
  array.sort(() => Math.random() - 0.5);
}




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
export function pickNDistinctPositiveIntegers(max:number,n:number): number[] {
  if(max<0) return null;
  if(n>max) return null;

  var nums: number[] = [];
  for(var i=0;i<=max;i++){
    nums.push(i);
  }

  var toRemove = max - n + 1;
  while(toRemove>0){
    var tmpIdx = getRandomIntInclusive(0,nums.length-1);
    nums.splice(tmpIdx,1);
    toRemove--;
  }

  return nums;
}

















/**
 * Function used to throw an Apollo UserInputError signaling that
 * a specific parameter (for a query or mutation) which was supposed
 * to represent a date in ISO format does not
 *
 * @param parameter name of the argument of the query/mutation
 */
function throwUserInputErrorWrongDateFormat(param: String) : void {
  throw new UserInputError('Form Arguments invalid', {
    message: param+" is not a valid ISO Date String",
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
export function isValidIsoDateString(string:string) : boolean {
  return ( ! isNaN( Date.parse(string) ) );
}





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
export function areInCorrectOrderDateStrings(startDate:string,endDate:string) : boolean{
  var startDateNum:number = Date.parse(startDate);
  if(isNaN(startDateNum)) startDateNum=-1;
  var endDateNum:number = Date.parse(endDate);
  if(isNaN(endDateNum)) endDateNum=-1;
  return (endDateNum>=startDateNum);
}




/**
 * Function used to throw an Apollo UserInputError signaling that
 * the user has specified a start date and end date but the
 * start date does not comes before the end date
 *
 * @param startDate name of the start date argument (in the query or mutation)
 * @param endDate name of the end date argument (in the query or mutation)
 *
 */
export function throwUserInputErrorWrongStartEndDates(startDate:string,endDate:string) : void {
  throw new UserInputError('Form Arguments invalid', {
    message: startDate+" does not preceed "+endDate,
    invalidArgs: [startDate,endDate]
  });
}



/**
 * Function used to throw an Apollo UserInputError signaling that
 * a specific parameter (for a query or mutation) has not been given
 *
 * @param parameter name of the missing parameter
 */
export function throwUserInputErrorParameterNotProvided(parameter:string) : void {
  throw new UserInputError('Form Arguments invalid', {
    message: "Argument " + parameter + ' not given',
    invalidArgs: [parameter]
  });
}




/** Function used to clone an array of strings
 *
 * @param array input array
 *
 * @returns an array of string identical to the input one but
 *          completely independent
 */
export function cloneArrayOfStrings(array:string[]): string[] {
  var clone = [];
  array.forEach(str => {
    var c = str+'';
    clone.push(c);
  })
  return clone;
}











export const randomRangesForValues = [
  {
    currentValueStart:50,
    currentValueEnd:150,
    negativeRange: -89,
    positiveRange: 89
  },
  {
    currentValueStart:535,
    currentValueEnd:798,
    negativeRange: -190,
    positiveRange: 185
  }
  ,
  {
    currentValueStart:500,
    currentValueEnd:700,
    negativeRange: -180,
    positiveRange: 150
  }
  ,
  {
    currentValueStart:700,
    currentValueEnd:890,
    negativeRange: -150,
    positiveRange: 150
  }
  ,
  {
    currentValueStart:300,
    currentValueEnd:330,
    negativeRange: -250,
    positiveRange: 250
  }
  ,
  {
    currentValueStart:7,
    currentValueEnd:9,
    negativeRange: -230,
    positiveRange: 250
  }
  ,
  {
    currentValueStart:800,
    currentValueEnd:1050,
    negativeRange: -300,
    positiveRange: 250
  }
];




export function dateToString(date:Date) : string {
 return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
}

export const millisecondsInADay = 86400000;
export const millisecondsInAnHour = 3600000;
