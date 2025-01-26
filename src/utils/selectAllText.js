// hack for mobile safari ¯\_(ツ)_/¯
export const selectAllText = event =>
  event.target.setSelectionRange(0, event.target.value.length);
