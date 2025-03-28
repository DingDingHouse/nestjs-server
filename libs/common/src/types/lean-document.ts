import { HydratedDocument, FlattenMaps } from 'mongoose';

export type LeanDocument<T> = Omit<FlattenMaps<T>, keyof HydratedDocument<T>>;
