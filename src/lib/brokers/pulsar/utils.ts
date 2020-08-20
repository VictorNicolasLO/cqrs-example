export function jsonToBuffer(object: any) {
  return Buffer.from(JSON.stringify(object));
}
