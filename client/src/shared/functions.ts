export const booleanify = (value: string | number | boolean): boolean => {
    if(value === 'false'){
        return false
    }
    return !!value;
}