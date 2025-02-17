import mongoose from 'mongoose';
import { User, UserSchema } from './user';
import * as mongooseDelete from 'mongoose-delete';

export const ClientSchema = new mongoose.Schema(
  {
    favotiteStores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Store' }],
  },
  {
    timestamps: true,
  },
);

ClientSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: true,
  restore: true,
});

ClientSchema.add(UserSchema.obj);

export interface Client extends User {
  favotiteStores: mongoose.Schema.Types.ObjectId[];
}

export type ClientModel = mongooseDelete.SoftDeleteModel<Client>;
