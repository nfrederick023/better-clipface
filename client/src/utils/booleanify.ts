/**
 * Returns boolean value of a number or string. 
 *
 * @param {string | number} value The Ivalue to booleanify
 * @returns {boolean}
 */
export const booleanify = (value: string | number ): boolean => {
    if(value === "false"){
        return false;
    }
    return !!value;
};