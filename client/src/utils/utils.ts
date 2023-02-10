// code for both frontend and backend

export const booleanify = (value: string | number | undefined): boolean => {
  if (value === "false") {
    return false;
  }
  return !!value;
};