import { Types } from 'mongoose';

export type Lean<T> = {
  [K in keyof T]: T[K] extends Types.ObjectId ? string | Types.ObjectId : T[K];
};
