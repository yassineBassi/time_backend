import mongoose from 'mongoose';
import { User, UserSchema } from './user';

export const ClientSchema = new mongoose.Schema(
  {},
  {
    timestamps: true,
  },
);

ClientSchema.add(UserSchema.obj);

export interface Client extends User {}
