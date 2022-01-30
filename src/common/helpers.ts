import { mongoose } from '@typegoose/typegoose';
import ObjectId = mongoose.Types.ObjectId;

export function toObjectIdUndef(id: ObjectId | string | undefined): ObjectId | undefined {
  if (typeof id === 'string') {
    return new ObjectId(id);
  }
  if (id instanceof ObjectId) {
    return id;
  }
  if (!id) {
    return undefined;
  }
  throw new Error(`Wrong ObjectId: ${id}`);
}

export function toObjectId(id: ObjectId | string): ObjectId {
  const res = toObjectIdUndef(id);
  if (!res) {
    throw new Error(`ObjectId is wrong or undefined: ${id}`);
  }
  return res;
}

export function leanObject<T>(obj: T): T {
  // @ts-ignore
  if (obj?.toObject) {
    // @ts-ignore
    return obj.toObject();
  }
  return obj;
}

export function getEnv(name: string): string {
  const value = process.env[name];
  if (value == null) {
    throw new Error(`Environment variable '${name}' isn't defined`);
  }
  return value;
}
