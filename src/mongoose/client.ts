import mongoose from 'mongoose';
import { User, UserSchema } from './user';

export const ClientSchema = new mongoose.Schema(
  {
    favotiteStores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Store' }],
  },
  {
    timestamps: true,
  },
);

ClientSchema.add(UserSchema.obj);

export interface Client extends User {
  favotiteStores: mongoose.Schema.Types.ObjectId[];
}
