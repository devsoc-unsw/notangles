export const to24Hour = (n: number) => {
  let result = `${String((n / 1) >> 0)}:`;
  if ((n % 1) * 60) {
    if ((n % 1) * 60 < 10) {
      result += '0';
    }
    result += `${String(((n % 1) * 60) >> 0)}`;
  } else {
    result += '00';
  }
  return result;
};
