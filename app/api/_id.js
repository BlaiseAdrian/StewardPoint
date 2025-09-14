import { ObjectId } from "mongodb";

export function toId(id) {
  if (!id) return id;
  if (id instanceof ObjectId) return id;
  if (typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id)) return new ObjectId(id);
  return id; // allow legacy string ids if any
}
export function asStringId(x) {
  try { return String(x); } catch { return x; }
}
