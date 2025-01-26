export const classNames = (...classNames: (string | undefined | boolean)[]): string =>
  classNames.filter(Boolean).join(' ');
