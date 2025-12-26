export function isPrimitive(value: any): boolean {
  return ["string", "number", "bigint", "boolean"].includes(typeof value);
}
