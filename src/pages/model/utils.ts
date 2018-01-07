/**
 * 
 * 
 * @export
 * @class Utils
 */
export class Utils {

    /**
     * Remove accents and spaces from string
     * 
     * @static
     * @param {*} str 
     * @returns {string} 
     * @memberof Utils
     */
    public static removeAccents(str : any) : string {
        let accents = 'ÀÁÂÃÄÅàáâãäåßÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
        let accentsOut = "AAAAAAaaaaaaBOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
        str = str.split('');
        str.forEach((letter, index) => {
          let i = accents.indexOf(letter);
          if (i != -1) {
            str[index] = accentsOut[i];
          }
        })
        return str.join('');
      }
}