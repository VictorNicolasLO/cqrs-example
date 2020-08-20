export function removeUndefinedProps(object: any) {
  const finalObject = {};
  Object.keys(object).forEach(key => {
    if (object[key] !== undefined) {
      finalObject[key] = object[key];
    }
  });
  return finalObject;
}
